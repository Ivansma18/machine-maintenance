import { IsUUID } from 'class-validator';

export class AssignUserRolesDto {
  @IsUUID('4', { each: true }) roleIds!: string[];
}
