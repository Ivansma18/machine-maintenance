import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuditClient, AuditRecordInput } from './audit.types';

const SENSITIVE_KEY = /(password|token|secret|cookie|hash)/i;
const MAX_STRING_LENGTH = 10_000;

function sanitizeSnapshot(value: unknown, depth = 0): Prisma.InputJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return undefined;
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}...` : value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (depth >= 8) {
    return '[max snapshot depth]';
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeSnapshot(item, depth + 1))
      .filter((item): item is Prisma.InputJsonValue => item !== undefined);
  }

  if (typeof value === 'object') {
    const object: { [key: string]: Prisma.InputJsonValue } = {};

    for (const [key, item] of Object.entries(value)) {
      if (SENSITIVE_KEY.test(key)) {
        continue;
      }

      const sanitized = sanitizeSnapshot(item, depth + 1);
      if (sanitized !== undefined) {
        object[key] = sanitized;
      }
    }

    return object;
  }

  return String(value);
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  record(input: AuditRecordInput, client: AuditClient = this.prisma) {
    const before = sanitizeSnapshot(input.before);
    const after = sanitizeSnapshot(input.after);

    return client.auditEvent.create({
      data: {
        actorType: input.actorType,
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        before,
        after,
        reason: input.reason,
        requestId: input.requestId,
      },
    });
  }
}
