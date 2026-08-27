import {
  IsDateString,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMaintenancePlanDto {
  @IsUUID()
  machineId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsInt()
  @Min(1)
  frequencyDays!: number;

  @IsInt()
  @Min(1)
  warningDaysBefore!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsDateString()
  startsAt!: string;
}
