'use client';

import { useEffect, useState } from 'react';
import { fetchAuditEvents } from '../api/auditApi';
import type { AuditEvent, AuditFilters } from '../types';

export function useAuditEvents() {
  const [filters, setFilters] = useState<AuditFilters>({ page: 1 });
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetchAuditEvents(filters, controller.signal)
      .then((result) => {
        setEvents(result.data);
        setMeta(result.meta);
      })
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError'))
          setError('No se pudieron cargar los eventos auditados.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters, refreshKey]);
  function updateFilters(next: Partial<AuditFilters>) {
    setFilters((current) => ({ ...current, ...next, page: next.page ?? 1 }));
  }
  return {
    filters,
    events,
    meta,
    loading,
    error,
    updateFilters,
    retry: () => setRefreshKey((value) => value + 1),
  };
}
