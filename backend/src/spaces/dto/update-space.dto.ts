import { PartialType } from '@nestjs/mapped-types';
import { CreateSpaceDto } from './create-space.dto';
import { IsBoolean, IsOptional } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateSpaceDto extends PartialType(CreateSpaceDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
