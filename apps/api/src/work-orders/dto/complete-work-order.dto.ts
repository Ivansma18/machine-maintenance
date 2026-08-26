import { MaintenanceResult } from '../../generated/prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CompleteWorkOrderDto {
  @IsEnum(MaintenanceResult)
  result!: MaintenanceResult;

  @IsOptional()
  @IsDateString()
  performedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  notes?: string;
}
