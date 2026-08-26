'use client';

import { useEffect, useState } from 'react';
import { fetchMachineParts } from '../api/machinePartsApi';
import type { MachinePartsResponse } from '../types';

export function useMachineParts(id: string) {
  const [result, setResult] = useState<MachinePartsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetchMachineParts(id, controller.signal)
      .then(setResult)
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError'))
          setError('No se pudieron cargar las refacciones de esta máquina.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, refreshKey]);
  return { result, loading, error, retry: () => setRefreshKey((value) => value + 1) };
}
