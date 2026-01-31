import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto, QueryReservationsDto, CheckAvailabilityDto } from './dto';
import { Role, Space, Prisma } from '@prisma/client';
import { QrService } from '../qr/qr.service';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private qrService: QrService,
  ) {}

  /**
   * Créer une nouvelle réservation
   */
  async create(userId: string, userRole: Role, dto: CreateReservationDto) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    // Validations métier
    this.validateReservationTimes(startTime, endTime);

    // Vérifier que l'espace existe
    const space = await this.prisma.space.findUnique({
      where: { id: dto.spaceId },
    });

    if (!space || !space.isActive) {
      throw new NotFoundException('Espace non trouvé ou inactif');
    }

    // Vérifier les horaires d'ouverture
    this.validateSpaceHours(space, startTime, endTime);

    // Détecter les conflits
    const conflicts = await this.detectConflicts(dto.spaceId, startTime, endTime);

    if (conflicts.length > 0) {
      // Si c'est un EMPLOYEE, refuser
      if (userRole === 'EMPLOYEE') {
        throw new ConflictException({
          message: 'Cet espace est déjà réservé pour ce créneau',
          conflicts: conflicts.map((c) => ({
            id: c.id,
            startTime: c.startTime,
            endTime: c.endTime,
            user: {
              firstName: c.user.firstName,
              lastName: c.user.lastName,
              role: c.user.role,
            },
          })),
        });
      }

      // Si c'est un MANAGER/ADMIN et qu'il n'a pas explicitement demandé l'override
      if (!dto.overrideConflict) {
        throw new ConflictException({
          message: 'Conflit détecté. Vous pouvez forcer la réservation en tant que manager.',
          conflicts: conflicts.map((c) => ({
            id: c.id,
            startTime: c.startTime,
            endTime: c.endTime,
            user: {
              firstName: c.user.firstName,
              lastName: c.user.lastName,
              role: c.user.role,
            },
          })),
          canOverride: true,
        });
      }

      // MANAGER/ADMIN avec override: annuler les réservations conflictuelles (sauf autres managers/admins)
      for (const conflict of conflicts) {
        if (conflict.user.role === 'EMPLOYEE') {
          await this.prisma.reservation.update({
            where: { id: conflict.id },
            data: {
              status: 'CANCELLED',
            },
          });

          // TODO : Envoyer notification à l'utilisateur
          console.log(`Reservation ${conflict.id} cancelled by manager override`);
        } else {
          throw new ForbiddenException(
            "Vous ne pouvez pas remplacer la réservation d'un autre manager/admin",
          );
        }
      }
    }

    // Créer la réservation
    const reservation = await this.prisma.reservation.create({
      data: {
        userId,
        spaceId: dto.spaceId,
        startTime,
        endTime,
        status: 'ACTIVE',
      },
      include: {
        space: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Générer le QR Code automatiquement
    try {
      const qrResult = await this.qrService.generateQRCode(reservation.id);

      // Retourner la réservation avec le QR Code
      return {
        ...reservation,
        qrCode: qrResult.qrCode,
        qrSignature: qrResult.qrSignature,
      };
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      // Retourner quand même la réservation sans QR
      return reservation;
    }
  }

  /**
   * Lister les réservations avec filtres
   */
  async findAll(userId: string, userRole: Role, query: QueryReservationsDto) {
    const where: Prisma.ReservationWhereInput = {};

    // EMPLOYEE: voit uniquement ses réservations
    // MANAGER: voit ses réservations (TODO: + son équipe)
    // ADMIN: voit tout
    if (userRole === 'EMPLOYEE' || userRole === 'MANAGER') {
      where.userId = query.userId || userId;
    } else if (query.userId) {
      where.userId = query.userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.spaceId) {
      where.spaceId = query.spaceId;
    }

    if (query.startDate || query.endDate) {
      where.AND = [];

      if (query.startDate) {
        where.AND.push({
          endTime: {
            gte: new Date(query.startDate),
          },
        });
      }

      if (query.endDate) {
        where.AND.push({
          startTime: {
            lte: new Date(query.endDate),
          },
        });
      }
    }

    return this.prisma.reservation.findMany({
      where,
      include: {
        space: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  /**
   * Récupérer une réservation par ID
   */
  async findOne(id: string, userId: string, userRole: Role) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        space: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    // Vérifier les permissions
    if (userRole !== 'ADMIN' && reservation.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas accéder à cette réservation');
    }

    return reservation;
  }

  /**
   * Annuler une réservation
   */
  async cancel(id: string, userId: string, userRole: Role) {
    const reservation = await this.findOne(id, userId, userRole);

    if (reservation.status === 'CANCELLED') {
      throw new BadRequestException('Cette réservation est déjà annulée');
    }

    if (reservation.status === 'COMPLETED') {
      throw new BadRequestException("Impossible d'annuler une réservation terminée");
    }

    // Vérifier permissions
    if (userRole !== 'ADMIN' && reservation.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez annuler que vos propres réservations');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
      include: {
        space: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Vérifier la disponibilité d'un espace
   */
  async checkAvailability(dto: CheckAvailabilityDto) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    this.validateReservationTimes(startTime, endTime);

    const space = await this.prisma.space.findUnique({
      where: { id: dto.spaceId },
    });

    if (!space || !space.isActive) {
      throw new NotFoundException('Espace non trouvé ou inactif');
    }

    const conflicts = await this.detectConflicts(dto.spaceId, startTime, endTime);

    return {
      available: conflicts.length === 0,
      space: {
        id: space.id,
        name: space.name,
        type: space.type,
        capacity: space.capacity,
      },
      requestedSlot: {
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
      conflictingReservations: conflicts.map((c) => ({
        id: c.id,
        startTime: c.startTime,
        endTime: c.endTime,
        user: {
          firstName: c.user.firstName,
          lastName: c.user.lastName,
          role: c.user.role,
        },
      })),
    };
  }

  /**
   * Détecter les conflits horaires
   */
  private async detectConflicts(
    spaceId: string,
    startTime: Date,
    endTime: Date,
    excludeReservationId?: string,
  ) {
    const where: Prisma.ReservationWhereInput = {
      spaceId,
      status: 'ACTIVE',
      OR: [
        // Cas 1: La nouvelle réservation chevauche le début d'une existante
        {
          AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
        },
        // Cas 2: La nouvelle réservation chevauche la fin d'une existante
        {
          AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
        },
        // Cas 3: La nouvelle réservation englobe une existante
        {
          AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
        },
      ],
    };

    if (excludeReservationId) {
      where.id = { not: excludeReservationId };
    }

    return this.prisma.reservation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Valider que la réservation est cohérente
   */
  private validateReservationTimes(startTime: Date, endTime: Date) {
    const now = new Date();

    // Vérifier que les dates sont dans le futur
    if (startTime < now) {
      throw new BadRequestException('La date de début doit être dans le futur');
    }

    // Vérifier que endTime > startTime
    if (endTime <= startTime) {
      throw new BadRequestException('La date de fin doit être après la date de début');
    }

    // Vérifier durée minimale (30 min)
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = durationMs / (1000 * 60);

    if (durationMinutes < 30) {
      throw new BadRequestException('La durée minimale de réservation est de 30 minutes');
    }

    // Vérifier durée maximale (8h)
    if (durationMinutes > 480) {
      throw new BadRequestException('La durée maximale de réservation est de 8 heures');
    }

    // Vérifier que c'est le même jour
    if (startTime.toDateString() !== endTime.toDateString()) {
      throw new BadRequestException('La réservation doit être sur un seul jour');
    }
  }

  /**
   * Vérifier que la réservation respecte les horaires d'ouverture
   */
  private validateSpaceHours(
    space: Pick<Space, 'openTime' | 'closeTime'>,
    startTime: Date,
    endTime: Date,
  ) {
    const [openHour, openMin] = space.openTime.split(':').map(Number);
    const [closeHour, closeMin] = space.closeTime.split(':').map(Number);

    const startHour = startTime.getHours();
    const startMin = startTime.getMinutes();
    const endHour = endTime.getHours();
    const endMin = endTime.getMinutes();

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    if (startMinutes < openMinutes || endMinutes > closeMinutes) {
      throw new BadRequestException(
        `Cet espace est ouvert de ${space.openTime} à ${space.closeTime}`,
      );
    }
  }
}
