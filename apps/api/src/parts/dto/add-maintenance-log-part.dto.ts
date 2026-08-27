import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class AddMaintenanceLogPartDto {
  @IsString() partId!: string;
  @IsNumber() @Min(0.000001) quantity!: number;
  @IsOptional() @IsString() @MaxLength(10000) notes?: string;
}
