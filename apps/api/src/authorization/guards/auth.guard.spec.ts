import { UnauthorizedException } from '@nestjs/common';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  const authService = {
    validateSession: jest.fn(),
  };
  const reflector = {
    getAllAndOverride: jest.fn(),
  };
  const config = {
    get: jest.fn((_key: string, fallback: string) => fallback),
  };
  const guard = new AuthGuard(authService as never, reflector as never, config as never);

  const context = (request: Record<string, unknown>) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    }) as never;

  beforeEach(() => {
    jest.clearAllMocks();
    reflector.getAllAndOverride.mockReturnValue(false);
  });

  it('allows public routes without validating a session', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(context({}))).resolves.toBe(true);
    expect(authService.validateSession).not.toHaveBeenCalled();
  });

  it('returns 401 when a protected route has no valid session', async () => {
    authService.validateSession.mockResolvedValue(null);

    await expect(guard.canActivate(context({ cookies: {} }))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('attaches the identity to a protected request', async () => {
    const identity = { user: { id: 'user-id' }, roles: ['Viewer'], permissions: ['machines:read'] };
    authService.validateSession.mockResolvedValue(identity);

    const request = { cookies: { mm_session: 'token' } };
    await expect(guard.canActivate(context(request))).resolves.toBe(true);

    expect(authService.validateSession).toHaveBeenCalledWith('token');
    expect(request).toEqual(expect.objectContaining({ identity }));
  });
});
