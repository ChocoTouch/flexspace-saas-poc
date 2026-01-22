import { IsUUID, IsDateString, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReservationDto {
  @IsUUID()
  spaceId: string;

  @IsDateString()
  startTime: string; // ISO 8601: "2026-01-15T09:00:00.000Z"

  @IsDateString()
  endTime: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  overrideConflict?: boolean; // Pour manager priority
}