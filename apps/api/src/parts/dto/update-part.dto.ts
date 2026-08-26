import { PartUnit } from '../../generated/prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePartDto {
  @IsOptional() @IsString() @MaxLength(100) sku?: string;
  @IsOptional() @IsString() @MaxLength(180) name?: string;
  @IsOptional() @IsString() @MaxLength(10000) description?: string;
  @IsOptional() @IsEnum(PartUnit) unit?: PartUnit;
  @IsOptional() @IsString() @MaxLength(100) manufacturer?: string;
  @IsOptional() @IsString() @MaxLength(100) manufacturerPartNumber?: string;
  @IsOptional() @IsBoolean() isCritical?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
