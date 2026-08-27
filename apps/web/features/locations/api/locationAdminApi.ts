import { apiRequest } from '@/lib/api/client';
import type { Area, ProductionLine, Site } from '../types';

export function createSite(name: string, description?: string) {
  return apiRequest<Site>('/api/locations/sites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
}
export function createArea(siteId: string, name: string) {
  return apiRequest<Area>('/api/locations/areas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteId, name }),
  });
}
export function createProductionLine(areaId: string, name: string) {
  return apiRequest<ProductionLine>('/api/locations/lines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ areaId, name }),
  });
}
