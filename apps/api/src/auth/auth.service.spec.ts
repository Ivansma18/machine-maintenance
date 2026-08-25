import { scryptSync } from 'node:crypto';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  const config = {
    get: jest.fn((key: string, fallback: string) =>
      key === 'AUTH_SESSION_IDLE_DAYS' ? '7' : fallback,
    ),
  };
  const service = new AuthService(prisma as never, config as never);
  const passwordHash = `scrypt$16384$8$1$test-salt$${scryptSync('secret', 'test-salt', 64, {
    N: 16_384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  }).toString('hex')}`;
  const user = {
    id: 'user-id',
    username: 'admin',
    email: 'admin@example.local',
    name: 'Admin',
    passwordHash,
    isActive: true,
  };
  const identityUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    roles: [
      {
        role: {
          name: 'Admin',
          permissions: [{ permission: { key: 'machines:read' } }],
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs in with a username and creates a new session', async () => {
    prisma.user.findFirst.mockResolvedValue(user);
    prisma.session.create.mockResolvedValue({ id: 'session-id' });
    prisma.user.findUnique.mockResolvedValue(identityUser);

    const result = await service.login(' Admin ', 'secret');

    expect(prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ email: 'admin' }, { username: 'admin' }] },
      }),
    );
    expect(prisma.session.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'user-id', tokenHash: expect.any(String) }),
      }),
    );
    expect(result.identity).toEqual({
      user: {
        id: 'user-id',
        username: 'admin',
        email: 'admin@example.local',
        name: 'Admin',
      },
      roles: ['Admin'],
      permissions: ['machines:read'],
      sessionId: 'session-id',
    });
    expect(result.token).toEqual(expect.any(String));
  });

  it('accepts an email identifier', async () => {
    prisma.user.findFirst.mockResolvedValue(user);
    prisma.session.create.mockResolvedValue({ id: 'session-id' });
    prisma.user.findUnique.mockResolvedValue(identityUser);

    await service.login('ADMIN@EXAMPLE.LOCAL', 'secret');

    expect(prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ email: 'admin@example.local' }, { username: 'admin@example.local' }],
        },
      }),
    );
  });

  it('rejects invalid credentials without creating a session', async () => {
    prisma.user.findFirst.mockResolvedValue(user);

    await expect(service.login('admin', 'wrong-secret')).rejects.toThrow('Invalid credentials');
    expect(prisma.session.create).not.toHaveBeenCalled();
  });

  it('rejects inactive users without creating a session', async () => {
    prisma.user.findFirst.mockResolvedValue({ ...user, isActive: false });

    await expect(service.login('admin', 'secret')).rejects.toThrow('Invalid credentials');
    expect(prisma.session.create).not.toHaveBeenCalled();
  });

  it('creates independent sessions for repeated logins', async () => {
    prisma.user.findFirst.mockResolvedValue(user);
    prisma.session.create
      .mockResolvedValueOnce({ id: 'first-session' })
      .mockResolvedValueOnce({ id: 'second-session' });
    prisma.user.findUnique.mockResolvedValue(identityUser);

    const first = await service.login('admin', 'secret');
    const second = await service.login('admin', 'secret');

    expect(first.identity.sessionId).toBe('first-session');
    expect(second.identity.sessionId).toBe('second-session');
    expect(prisma.session.create).toHaveBeenCalledTimes(2);
  });

  it('renews a valid session and returns its effective permissions', async () => {
    prisma.session.findUnique.mockResolvedValue({
      id: 'session-id',
      userId: 'user-id',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      user: { isActive: true },
    });
    prisma.session.update.mockResolvedValue({});
    prisma.user.findUnique.mockResolvedValue(identityUser);

    const result = await service.validateSession('session-token');

    expect(prisma.session.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'session-id' },
        data: expect.objectContaining({
          lastSeenAt: expect.any(Date),
          expiresAt: expect.any(Date),
        }),
      }),
    );
    expect(result?.permissions).toEqual(['machines:read']);
  });

  it('rejects an expired session without renewing it', async () => {
    prisma.session.findUnique.mockResolvedValue({
      id: 'session-id',
      userId: 'user-id',
      expiresAt: new Date(Date.now() - 60_000),
      revokedAt: null,
      user: { isActive: true },
    });

    await expect(service.validateSession('session-token')).resolves.toBeNull();
    expect(prisma.session.update).not.toHaveBeenCalled();
  });

  it('revokes only the presented session on logout', async () => {
    prisma.session.updateMany.mockResolvedValue({ count: 1 });

    await service.logout('session-token');

    expect(prisma.session.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tokenHash: expect.any(String), revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      }),
    );
  });
});
