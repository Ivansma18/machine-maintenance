import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';
import { RequirePermission } from '../authorization/decorators/require-permission.decorator';
import { auditContextFromRequest } from '../audit/audit-context';
import type { AuthenticatedRequest } from '../authorization/types/authenticated-request.type';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { AssignUserScopesDto } from './dto/assign-user-scopes.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UsersService } from './users.service';

@Controller('users')
@RequirePermission('users:manage')
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get() findAll() {
    return this.users.findAll();
  }
  @Get('roles') roles() {
    return this.users.roles();
  }
  @Post() create(@Body() dto: CreateUserDto, @Req() request: AuthenticatedRequest) {
    return this.users.create(dto, auditContextFromRequest(request));
  }
  @Patch(':id/status') updateStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.users.updateStatus(id, dto.isActive, auditContextFromRequest(request));
  }
  @Patch(':id/roles') assignRoles(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AssignUserRolesDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.users.assignRoles(id, dto, auditContextFromRequest(request));
  }
  @Post(':id/reset-password') resetPassword(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.users.resetPassword(id, auditContextFromRequest(request));
  }
  @Patch(':id/scopes') assignScopes(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AssignUserScopesDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.users.assignScopes(id, dto.scopes, auditContextFromRequest(request));
  }
}
