export type AuditEvent = {
  id: string;
  actorType: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  before: unknown;
  after: unknown;
  reason: string | null;
  requestId: string | null;
  createdAt: string;
};

export type AuditFilters = {
  actor?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  from?: string;
  to?: string;
  requestId?: string;
  page: number;
};

export type AuditResponse = {
  data: AuditEvent[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
