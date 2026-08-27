'use client';

import { useEffect, useState } from 'react';
import { fetchRecurrenceMetrics } from '../api/maintenanceMetricsApi';
import type { RecurrenceMetrics } from '../types';

export function useRecurrenceMetrics() {
  const [data, setData] = useState<RecurrenceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetchRecurrenceMetrics(controller.signal)
      .then(setData)
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) {
          setError('No se pudieron calcular las metricas de reincidencia.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [refreshKey]);
  return { data, loading, error, retry: () => setRefreshKey((value) => value + 1) };
}
