'use client';

import { useEffect, useState } from 'react';
import { fetchWorkOrder } from '../api/workOrdersApi';
import type { WorkOrder } from '../types';

export function useWorkOrder(id: string) {
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void fetchWorkOrder(id, controller.signal)
      .then(setOrder)
      .catch(() => setError('No se pudo cargar la orden de trabajo.'))
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);
  return { order, loading, error };
}
