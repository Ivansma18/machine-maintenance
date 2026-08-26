import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CancelWorkOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason!: string;
}
