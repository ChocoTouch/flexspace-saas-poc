import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { QrService } from './qr.service';
import { PrismaService } from '../prisma/prisma.service';

describe('QrService', () => {
  let service: QrService;
  const mockPrismaService = {
    reservation: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    accessLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-qr-secret-key-for-testing'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<QrService>(QrService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateQRCode', () => {
    it('should generate QR code for valid reservation', async () => {
      const mockReservation = {
        id: 'res-1',
        userId: 'user-1',
        spaceId: 'space-1',
        startTime: new Date('2026-02-01T09:00:00.000Z'),
        endTime: new Date('2026-02-01T11:00:00.000Z'),
        status: 'ACTIVE',
        user: { id: 'user-1' },
        space: { id: 'space-1' },
      };

      mockPrismaService.reservation.findUnique.mockResolvedValue(mockReservation);
      mockPrismaService.reservation.update.mockResolvedValue({});

      const result = await service.generateQRCode('res-1');

      expect(result).toHaveProperty('qrCode');
      expect(result).toHaveProperty('qrSignature');
      expect(result).toHaveProperty('payload');
      expect(result.payload.reservationId).toBe('res-1');
      expect(result.qrCode).toContain('data:image/png;base64');
      expect(mockPrismaService.reservation.update).toHaveBeenCalled();
    });

    it('should reject if reservation not found', async () => {
      mockPrismaService.reservation.findUnique.mockResolvedValue(null);

      await expect(service.generateQRCode('invalid-id')).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.reservation.update).not.toHaveBeenCalled();
    });

    it('should reject if reservation is cancelled', async () => {
      const mockReservation = {
        id: 'res-1',
        status: 'CANCELLED',
      };

      mockPrismaService.reservation.findUnique.mockResolvedValue(mockReservation);

      await expect(service.generateQRCode('res-1')).rejects.toThrow(BadRequestException);
      await expect(service.generateQRCode('res-1')).rejects.toThrow(
        "La réservation n'est pas active",
      );
    });

    it('should reject if reservation is completed', async () => {
      const mockReservation = {
        id: 'res-1',
        status: 'COMPLETED',
      };

      mockPrismaService.reservation.findUnique.mockResolvedValue(mockReservation);

      await expect(service.generateQRCode('res-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyQRCode', () => {
    // it('should deny access for expired QR code', async () => {
    //   const payload = {
    //     reservationId: 'res-1',
    //     userId: 'user-1',
    //     spaceId: 'space-1',
    //     validFrom: new Date(Date.now() - 7200000).toISOString(), // 2h ago
    //     validUntil: new Date(Date.now() - 3600000).toISOString(), // 1h ago (expired)
    //     iat: Date.now() - 7200000,
    //   };

    //   // Signature correcte pour ce payload
    //   const signature = 'any-signature'; // Sera recalculé par le service
    //   const qrData = { ...payload, signature };
    //   const qrDataString = Buffer.from(JSON.stringify(qrData)).toString('base64');

    //   const result = await service.verifyQRCode(qrDataString);

    //   expect(result.accessGranted).toBe(false);
    //   expect(result.reason).toBe('QR_CODE_EXPIRED');
    //   expect(result.message).toBe('QR Code expiré');
    // });

    // it('should deny access for not yet valid QR code', async () => {
    //   const payload = {
    //     reservationId: 'res-1',
    //     userId: 'user-1',
    //     spaceId: 'space-1',
    //     validFrom: new Date(Date.now() + 3600000).toISOString(), // 1h from now
    //     validUntil: new Date(Date.now() + 7200000).toISOString(), // 2h from now
    //     iat: Date.now(),
    //   };

    //   const signature = 'any-signature';
    //   const qrData = { ...payload, signature };
    //   const qrDataString = Buffer.from(JSON.stringify(qrData)).toString('base64');

    //   const result = await service.verifyQRCode(qrDataString);

    //   expect(result.accessGranted).toBe(false);
    //   expect(result.reason).toBe('NOT_YET_VALID');
    // });

    it('should deny access for invalid signature', async () => {
      const payload = {
        reservationId: 'res-1',
        userId: 'user-1',
        spaceId: 'space-1',
        validFrom: new Date(Date.now() - 3600000).toISOString(),
        validUntil: new Date(Date.now() + 3600000).toISOString(),
        iat: Date.now(),
      };

      const invalidSignature = 'wrong-signature-12345';
      const qrData = { ...payload, signature: invalidSignature };
      const qrDataString = Buffer.from(JSON.stringify(qrData)).toString('base64');

      const result = await service.verifyQRCode(qrDataString);

      expect(result.accessGranted).toBe(false);
      expect(result.reason).toBe('INVALID_SIGNATURE');
    });

    it('should deny access for invalid QR data format', async () => {
      const invalidData = 'not-a-valid-base64-json';

      const result = await service.verifyQRCode(invalidData);

      expect(result.accessGranted).toBe(false);
      expect(result.reason).toBe('INVALID_QR_DATA');
      expect(result.message).toBe('Données QR Code invalides');
    });
  });

  describe('getAccessLogs', () => {
    it('should return access logs for a reservation', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          reservationId: 'res-1',
          userId: 'user-1',
          accessTime: new Date(),
          accessGranted: true,
          method: 'QR_CODE',
          user: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      ];

      mockPrismaService.accessLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getAccessLogs('res-1');

      expect(result).toEqual(mockLogs);
      expect(result).toHaveLength(1);
      expect(result[0].accessGranted).toBe(true);
    });
  });
});
