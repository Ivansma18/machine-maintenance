import { IsNumber, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class AdjustInventoryDto {
  @IsNumber() delta!: number;
  @IsString() @IsNotEmpty() @MaxLength(500) reason!: string;
}
