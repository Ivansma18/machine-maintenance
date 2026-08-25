import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { AUTH_SESSION_COOKIE } from './auth.constants';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { AuthenticatedIdentity } from './types/auth.types';

@Controller('auth')
export class AuthController {
  private readonly cookieName: string;
  private readonly cookieSecure: boolean;
  private readonly cookieMaxAge: number;

  constructor(
    private readonly authService: AuthService,
    config: ConfigService,
  ) {
    this.cookieName = config.get<string>('AUTH_SESSION_COOKIE', AUTH_SESSION_COOKIE);
    this.cookieSecure = config.get<string>('NODE_ENV', 'development') === 'production';
    const idleDays = Number(config.get<string>('AUTH_SESSION_IDLE_DAYS', '7'));
    this.cookieMaxAge =
      (Number.isFinite(idleDays) && idleDays > 0 ? idleDays : 7) * 24 * 60 * 60 * 1000;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const session = await this.authService.login(dto.identifier, dto.password);

    response.cookie(this.cookieName, session.token, this.cookieOptions());

    return this.publicIdentity(session.identity);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(request.cookies?.[this.cookieName]);
    response.clearCookie(this.cookieName, this.cookieOptions());

    return { success: true };
  }

  @Get('me')
  async me(@Req() request: Request) {
    const identity = await this.authService.validateSession(request.cookies?.[this.cookieName]);

    if (!identity) {
      throw new UnauthorizedException('Authentication required');
    }

    return this.publicIdentity(identity);
  }

  private publicIdentity(identity: AuthenticatedIdentity) {
    return {
      user: identity.user,
      roles: identity.roles,
      permissions: identity.permissions,
    };
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: this.cookieSecure,
      path: '/',
      maxAge: this.cookieMaxAge,
    };
  }
}
