import { MaintenanceResult, MaintenanceType } from '../../generated/prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateMaintenanceLogDto {
  @IsUUID()
  machineId!: string;

  @IsOptional()
  @IsUUID()
  maintenancePlanId?: string;

  @IsDateString()
  performedAt!: string;

  @IsEnum(MaintenanceType)
  type!: MaintenanceType;

  @IsEnum(MaintenanceResult)
  result!: MaintenanceResult;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  notes?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  performedBy!: string;
}
