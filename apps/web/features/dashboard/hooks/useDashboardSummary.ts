'use client';

import { useEffect, useState } from 'react';

import { fetchDashboardSummary, processPreventiveNotifications } from '../api/dashboardApi';
import type { DashboardSummary } from '../types';

const connectionError =
  'We could not connect to the operations API. Check that the backend is running and try again.';

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSummary() {
      setLoading(true);
      setError(null);

      try {
        setSummary(await fetchDashboardSummary(controller.signal));
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(connectionError);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void loadSummary();
    return () => controller.abort();
  }, [refreshKey]);

  async function runAlertScan() {
    setRefreshing(true);

    try {
      await processPreventiveNotifications();
      setRefreshKey((value) => value + 1);
    } catch {
      setError('The alert scan could not be completed. Try again in a moment.');
      setRefreshing(false);
    }
  }

  function retry() {
    setRefreshKey((value) => value + 1);
  }

  return { summary, error, loading, refreshing, runAlertScan, retry };
}
