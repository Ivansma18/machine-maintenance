import { ForbiddenException } from '@nestjs/common';

import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  };
  const guard = new PermissionsGuard(reflector as never);

  const context = (request: Record<string, unknown>) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    }) as never;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows authenticated routes without a required permission', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(context({}))).toBe(true);
  });

  it('allows a request with the required permission', () => {
    reflector.getAllAndOverride.mockReturnValue('machines:read');

    expect(
      guard.canActivate(
        context({ identity: { permissions: ['dashboard:read', 'machines:read'] } }),
      ),
    ).toBe(true);
  });

  it('returns 403 when the permission is missing', () => {
    reflector.getAllAndOverride.mockReturnValue('machines:create');

    expect(() =>
      guard.canActivate(context({ identity: { permissions: ['machines:read'] } })),
    ).toThrow(ForbiddenException);
  });
});
