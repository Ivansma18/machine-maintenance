import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedIdentity, AuthenticatedSession, AuthenticatedUser } from './types/auth.types';
import { DEFAULT_SESSION_IDLE_DAYS, SESSION_TOKEN_BYTES } from './auth.constants';

function deriveKey(
  password: string,
  salt: string,
  keyLength: number,
  options: Parameters<typeof scrypt>[3],
) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  name: true,
} as const;

const identityUserSelect = {
  ...publicUserSelect,
  isActive: true,
  roles: {
    select: {
      role: {
        select: {
          name: true,
          permissions: {
            select: {
              permission: {
                select: { key: true },
              },
            },
          },
        },
      },
    },
  },
} as const;

@Injectable()
export class AuthService {
  private readonly sessionIdleMs: number;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    const idleDays = Number(
      config.get<string>('AUTH_SESSION_IDLE_DAYS', String(DEFAULT_SESSION_IDLE_DAYS)),
    );

    this.sessionIdleMs =
      Number.isFinite(idleDays) && idleDays > 0
        ? idleDays * 24 * 60 * 60 * 1000
        : DEFAULT_SESSION_IDLE_DAYS * 24 * 60 * 60 * 1000;
  }

  async login(identifier: string, password: string): Promise<AuthenticatedSession> {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
      },
      select: {
        ...publicUserSelect,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive || !(await this.verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = randomBytes(SESSION_TOKEN_BYTES).toString('base64url');
    const now = new Date();

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(token),
        lastSeenAt: now,
        expiresAt: this.expirationFrom(now),
      },
      select: { id: true },
    });

    return {
      token,
      identity: await this.buildIdentity(user.id, session.id),
    };
  }

  async validateSession(token: string | undefined): Promise<AuthenticatedIdentity | null> {
    if (!token) {
      return null;
    }

    const session = await this.prisma.session.findUnique({
      where: { tokenHash: this.hashToken(token) },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        revokedAt: true,
        user: { select: { isActive: true } },
      },
    });
    const now = new Date();

    if (!session || session.revokedAt || session.expiresAt <= now || !session.user.isActive) {
      return null;
    }

    const renewed = await this.prisma.session.updateMany({
      where: {
        id: session.id,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: {
        lastSeenAt: now,
        expiresAt: this.expirationFrom(now),
      },
    });

    if (renewed.count !== 1) {
      return null;
    }

    return this.buildIdentity(session.userId, session.id);
  }

  async logout(token: string | undefined): Promise<void> {
    if (!token) {
      return;
    }

    await this.prisma.session.updateMany({
      where: {
        tokenHash: this.hashToken(token),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  private async buildIdentity(userId: string, sessionId: string): Promise<AuthenticatedIdentity> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: identityUserSelect,
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid session');
    }

    const roles = user.roles.map(({ role }) => role.name);
    const permissions = [
      ...new Set(
        user.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.key)),
      ),
    ];

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    };

    return { user: authenticatedUser, roles, permissions, sessionId };
  }

  private expirationFrom(date: Date) {
    return new Date(date.getTime() + this.sessionIdleMs);
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async verifyPassword(password: string, encodedHash: string) {
    const [algorithm, nValue, rValue, pValue, salt, expectedHex] = encodedHash.split('$');

    if (algorithm !== 'scrypt' || !nValue || !rValue || !pValue || !salt || !expectedHex) {
      return false;
    }

    const expected = Buffer.from(expectedHex, 'hex');

    if (expected.length === 0) {
      return false;
    }

    const N = Number(nValue);
    const r = Number(rValue);
    const p = Number(pValue);

    if (
      !Number.isInteger(N) ||
      !Number.isInteger(r) ||
      !Number.isInteger(p) ||
      N < 1_024 ||
      N > 1_048_576 ||
      (N & (N - 1)) !== 0 ||
      r < 1 ||
      r > 32 ||
      p < 1 ||
      p > 16
    ) {
      return false;
    }

    try {
      const derived = await deriveKey(password, salt, expected.length, {
        N,
        r,
        p,
        maxmem: 32 * 1024 * 1024,
      });

      return derived.length === expected.length && timingSafeEqual(derived, expected);
    } catch {
      return false;
    }
  }
}
