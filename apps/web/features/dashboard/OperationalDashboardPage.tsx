'use client';

import { DashboardContent } from './components/DashboardContent';
import { DashboardShell } from './components/DashboardShell';
import { DashboardSkeleton, EmptyDashboard } from './components/DashboardStates';
import { useDashboardSummary } from './hooks/useDashboardSummary';

export function OperationalDashboardPage() {
  const dashboard = useDashboardSummary();

  return (
    <DashboardShell
      error={dashboard.error}
      onRetry={dashboard.retry}
      onRunAlertScan={dashboard.runAlertScan}
      refreshing={dashboard.refreshing}
    >
      {dashboard.loading && !dashboard.summary ? <DashboardSkeleton /> : null}
      {dashboard.summary ? <DashboardContent summary={dashboard.summary} /> : null}
      {!dashboard.loading && !dashboard.summary && !dashboard.error ? <EmptyDashboard /> : null}
    </DashboardShell>
  );
}
