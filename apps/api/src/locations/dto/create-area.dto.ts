import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
export class CreateAreaDto {
  @IsUUID() siteId!: string;
  @IsString() @IsNotEmpty() @MaxLength(150) name!: string;
}
