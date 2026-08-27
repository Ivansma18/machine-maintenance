'use client';

import { useEffect, useState } from 'react';
import { fetchLocations } from '../api/locationsApi';
import type { Site } from '../types';

export function useLocations() {
  const [data, setData] = useState<Site[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void fetchLocations(controller.signal)
      .then(setData)
      .catch(() => undefined);
    return () => controller.abort();
  }, [refreshKey]);
  return { data, retry: () => setRefreshKey((value) => value + 1) };
}
