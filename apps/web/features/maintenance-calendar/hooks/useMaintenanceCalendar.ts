'use client';

import { useEffect, useState } from 'react';
import { fetchMaintenanceCalendar } from '../api/maintenanceCalendarApi';
import { toCalendarData } from '../utils/calendarFormatters';
import type { MaintenanceCalendarData } from '../types';

export function useMaintenanceCalendar() {
  const [data, setData] = useState<MaintenanceCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    void fetchMaintenanceCalendar(controller.signal)
      .then((result) => setData(toCalendarData(result)))
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError'))
          setError('No se pudo cargar la agenda de mantenimiento.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [refreshKey]);
  return { data, loading, error, retry: () => setRefreshKey((value) => value + 1) };
}
