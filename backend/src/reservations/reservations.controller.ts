import { Controller, Get, Post, Body, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, QueryReservationsDto, CheckAvailabilityDto } from './dto';
import { CurrentUser } from '../auth/decorators';
import { Role } from '@prisma/client';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * POST /api/reservations
   * Créer une nouvelle réservation
   */
  @Post()
  create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    return this.reservationsService.create(userId, userRole, createReservationDto);
  }

  /**
   * GET /api/reservations
   * Lister mes réservations (ou toutes si ADMIN)
   */
  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
    @Query() query: QueryReservationsDto,
  ) {
    return this.reservationsService.findAll(userId, userRole, query);
  }

  /**
   * POST /api/reservations/check-availability
   * Vérifier la disponibilité avant de réserver
   */
  @Post('check-availability')
  checkAvailability(@Body() checkAvailabilityDto: CheckAvailabilityDto) {
    return this.reservationsService.checkAvailability(checkAvailabilityDto);
  }

  /**
   * GET /api/reservations/:id
   * Récupérer une réservation par ID
   */
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.reservationsService.findOne(id, userId, userRole);
  }

  /**
   * DELETE /api/reservations/:id
   * Annuler une réservation
   */
  @Delete(':id')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.reservationsService.cancel(id, userId, userRole);
  }
}
