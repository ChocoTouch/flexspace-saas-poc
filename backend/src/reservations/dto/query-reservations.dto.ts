import { IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class QueryReservationsDto {
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsUUID()
  @IsOptional()
  spaceId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
