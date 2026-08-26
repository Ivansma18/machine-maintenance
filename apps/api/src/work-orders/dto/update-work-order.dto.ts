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

export class UpdateWorkOrderDto {
  @IsOptional()
  @IsUUID()
  maintenancePlanId?: string | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string | null;

  @IsOptional()
  @IsEnum(WorkOrderType)
  type?: WorkOrderType;

  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string | null;

  @IsOptional()
  @IsDateString()
  dueAt?: string | null;
}
