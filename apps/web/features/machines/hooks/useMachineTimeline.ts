'use client';

import { useEffect, useState } from 'react';

import { fetchMachineTimeline } from '../api/machineProfileApi';
import type { MachineTimelineEvent } from '../types';

export function useMachineTimeline(id: string) {
  const [events, setEvents] = useState<MachineTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetchMachineTimeline(id, controller.signal)
      .then((result) => setEvents(result.data))
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudo cargar el timeline tecnico.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, refreshKey]);

  return { events, loading, error, retry: () => setRefreshKey((value) => value + 1) };
}
