import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { QRPayload, VerifyResult } from './types/qr.types';

@Injectable()
export class QrService {
  private readonly qrSecret: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.qrSecret = this.configService.get<string>('QR_SECRET') || 'default-qr-secret';
  }

  /**
   * Générer un QR Code pour une réservation
   */
  async generateQRCode(reservationId: string): Promise<{
    qrCode: string;
    qrSignature: string;
    payload: QRPayload;
  }> {
    // Récupérer la réservation
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        user: true,
        space: true,
      },
    });

    if (!reservation) {
      throw new BadRequestException('Réservation non trouvée');
    }

    if (reservation.status !== 'ACTIVE') {
      throw new BadRequestException("La réservation n'est pas active");
    }

    // Créer le payload
    const payload: QRPayload = {
      reservationId: reservation.id,
      userId: reservation.userId,
      spaceId: reservation.spaceId,
      validFrom: reservation.startTime.toISOString(),
      validUntil: reservation.endTime.toISOString(),
      iat: Date.now(),
    };

    // Générer la signature HMAC-SHA256
    const signature = this.generateSignature(payload);

    // Créer les données du QR (payload + signature)
    const qrData = {
      ...payload,
      signature,
    };

    // Encoder en Base64
    const qrDataString = Buffer.from(JSON.stringify(qrData)).toString('base64');

    // Générer le QR Code (image PNG en base64)
    const qrCodeImage = await QRCode.toDataURL(qrDataString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
    });

    // Sauvegarder dans la base
    await this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        qrCode: qrCodeImage,
        qrSignature: signature,
      },
    });

    return {
      qrCode: qrCodeImage,
      qrSignature: signature,
      payload,
    };
  }

  /**
   * Vérifier un QR Code
   */
  async verifyQRCode(qrDataString: string): Promise<VerifyResult> {
    const now = new Date();

    try {
      // Décoder le Base64
      const decoded = Buffer.from(qrDataString, 'base64').toString('utf-8');

      const parsed: unknown = JSON.parse(decoded);

      const qrData = parsed as QRPayload & { signature: string };

      const { signature, ...payload } = qrData;

      // Vérifier la signature
      const expectedSignature = this.generateSignature(payload);
      if (signature !== expectedSignature) {
        return {
          valid: false,
          accessGranted: false,
          reason: 'INVALID_SIGNATURE',
          message: 'Signature QR Code invalide',
          accessTime: now,
        };
      }

      // Vérifier la validité temporelle
      const validFrom = new Date(payload.validFrom);
      const validUntil = new Date(payload.validUntil);

      if (now < validFrom) {
        return {
          valid: false,
          accessGranted: false,
          reason: 'NOT_YET_VALID',
          message: 'QR Code pas encore valide',
          accessTime: now,
        };
      }

      if (now > validUntil) {
        return {
          valid: false,
          accessGranted: false,
          reason: 'QR_CODE_EXPIRED',
          message: 'QR Code expiré',
          accessTime: now,
        };
      }

      // Vérifier que la réservation existe et est active
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: payload.reservationId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          space: {
            select: {
              id: true,
              name: true,
              floor: true,
              building: true,
            },
          },
        },
      });

      if (!reservation) {
        return {
          valid: false,
          accessGranted: false,
          reason: 'RESERVATION_NOT_FOUND',
          message: 'Réservation non trouvée',
          accessTime: now,
        };
      }

      if (reservation.status === 'CANCELLED') {
        return {
          valid: false,
          accessGranted: false,
          reason: 'RESERVATION_CANCELLED',
          message: 'Réservation annulée',
          accessTime: now,
        };
      }

      if (reservation.status === 'COMPLETED') {
        return {
          valid: false,
          accessGranted: false,
          reason: 'RESERVATION_COMPLETED',
          message: 'Réservation déjà terminée',
          accessTime: now,
        };
      }

      // Logger l'accès
      await this.prisma.accessLog.create({
        data: {
          reservationId: reservation.id,
          userId: reservation.userId,
          accessGranted: true,
          method: 'QR_CODE',
        },
      });

      // Accès accordé !
      return {
        valid: true,
        accessGranted: true,
        reservation: {
          id: reservation.id,
          space: reservation.space,
          user: reservation.user,
          validFrom: payload.validFrom,
          validUntil: payload.validUntil,
        },
        message: 'Accès autorisé',
        accessTime: now,
      };
    } catch (error) {
      // Logger la tentative d'accès échouée
      console.error('QR verification error:', error);

      return {
        valid: false,
        accessGranted: false,
        reason: 'INVALID_QR_DATA',
        message: 'Données QR Code invalides',
        accessTime: now,
      };
    }
  }

  /**
   * Générer une signature HMAC-SHA256
   */
  private generateSignature(payload: QRPayload): string {
    const data = JSON.stringify({
      reservationId: payload.reservationId,
      userId: payload.userId,
      spaceId: payload.spaceId,
      validFrom: payload.validFrom,
      validUntil: payload.validUntil,
      iat: payload.iat,
    });

    return crypto.createHmac('sha256', this.qrSecret).update(data).digest('hex');
  }

  /**
   * Récupérer les logs d'accès d'une réservation
   */
  async getAccessLogs(reservationId: string) {
    return this.prisma.accessLog.findMany({
      where: { reservationId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        accessTime: 'desc',
      },
    });
  }
}
