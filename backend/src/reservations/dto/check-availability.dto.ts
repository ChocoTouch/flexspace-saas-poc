import { IsUUID, IsDateString } from 'class-validator';

export class CheckAvailabilityDto {
  @IsUUID()
  spaceId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
