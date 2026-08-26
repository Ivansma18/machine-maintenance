import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { WorkOrderPriority, WorkOrderType } from '../../generated/prisma/client';

export class CreateWorkOrderDto {
  @IsUUID()
  machineId!: string;

  @IsOptional()
  @IsUUID()
  maintenancePlanId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsEnum(WorkOrderType)
  type!: WorkOrderType;

  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsUUID()
  assignedToUserId?: string;
}
