import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
export class CreateProductionLineDto {
  @IsUUID() areaId!: string;
  @IsString() @IsNotEmpty() @MaxLength(150) name!: string;
}
