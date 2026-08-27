import { IsEmail, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString() @MinLength(3) @MaxLength(100) username!: string;
  @IsEmail() @MaxLength(255) email!: string;
  @IsString() @MinLength(2) @MaxLength(150) name!: string;
  @IsString() @MinLength(12) @MaxLength(200) password!: string;
  @IsOptional() @IsUUID('4', { each: true }) roleIds?: string[];
}
