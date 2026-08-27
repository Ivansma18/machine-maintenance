import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { ScopeLevel } from '../../generated/prisma/client';

export class UserScopeDto {
  @IsEnum(ScopeLevel) level!: ScopeLevel;
  @IsOptional() @IsUUID() siteId?: string;
  @IsOptional() @IsUUID() areaId?: string;
}

export class AssignUserScopesDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => UserScopeDto) scopes!: UserScopeDto[];
}
