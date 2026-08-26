import { apiRequest } from '@/lib/api/client';

import type { MachineProfile, MachineTimelineResponse } from '../types';

export function fetchMachineProfile(id: string, signal?: AbortSignal) {
  return apiRequest<MachineProfile>(`/api/machines/${id}/profile`, { signal });
}

export function fetchMachineTimeline(id: string, signal?: AbortSignal) {
  return apiRequest<MachineTimelineResponse>(`/api/machines/${id}/timeline`, { signal });
}
