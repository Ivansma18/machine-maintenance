import { apiRequest } from '@/lib/api/client';

import type { MachineProfile } from '../types';

export function fetchMachineProfile(id: string, signal?: AbortSignal) {
  return apiRequest<MachineProfile>(`/api/machines/${id}/profile`, { signal });
}
