import { PartUnit } from '../../generated/prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePartDto {
  @IsString() @IsNotEmpty() @MaxLength(100) sku!: string;
  @IsString() @IsNotEmpty() @MaxLength(180) name!: string;
  @IsOptional() @IsString() @MaxLength(10000) description?: string;
  @IsEnum(PartUnit) unit!: PartUnit;
  @IsOptional() @IsString() @MaxLength(100) manufacturer?: string;
  @IsOptional() @IsString() @MaxLength(100) manufacturerPartNumber?: string;
  @IsOptional() @IsBoolean() isCritical?: boolean;
  @IsOptional() @IsNumber() @Min(0) initialQuantity = 0;
  @IsOptional() @IsNumber() @Min(0) minimumQuantity = 0;
  @IsOptional() @IsNumber() @Min(0) reorderQuantity?: number;
  @IsOptional() @IsNumber() @Min(0) unitCost?: number;
}
