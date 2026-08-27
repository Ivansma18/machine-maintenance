import { apiRequest } from '@/lib/api/client';
import type { Site } from '../types';

export function fetchLocations(signal?: AbortSignal) {
  return apiRequest<Site[]>('/api/locations', { signal });
}
