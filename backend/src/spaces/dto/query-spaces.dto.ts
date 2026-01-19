import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { SpaceType } from '@prisma/client';
import { Type } from 'class-transformer';

export class QuerySpacesDto {
  @IsEnum(SpaceType)
  @IsOptional()
  type?: SpaceType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsString()
  @IsOptional()
  building?: string;

  @IsString()
  @IsOptional()
  search?: string; // Recherche dans le nom
}
