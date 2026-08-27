'use client';

import { useState } from 'react';
import { createWorkOrder } from '@/features/work-orders/api/workOrdersApi';
import type { WorkOrderFormValues } from '@/features/work-orders/types';

export function useScheduleMachineWorkOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function schedule(values: WorkOrderFormValues) {
    setLoading(true);
    setError(null);
    try {
      return await createWorkOrder(values);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo programar la intervención.';
      setError(message);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }

  return { schedule, loading, error };
}
