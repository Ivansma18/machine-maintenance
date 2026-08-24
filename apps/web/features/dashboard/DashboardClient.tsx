'use client';

import { useEffect, useState } from 'react';

import { AnimatedCard } from '@/components/motion/AnimatedCard';
import { AnimatedList } from '@/components/motion/AnimatedList';
import { AnimatedListItem } from '@/components/motion/AnimatedListItem';
import { AnimatedPage } from '@/components/motion/AnimatedPage';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { AppButton } from '@/components/ui/AppButton';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppTag } from '@/components/ui/AppTag';

type DashboardSummary = {
  generatedAt: string;
  machines: {
    total: number;
    active: number;
    underMaintenance: number;
    inactive: number;
    retired: number;
  };
  maintenance: {
    dueSoon: number;
    overdue: number;
  };
  openUrgentNotifications: number;
  recentLogs: Array<{
    id: string;
    machine: { id: string; name: string };
    maintenancePlan: { id: string; name: string } | null;
    performedAt: string;
    type: 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION';
    result: 'OK' | 'NEEDS_FOLLOW_UP' | 'FAILED' | 'CRITICAL_FAILURE';
    performedBy: string;
  }>;
};

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/dashboard/summary`;
const processUrl = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/notifications/process-preventive`;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const resultTone = (result: DashboardSummary['recentLogs'][number]['result']) => {
  if (result === 'CRITICAL_FAILURE') return 'critical' as const;
  if (result === 'FAILED') return 'warning' as const;
  if (result === 'OK') return 'success' as const;
  return 'neutral' as const;
};

const resultLabel = (result: DashboardSummary['recentLogs'][number]['result']) =>
  result.replaceAll('_', ' ').toLowerCase();

export function DashboardClient() {
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
        const response = await fetch(apiUrl, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!response.ok)
          throw new Error(`Dashboard request failed with status ${response.status}`);
        setSummary((await response.json()) as DashboardSummary);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(
          'We could not connect to the operations API. Check that the backend is running and try again.',
        );
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
      const response = await fetch(processUrl, { method: 'POST' });
      if (!response.ok) throw new Error('Alert scan failed');
      setRefreshKey((value) => value + 1);
    } catch {
      setError('The alert scan could not be completed. Try again in a moment.');
      setRefreshing(false);
    }
  }

  return (
    <AnimatedPage>
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[#dfe4df] bg-[#eef1ec] px-6 py-7 lg:flex">
          <div className="mb-14 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#17211f] text-sm font-black text-[#f2b84b]">
              P
            </div>
            <div>
              <p className="m-0 text-sm font-black tracking-[0.18em] text-[#17211f]">PANTRY</p>
              <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#68736f]">
                Maintenance OS
              </p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2" aria-label="Main navigation">
            <p className="eyebrow mb-2 px-3">Workspace</p>
            <a
              className="rounded-lg bg-[#17211f] px-3 py-2.5 text-sm font-bold text-white"
              href="#overview"
            >
              Overview
            </a>
            <a
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#68736f] transition-colors hover:bg-white hover:text-[#17211f]"
              href="#machines"
            >
              Machines
            </a>
            <a
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#68736f] transition-colors hover:bg-white hover:text-[#17211f]"
              href="#schedule"
            >
              Maintenance plan
            </a>
            <a
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#68736f] transition-colors hover:bg-white hover:text-[#17211f]"
              href="#alerts"
            >
              Alerts
            </a>
          </nav>

          <div className="rounded-xl border border-[#dfe4df] bg-white p-4">
            <p className="eyebrow">System pulse</p>
            <p className="mb-3 mt-2 text-sm font-bold text-[#17211f]">Operations connected</p>
            <div className="flex items-center gap-2 text-xs text-[#68736f]">
              <span className="h-2 w-2 rounded-full bg-[#668875]" /> Live API summary
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-[#dfe4df] px-5 py-5 sm:px-8 lg:px-10">
            <div>
              <p className="eyebrow">Production floor / all locations</p>
              <h1 className="mb-0 mt-2 text-2xl font-black tracking-[-0.04em] text-[#17211f] sm:text-3xl">
                Control room
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="m-0 text-sm font-bold text-[#17211f]">Operations</p>
                <p className="m-0 text-xs text-[#68736f]">Live maintenance view</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e7db] text-xs font-black text-[#365441]">
                OP
              </div>
            </div>
          </header>

          <main className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-12" id="overview">
            <AnimatedSection className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Operational pulse</p>
                <p className="mb-0 mt-3 max-w-xl text-sm leading-6 text-[#68736f]">
                  See what needs attention before the next bakery shift starts.
                </p>
              </div>
              <AppButton loading={refreshing} variant="primary" onClick={runAlertScan}>
                Run alert scan
              </AppButton>
            </AnimatedSection>

            {error ? (
              <div
                className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-5 sm:flex-row sm:items-center"
                role="alert"
              >
                <div>
                  <p className="m-0 text-sm font-bold text-[#8e2f28]">Dashboard unavailable</p>
                  <p className="m-0 mt-1 text-xs leading-5 text-[#a65a52]">{error}</p>
                </div>
                <AppButton variant="secondary" onClick={() => setRefreshKey((value) => value + 1)}>
                  Retry
                </AppButton>
              </div>
            ) : null}

            {loading && !summary ? (
              <DashboardSkeleton />
            ) : summary ? (
              <DashboardContent summary={summary} />
            ) : error ? null : (
              <EmptyDashboard />
            )}
          </main>
        </div>
      </div>
    </AnimatedPage>
  );
}

function DashboardContent({ summary }: { summary: DashboardSummary }) {
  const total = Math.max(summary.machines.total, 1);
  const distribution = [
    { label: 'Active', count: summary.machines.active, color: '#668875' },
    {
      label: 'Under maintenance',
      count: summary.machines.underMaintenance,
      color: '#d95b4f',
    },
    { label: 'Inactive', count: summary.machines.inactive, color: '#9da7a2' },
    { label: 'Retired', count: summary.machines.retired, color: '#c8cfca' },
  ];

  return (
    <>
      <AnimatedSection className="mb-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]" delay={0.05}>
        <AppPanel
          className="overflow-hidden"
          title="Machine health"
          eyebrow="Current fleet"
          extra={
            <span className="tabular-nums text-sm font-black text-[#17211f]">
              {summary.machines.total} total
            </span>
          }
        >
          <div className="grid gap-8 p-5 sm:grid-cols-[0.9fr_1.1fr] sm:p-7">
            <div className="flex flex-col justify-between">
              <div>
                <p className="eyebrow">Ready for production</p>
                <p className="tabular-nums mb-1 mt-4 text-6xl font-black tracking-[-0.08em] text-[#17211f]">
                  {summary.machines.active}
                </p>
                <p className="m-0 text-sm text-[#68736f]">active machines on the floor</p>
              </div>
              <p className="mb-0 mt-8 text-xs font-semibold text-[#668875]">
                {summary.machines.underMaintenance} currently receiving attention
              </p>
            </div>
            <div className="flex flex-col justify-center">
              <div
                className="mb-6 flex h-4 overflow-hidden rounded-full bg-[#e8ece8]"
                aria-label="Machine status distribution"
              >
                {distribution.map((status) => (
                  <span
                    key={status.label}
                    style={{
                      backgroundColor: status.color,
                      width: `${(status.count / total) * 100}%`,
                    }}
                    title={`${status.label}: ${status.count}`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                {distribution.map((status) => (
                  <div
                    className="flex items-center justify-between gap-3 text-sm"
                    key={status.label}
                  >
                    <span className="flex items-center gap-2 text-[#68736f]">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      {status.label}
                    </span>
                    <span className="tabular-nums font-bold text-[#17211f]">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AppPanel>

        <AppPanel className="border-[#d95b4f]" title="Urgent lane" eyebrow="Requires attention">
          <div className="flex h-full min-h-[220px] flex-col justify-between bg-[#fff7f5] p-6">
            <div>
              <p className="m-0 text-5xl font-black tracking-[-0.08em] text-[#d95b4f]">
                {summary.openUrgentNotifications}
              </p>
              <p className="mt-2 text-sm font-bold text-[#8e2f28]">open urgent alerts</p>
            </div>
            <div className="mt-8 flex items-center justify-between gap-3">
              <span className="text-xs leading-5 text-[#a65a52]">
                Critical issues stay visible until resolved.
              </span>
              <AppTag tone={summary.openUrgentNotifications ? 'critical' : 'success'}>
                {summary.openUrgentNotifications ? 'Action needed' : 'Clear'}
              </AppTag>
            </div>
          </div>
        </AppPanel>
      </AnimatedSection>

      <AnimatedSection className="mb-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" delay={0.1}>
        <Metric
          label="Active machines"
          value={summary.machines.active}
          detail="Ready for production"
          tone="ink"
        />
        <Metric
          label="Due soon"
          value={summary.maintenance.dueSoon}
          detail="Inside warning window"
          tone="warning"
        />
        <Metric
          label="Overdue"
          value={summary.maintenance.overdue}
          detail="Needs attention today"
          tone="critical"
        />
        <Metric
          label="Urgent alerts"
          value={summary.openUrgentNotifications}
          detail="Open critical work"
          tone="sage"
        />
      </AnimatedSection>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <AnimatedSection id="schedule" delay={0.15}>
          <AppPanel title="Maintenance horizon" eyebrow="Preventive workload">
            <div className="grid grid-cols-2 divide-x divide-[#dfe4df] p-6">
              <div>
                <p className="eyebrow">Due soon</p>
                <p className="tabular-nums mb-1 mt-3 text-4xl font-black tracking-[-0.06em] text-[#a56c14]">
                  {summary.maintenance.dueSoon}
                </p>
                <p className="m-0 text-xs text-[#68736f]">within warning window</p>
              </div>
              <div className="pl-6">
                <p className="eyebrow">Overdue</p>
                <p className="tabular-nums mb-1 mt-3 text-4xl font-black tracking-[-0.06em] text-[#d95b4f]">
                  {summary.maintenance.overdue}
                </p>
                <p className="m-0 text-xs text-[#68736f]">past the due date</p>
              </div>
            </div>
          </AppPanel>
        </AnimatedSection>
        <AnimatedSection id="alerts" delay={0.2}>
          <AppPanel title="Recent maintenance" eyebrow="Latest activity">
            <AnimatedList>
              <div className="divide-y divide-[#dfe4df]">
                {summary.recentLogs.length ? (
                  summary.recentLogs.map((log) => (
                    <AnimatedListItem
                      className="flex items-center justify-between gap-4 px-5 py-4"
                      key={log.id}
                    >
                      <div className="min-w-0">
                        <p className="m-0 truncate text-sm font-bold text-[#17211f]">
                          {log.machine.name}
                        </p>
                        <p className="m-0 mt-1 truncate text-xs text-[#68736f]">
                          {log.maintenancePlan?.name ?? `${log.type.toLowerCase()} maintenance`} ·{' '}
                          {formatDate(log.performedAt)}
                        </p>
                      </div>
                      <AppTag tone={resultTone(log.result)}>{resultLabel(log.result)}</AppTag>
                    </AnimatedListItem>
                  ))
                ) : (
                  <div className="p-6 text-sm text-[#68736f]">
                    No maintenance has been recorded yet.
                  </div>
                )}
              </div>
            </AnimatedList>
          </AppPanel>
        </AnimatedSection>
      </div>
    </>
  );
}

function Metric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone: 'ink' | 'warning' | 'critical' | 'sage';
}) {
  const color =
    tone === 'critical'
      ? 'text-[#d95b4f]'
      : tone === 'warning'
        ? 'text-[#a56c14]'
        : tone === 'sage'
          ? 'text-[#668875]'
          : 'text-[#17211f]';
  return (
    <AnimatedCard className="rounded-2xl border border-[#dfe4df] bg-white p-5">
      <p className="eyebrow">{label}</p>
      <p className={`tabular-nums mb-2 mt-4 text-4xl font-black tracking-[-0.06em] ${color}`}>
        {value}
      </p>
      <p className="m-0 text-xs font-semibold text-[#68736f]">{detail}</p>
    </AnimatedCard>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid animate-pulse gap-5">
      <div className="h-64 rounded-2xl bg-[#e8ece8]" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div className="h-32 rounded-2xl bg-[#e8ece8]" key={item} />
        ))}
      </div>
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div className="rounded-2xl border border-dashed border-[#bfc9c1] bg-white p-10 text-center">
      <p className="m-0 text-lg font-black text-[#17211f]">No operational data yet</p>
      <p className="mx-auto mb-0 mt-2 max-w-md text-sm leading-6 text-[#68736f]">
        Add machines and maintenance plans to turn this room into a live view of the production
        floor.
      </p>
    </div>
  );
}
