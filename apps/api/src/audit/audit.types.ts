import type { AuditActorType, Prisma } from '../generated/prisma/client';

export type AuditContext = {
  actorType: AuditActorType;
  actorId: string;
  requestId: string;
  reason?: string;
};

export type AuditRecordInput = AuditContext & {
  action: string;
  entityType: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
};

export type AuditClient = Pick<Prisma.TransactionClient, 'auditEvent'>;
