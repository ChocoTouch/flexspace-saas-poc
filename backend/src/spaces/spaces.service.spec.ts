import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SpacesService', () => {
  let service: SpacesService;

  const mockPrismaService = {
    space: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    reservation: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpacesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SpacesService>(SpacesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a space successfully', async () => {
      const createDto = {
        name: 'Test Space',
        type: 'DESK' as const,
        capacity: 1,
        openTime: '08:00',
        closeTime: '18:00',
      };

      mockPrismaService.space.create.mockResolvedValue({
        id: '1',
        ...createDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createDto);

      expect(result.name).toBe(createDto.name);
      expect(mockPrismaService.space.create).toHaveBeenCalled();
    });

    it('should throw error if closeTime <= openTime', async () => {
      const createDto = {
        name: 'Test Space',
        type: 'DESK' as const,
        capacity: 1,
        openTime: '18:00',
        closeTime: '08:00', // Invalid: before openTime
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if space not found', async () => {
      mockPrismaService.space.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should prevent deletion if active reservations exist', async () => {
      const spaceId = 'space-1';

      mockPrismaService.space.findUnique.mockResolvedValue({
        id: spaceId,
        name: 'Test Space',
      });

      mockPrismaService.reservation.count.mockResolvedValue(2); // 2 active reservations

      await expect(service.remove(spaceId)).rejects.toThrow(BadRequestException);
    });
  });
});
