import { randomUUID } from 'node:crypto';

import type { AuditActorType } from '../generated/prisma/client';
import type { AuthenticatedRequest } from '../authorization/types/authenticated-request.type';
import type { AuditContext } from './audit.types';

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._:-]{1,100}$/;

export function auditContextFromRequest(request: AuthenticatedRequest): AuditContext {
  if (!request.identity) {
    throw new Error('An authenticated identity is required for audit events');
  }

  return {
    actorType: 'USER' as AuditActorType,
    actorId: request.identity.user.id,
    requestId: request.requestId ?? randomUUID(),
  };
}

export function serviceAuditContext(actorId: string): AuditContext {
  return {
    actorType: 'SERVICE' as AuditActorType,
    actorId,
    requestId: randomUUID(),
  };
}

export function requestIdFromHeader(value: string | undefined) {
  return value && REQUEST_ID_PATTERN.test(value) ? value : randomUUID();
}
