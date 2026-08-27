import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import type { AuthenticatedIdentity } from '../auth/types/auth.types';

const EMPTY_SCOPE_ID = '00000000-0000-0000-0000-000000000000';

export function machineScopeWhere(identity?: AuthenticatedIdentity): Prisma.MachineWhereInput {
  if (!identity || identity.roles.includes('Admin')) return {};
  const scopes = identity.scopes ?? [];
  const OR = scopes.map((scope) =>
    scope.level === 'SITE'
      ? { productionLine: { area: { siteId: scope.siteId! } } }
      : { productionLine: { areaId: scope.areaId! } },
  );
  return OR.length ? { OR } : { id: EMPTY_SCOPE_ID };
}

export function mergeMachineScope(
  where: Prisma.MachineWhereInput,
  identity?: AuthenticatedIdentity,
) {
  return { AND: [where, machineScopeWhere(identity)] } satisfies Prisma.MachineWhereInput;
}

export function assertScopedIdentity(
  identity: AuthenticatedIdentity | undefined,
  allowed: boolean,
) {
  if (identity && !allowed) throw new ForbiddenException('Machine is outside your assigned scope');
}
