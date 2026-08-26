import { apiRequest } from '@/lib/api/client';
import type { MachinePartsResponse } from '../types';

export function fetchMachineParts(id: string, signal?: AbortSignal) {
  return apiRequest<MachinePartsResponse>(`/api/machines/${id}/parts`, { signal });
}
