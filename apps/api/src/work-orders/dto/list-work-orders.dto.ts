import { Transform, Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { WorkOrderPriority, WorkOrderStatus, WorkOrderType } from '../../generated/prisma/client';

export class ListWorkOrdersDto {
  @IsOptional() @IsUUID() machineId?: string;
  @IsOptional() @IsUUID() maintenancePlanId?: string;
  @IsOptional() @IsUUID() assignedToUserId?: string;
  @IsOptional() @IsEnum(WorkOrderType) type?: WorkOrderType;
  @IsOptional() @IsEnum(WorkOrderPriority) priority?: WorkOrderPriority;
  @IsOptional() @IsEnum(WorkOrderStatus) status?: WorkOrderStatus;
  @IsOptional() @IsDateString() dueFrom?: string;
  @IsOptional() @IsDateString() dueTo?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}
