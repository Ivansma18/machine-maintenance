import { apiRequest } from '@/lib/api/client';
import type { RecurrenceMetrics } from '../types';

export function fetchRecurrenceMetrics(signal?: AbortSignal) {
  return apiRequest<RecurrenceMetrics>('/api/maintenance-logs/metrics/recurrence', { signal });
}
