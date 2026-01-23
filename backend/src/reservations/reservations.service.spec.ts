import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReservationsService', () => {
  let service: ReservationsService;

  const mockPrismaService = {
    space: {
      findUnique: jest.fn(),
    },
    reservation: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - conflict detection', () => {
    const mockSpace = {
      id: 'space-1',
      name: 'Test Space',
      type: 'DESK',
      capacity: 1,
      openTime: '08:00',
      closeTime: '20:00',
      isActive: true,
    };

    beforeEach(() => {
      mockPrismaService.space.findUnique.mockResolvedValue(mockSpace);
    });

    it('should create reservation when no conflicts', async () => {
      const dto = {
        spaceId: 'space-1',
        startTime: '2026-02-24T09:00:00.000Z',
        endTime: '2026-02-24T11:00:00.000Z',
      };

      mockPrismaService.reservation.findMany.mockResolvedValue([]); // No conflicts
      mockPrismaService.reservation.create.mockResolvedValue({
        id: 'res-1',
        ...dto,
        userId: 'user-1',
        status: 'ACTIVE',
      });

      const result = await service.create('user-1', 'EMPLOYEE', dto);

      expect(result).toBeDefined();
      expect(mockPrismaService.reservation.create).toHaveBeenCalled();
    });

    it('should detect overlap at start', async () => {
      const dto = {
        spaceId: 'space-1',
        startTime: '2026-02-24T10:00:00.000Z', // Overlaps existing 09:00-11:00
        endTime: '2026-02-24T12:00:00.000Z',
      };

      mockPrismaService.reservation.findMany.mockResolvedValue([
        {
          id: 'existing',
          startTime: new Date('2026-02-24T09:00:00.000Z'),
          endTime: new Date('2026-02-24T11:00:00.000Z'),
          user: { id: 'user-2', firstName: 'Jane', lastName: 'Doe', role: 'EMPLOYEE' },
        },
      ]);

      await expect(service.create('user-1', 'EMPLOYEE', dto)).rejects.toThrow(ConflictException);
    });

    it('should allow manager to override employee', async () => {
      const dto = {
        spaceId: 'space-1',
        startTime: '2026-02-24T09:00:00.000Z',
        endTime: '2026-02-24T11:00:00.000Z',
        overrideConflict: true,
      };

      mockPrismaService.reservation.findMany.mockResolvedValue([
        {
          id: 'existing',
          startTime: new Date('2026-02-24T09:00:00.000Z'),
          endTime: new Date('2026-02-24T10:00:00.000Z'),
          user: { id: 'user-2', firstName: 'Jane', lastName: 'Doe', role: 'EMPLOYEE' },
        },
      ]);

      mockPrismaService.reservation.update.mockResolvedValue({});
      mockPrismaService.reservation.create.mockResolvedValue({
        id: 'new-res',
        ...dto,
      });

      const result = await service.create('manager-1', 'MANAGER', dto);

      expect(result).toBeDefined();
      expect(mockPrismaService.reservation.update).toHaveBeenCalledWith({
        where: { id: 'existing' },
        data: { status: 'CANCELLED' },
      });
    });

    // it('should reject reservation before opening hours', async () => {
    //   const dto = {
    //     spaceId: 'space-1',
    //     startTime: '2026-02-24T07:00:00.000Z', // Before 08:00
    //     endTime: '2026-02-24T09:00:00.000Z',
    //   };

    //   mockPrismaService.reservation.findMany.mockResolvedValue([]);

    //   await expect(service.create('user-1', 'EMPLOYEE', dto)).rejects.toThrow(BadRequestException);
    // });

    it('should reject reservation shorter than 30 min', async () => {
      const dto = {
        spaceId: 'space-1',
        startTime: '2026-02-24T09:00:00.000Z',
        endTime: '2026-02-24T09:20:00.000Z', // Only 20 min
      };

      await expect(service.create('user-1', 'EMPLOYEE', dto)).rejects.toThrow(BadRequestException);
    });
  });
});
