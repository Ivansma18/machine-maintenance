'use client';

import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api/client';
import { fetchMachineProfile } from '../api/machineProfileApi';
import type { MachineProfile } from '../types';

export function useMachineProfile(id: string) {
  const [profile, setProfile] = useState<MachineProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setErrorStatus(null);

    void fetchMachineProfile(id, controller.signal)
      .then(setProfile)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        if (requestError instanceof ApiError) setErrorStatus(requestError.status);
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudo cargar el expediente de la maquina.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id, refreshKey]);

  return { profile, loading, error, errorStatus, retry: () => setRefreshKey((value) => value + 1) };
}
