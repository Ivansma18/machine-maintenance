'use client';

import { useEffect, useState } from 'react';
import { fetchWorkOrders } from '../api/workOrdersApi';
import type { WorkOrder } from '../types';

export function useMachineWorkOrders(machineId: string) {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    void fetchWorkOrders({ machineId, page: 1 }, controller.signal)
      .then((result) => setOrders(result.data))
      .catch(() => undefined)
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [machineId]);
  return { orders, loading };
}
