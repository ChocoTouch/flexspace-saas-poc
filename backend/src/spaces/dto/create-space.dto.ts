import { IsString, IsEnum, IsInt, Min, Max, IsOptional, Matches } from 'class-validator';
import { SpaceType } from '@prisma/client';

export class CreateSpaceDto {
  @IsString()
  name: string;

  @IsEnum(SpaceType, {
    message: 'Type invalide. Utilisez: DESK, MEETING_ROOM, ou COLLABORATIVE_SPACE',
  })
  type: SpaceType;

  @IsInt({ message: 'La capacité doit être un nombre entier' })
  @Min(1, { message: 'La capacité doit être au moins 1' })
  @Max(100, { message: 'La capacité ne peut pas dépasser 100' })
  capacity: number;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsString()
  @IsOptional()
  building?: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Format horaire invalide. Utilisez HH:mm (ex: 08:00)',
  })
  openTime: string; // Format "08:00"

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Format horaire invalide. Utilisez HH:mm (ex: 20:00)',
  })
  closeTime: string; // Format "20:00"
}
