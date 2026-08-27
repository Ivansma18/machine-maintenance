import { MaintenanceResult, MaintenanceType } from '../../generated/prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class ListMaintenanceLogsDto {
  @IsOptional()
  @IsUUID()
  machineId?: string;

  @IsOptional()
  @IsUUID()
  maintenancePlanId?: string;

  @IsOptional()
  @IsEnum(MaintenanceType)
  type?: MaintenanceType;

  @IsOptional()
  @IsEnum(MaintenanceResult)
  result?: MaintenanceResult;

  @IsOptional()
  @IsDateString()
  performedFrom?: string;

  @IsOptional()
  @IsDateString()
  performedTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
