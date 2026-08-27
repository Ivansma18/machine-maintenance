import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

import { AUTH_SESSION_COOKIE } from '../../auth/auth.constants';
import { AuthService } from '../../auth/auth.service';
import { PUBLIC_ROUTE_KEY } from '../authorization.constants';
import type { AuthenticatedRequest } from '../types/authenticated-request.type';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly cookieName: string;

  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
    config: ConfigService,
  ) {
    this.cookieName = config.get<string>('AUTH_SESSION_COOKIE', AUTH_SESSION_COOKIE);
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const identity = await this.authService.validateSession(request.cookies?.[this.cookieName]);

    if (!identity) {
      throw new UnauthorizedException('Authentication required');
    }

    request.identity = identity;
    return true;
  }
}
