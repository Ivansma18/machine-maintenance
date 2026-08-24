import type { DashboardSummary } from '../types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const summaryUrl = `${apiBaseUrl}/api/dashboard/summary`;
const processUrl = `${apiBaseUrl}/api/notifications/process-preventive`;

async function assertSuccessful(response: Response, operation: string) {
  if (!response.ok) {
    throw new Error(`${operation} failed with status ${response.status}`);
  }
}

export async function fetchDashboardSummary(signal?: AbortSignal): Promise<DashboardSummary> {
  const response = await fetch(summaryUrl, { signal, cache: 'no-store' });
  await assertSuccessful(response, 'Dashboard request');
  return response.json() as Promise<DashboardSummary>;
}

export async function processPreventiveNotifications() {
  const response = await fetch(processUrl, { method: 'POST' });
  await assertSuccessful(response, 'Alert scan');
}
