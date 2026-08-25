import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { REQUIRED_PERMISSION_KEY } from '../authorization.constants';
import type { AuthenticatedRequest } from '../types/authenticated-request.type';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredPermission = this.reflector.getAllAndOverride<string>(REQUIRED_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.identity?.permissions.includes(requiredPermission)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
