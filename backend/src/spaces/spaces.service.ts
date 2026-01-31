import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpaceDto, UpdateSpaceDto, QuerySpacesDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SpacesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer un nouvel espace
   */
  async create(dto: CreateSpaceDto) {
    // Validation métier : horaires cohérents
    this.validateTimeRange(dto.openTime, dto.closeTime);

    return this.prisma.space.create({
      data: {
        name: dto.name,
        type: dto.type,
        capacity: dto.capacity,
        floor: dto.floor,
        building: dto.building,
        openTime: dto.openTime,
        closeTime: dto.closeTime,
      },
    });
  }

  /**
   * Lister tous les espaces avec filtres optionnels
   */
  async findAll(query: QuerySpacesDto) {
    const where: Prisma.SpaceWhereInput = {
      isActive: true, // Seulement les espaces actifs par défaut
    };

    // Filtre par type
    if (query.type) {
      where.type = query.type;
    }

    // Filtre par capacité minimale
    if (query.capacity) {
      where.capacity = {
        gte: query.capacity,
      };
    }

    // Filtre par étage
    if (query.floor) {
      where.floor = query.floor;
    }

    // Filtre par bâtiment
    if (query.building) {
      where.building = query.building;
    }

    // Recherche par nom
    if (query.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    return this.prisma.space.findMany({
      where,
      orderBy: [{ building: 'asc' }, { floor: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Récupérer un espace par ID
   */
  async findOne(id: string) {
    const space = await this.prisma.space.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            reservations: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    });

    if (!space) {
      throw new NotFoundException(`Espace avec l'ID ${id} non trouvé`);
    }

    return space;
  }

  /**
   * Mettre à jour un espace
   */
  async update(id: string, dto: UpdateSpaceDto) {
    // Vérifier que l'espace existe
    const existingSpace = await this.prisma.space.findUnique({ where: { id } });

    if (!existingSpace) {
      throw new NotFoundException('Espace introuvable');
    }

    // Validation des horaires si modifiés
    if (dto.openTime || dto.closeTime) {
      const openTime = dto.openTime ?? existingSpace.openTime;
      const closeTime = dto.closeTime ?? existingSpace.closeTime;
      this.validateTimeRange(openTime, closeTime);
    }

    return this.prisma.space.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Supprimer un espace (soft delete)
   */
  async remove(id: string) {
    // Vérifier que l'espace existe
    await this.findOne(id);

    // Vérifier qu'il n'y a pas de réservations actives
    const activeReservations = await this.prisma.reservation.count({
      where: {
        spaceId: id,
        status: 'ACTIVE',
        endTime: {
          gte: new Date(),
        },
      },
    });

    if (activeReservations > 0) {
      throw new BadRequestException(
        `Impossible de supprimer cet espace : ${activeReservations} réservation(s) active(s) en cours`,
      );
    }

    // Soft delete
    return this.prisma.space.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Statistiques d'un espace
   */
  async getStatistics(id: string) {
    const space = await this.findOne(id);

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const reservationsThisWeek = await this.prisma.reservation.count({
      where: {
        spaceId: id,
        status: 'ACTIVE',
        startTime: {
          gte: startOfWeek,
        },
      },
    });

    const totalReservations = await this.prisma.reservation.count({
      where: {
        spaceId: id,
      },
    });

    return {
      space,
      statistics: {
        totalReservations,
        reservationsThisWeek,
      },
    };
  }

  /**
   * Valider que closeTime > openTime
   */
  private validateTimeRange(openTime: string, closeTime: string) {
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);

    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    if (closeMinutes <= openMinutes) {
      throw new BadRequestException("L'heure de fermeture doit être après l'heure d'ouverture");
    }

    if (openMinutes < 6 * 60 || closeMinutes > 23 * 60) {
      throw new BadRequestException('Les horaires doivent être entre 06:00 et 23:00');
    }
  }
}
