import { AuditService } from './audit.service';

describe('AuditService', () => {
  it('sanitizes sensitive values and serializes snapshots before persistence', async () => {
    const auditEvent = { create: jest.fn().mockResolvedValue({ id: 'audit-id' }) };
    const service = new AuditService({ auditEvent } as never);

    await service.record({
      actorType: 'USER',
      actorId: 'user-id',
      requestId: 'request-id',
      action: 'machine.updated',
      entityType: 'Machine',
      entityId: 'machine-id',
      before: {
        id: 'machine-id',
        updatedAt: new Date('2026-08-25T00:00:00.000Z'),
        passwordHash: 'must-not-be-stored',
        nested: { sessionToken: 'must-not-be-stored' },
      },
      after: { status: 'ACTIVE' },
    });

    expect(auditEvent.create).toHaveBeenCalledWith({
      data: {
        actorType: 'USER',
        actorId: 'user-id',
        action: 'machine.updated',
        entityType: 'Machine',
        entityId: 'machine-id',
        before: {
          id: 'machine-id',
          updatedAt: '2026-08-25T00:00:00.000Z',
          nested: {},
        },
        after: { status: 'ACTIVE' },
        reason: undefined,
        requestId: 'request-id',
      },
    });
  });

  it('supports writing an audit event through a transaction client', async () => {
    const auditEvent = { create: jest.fn().mockResolvedValue({ id: 'audit-id' }) };
    const transactionClient = { auditEvent };
    const service = new AuditService({ auditEvent: { create: jest.fn() } } as never);

    await service.record(
      {
        actorType: 'SERVICE',
        actorId: 'preventive-notifications',
        requestId: 'request-id',
        action: 'notifications.preventive.processed',
        entityType: 'PreventiveNotificationJob',
        after: { created: 1 },
      },
      transactionClient as never,
    );

    expect(auditEvent.create).toHaveBeenCalledTimes(1);
  });
});
