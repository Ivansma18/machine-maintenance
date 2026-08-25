import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const authService = {
    login: jest.fn(),
    logout: jest.fn(),
  };
  const config = {
    get: jest.fn((key: string, fallback: string) => {
      if (key === 'AUTH_SESSION_COOKIE') return 'test_session';
      if (key === 'AUTH_SESSION_IDLE_DAYS') return '7';
      return fallback;
    }),
  };
  const controller = new AuthController(authService as never, config as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets a secure cookie contract without exposing the session token in JSON', async () => {
    authService.login.mockResolvedValue({
      token: 'opaque-token',
      identity: {
        user: { id: 'user-id', username: 'admin', email: 'admin@example.local', name: 'Admin' },
        roles: ['Admin'],
        permissions: ['dashboard:read'],
        sessionId: 'session-id',
      },
    });
    const response = { cookie: jest.fn() };

    const result = await controller.login(
      { identifier: 'admin', password: 'secret' },
      response as never,
    );

    expect(response.cookie).toHaveBeenCalledWith(
      'test_session',
      'opaque-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),
    );
    expect(result).toEqual({
      user: { id: 'user-id', username: 'admin', email: 'admin@example.local', name: 'Admin' },
      roles: ['Admin'],
      permissions: ['dashboard:read'],
    });
    expect(result).not.toHaveProperty('token');
    expect(result).not.toHaveProperty('sessionId');
  });

  it('clears the cookie and revokes only the presented token on logout', async () => {
    authService.logout.mockResolvedValue(undefined);
    const response = { clearCookie: jest.fn() };

    await expect(
      controller.logout({ cookies: { test_session: 'opaque-token' } } as never, response as never),
    ).resolves.toEqual({ success: true });

    expect(authService.logout).toHaveBeenCalledWith('opaque-token');
    expect(response.clearCookie).toHaveBeenCalledWith(
      'test_session',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' }),
    );
  });

  it('clears an expired or missing session cookie safely', async () => {
    const response = { clearCookie: jest.fn() };

    await expect(
      controller.logout({ cookies: undefined } as never, response as never),
    ).resolves.toEqual({ success: true });

    expect(authService.logout).toHaveBeenCalledWith(undefined);
    expect(response.clearCookie).toHaveBeenCalledWith('test_session', expect.any(Object));
  });
});
