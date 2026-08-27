'use client';

import { useEffect, useState } from 'react';
import {
  fetchWorkOrders,
  createWorkOrder,
  assignWorkOrder,
  startWorkOrder,
  completeWorkOrder,
  cancelWorkOrder,
} from '../api/workOrdersApi';
import type {
  WorkOrder,
  WorkOrderCompletionValues,
  WorkOrderFilters,
  WorkOrderFormValues,
} from '../types';

const initialFilters: WorkOrderFilters = { page: 1 };

export function useWorkOrders() {
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState<WorkOrder[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetchWorkOrders(filters, controller.signal)
      .then((result) => {
        setData(result.data);
        setMeta(result.meta);
      })
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError'))
          setError('No se pudieron cargar las ordenes de trabajo.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters, refreshKey]);

  function updateFilters(next: Partial<WorkOrderFilters>) {
    setFilters((current) => ({ ...current, ...next, page: next.page ?? 1 }));
  }
  async function run(action: () => Promise<unknown>) {
    setActionLoading(true);
    setActionError(null);
    try {
      await action();
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'No se pudo actualizar la orden.';
      setActionError(message);
      throw requestError;
    } finally {
      setActionLoading(false);
    }
  }

  return {
    data,
    meta,
    filters,
    loading,
    error,
    actionLoading,
    actionError,
    updateFilters,
    retry: () => setRefreshKey((value) => value + 1),
    create: (values: WorkOrderFormValues) => run(() => createWorkOrder(values)),
    assign: (id: string, userId: string) => run(() => assignWorkOrder(id, userId)),
    start: (id: string) => run(() => startWorkOrder(id)),
    complete: (id: string, values: WorkOrderCompletionValues) =>
      run(() => completeWorkOrder(id, values)),
    cancel: (id: string, reason: string) => run(() => cancelWorkOrder(id, reason)),
  };
}
