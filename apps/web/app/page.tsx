import { AnimatedCard } from '@/components/motion/AnimatedCard';
import { AnimatedList } from '@/components/motion/AnimatedList';
import { AnimatedListItem } from '@/components/motion/AnimatedListItem';
import { AnimatedPage } from '@/components/motion/AnimatedPage';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { AppButton } from '@/components/ui/AppButton';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppTag } from '@/components/ui/AppTag';

const maintenanceQueue = [
  { machine: 'Deck oven · D-04', task: 'Temperature calibration', due: 'Today, 14:00', tone: 'warning' as const },
  { machine: 'Spiral mixer · M-12', task: 'Belt inspection', due: 'Tomorrow', tone: 'neutral' as const },
  { machine: 'Dough kneader · K-02', task: 'Full lubrication', due: 'In 4 days', tone: 'success' as const },
];

const machineStatus = [
  { label: 'Running', count: 18, color: '#668875', width: '72%' },
  { label: 'Due soon', count: 4, color: '#f2b84b', width: '16%' },
  { label: 'Under maintenance', count: 2, color: '#d95b4f', width: '8%' },
  { label: 'Inactive', count: 1, color: '#9da7a2', width: '4%' },
];

const alerts = [
  { machine: 'Convection oven · O-07', message: 'Critical temperature variance detected', time: '18 min ago' },
  { machine: 'Spiral mixer · M-03', message: 'Preventive plan overdue by 2 days', time: 'Yesterday' },
];

export default function HomePage() {
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
              <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#68736f]">Maintenance OS</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2" aria-label="Main navigation">
            <p className="eyebrow mb-2 px-3">Workspace</p>
            <a className="rounded-lg bg-[#17211f] px-3 py-2.5 text-sm font-bold text-white" href="#overview">
              Overview
            </a>
            <a className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#68736f] transition-colors hover:bg-white hover:text-[#17211f]" href="#machines">
              Machines <span className="float-right text-xs tabular-nums">25</span>
            </a>
            <a className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#68736f] transition-colors hover:bg-white hover:text-[#17211f]" href="#schedule">
              Maintenance plan
            </a>
            <a className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#68736f] transition-colors hover:bg-white hover:text-[#17211f]" href="#alerts">
              Alerts <span className="float-right rounded-full bg-[#d95b4f] px-1.5 text-[0.65rem] text-white">2</span>
            </a>
          </nav>

          <div className="rounded-xl border border-[#dfe4df] bg-white p-4">
            <p className="eyebrow">Shift status</p>
            <p className="mb-3 mt-2 text-sm font-bold text-[#17211f]">Morning production</p>
            <div className="flex items-center gap-2 text-xs text-[#68736f]">
              <span className="h-2 w-2 rounded-full bg-[#668875]" /> All systems synced
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-[#dfe4df] px-5 py-5 sm:px-8 lg:px-10">
            <div>
              <p className="eyebrow">Monday · 24 February 2025</p>
              <h1 className="mb-0 mt-2 text-2xl font-black tracking-[-0.04em] text-[#17211f] sm:text-3xl">Control room</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="m-0 text-sm font-bold text-[#17211f]">Ava Torres</p>
                <p className="m-0 text-xs text-[#68736f]">Operations lead</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e7db] text-xs font-black text-[#365441]">AT</div>
            </div>
          </header>

          <main className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-12" id="overview">
            <AnimatedSection className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Production floor / all locations</p>
                <p className="mb-0 mt-3 max-w-xl text-sm leading-6 text-[#68736f]">Keep every oven, mixer and kneader ready for the next batch.</p>
              </div>
              <AppButton variant="primary">+ Log maintenance</AppButton>
            </AnimatedSection>

            <AnimatedSection className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" delay={0.05}>
              <AnimatedCard className="rounded-2xl border border-[#dfe4df] bg-white p-5">
                <p className="eyebrow">Active machines</p>
                <p className="tabular-nums mb-2 mt-4 text-4xl font-black tracking-[-0.06em] text-[#17211f]">25</p>
                <p className="m-0 text-xs font-semibold text-[#668875]">+2 since last week</p>
              </AnimatedCard>
              <AnimatedCard className="rounded-2xl border border-[#dfe4df] bg-white p-5">
                <p className="eyebrow">Due this week</p>
                <p className="tabular-nums mb-2 mt-4 text-4xl font-black tracking-[-0.06em] text-[#17211f]">06</p>
                <p className="m-0 text-xs font-semibold text-[#a56c14]">4 preventive · 2 inspections</p>
              </AnimatedCard>
              <AnimatedCard className="rounded-2xl border border-[#dfe4df] bg-white p-5">
                <p className="eyebrow">Overdue</p>
                <p className="tabular-nums mb-2 mt-4 text-4xl font-black tracking-[-0.06em] text-[#d95b4f]">02</p>
                <p className="m-0 text-xs font-semibold text-[#d95b4f]">Needs attention today</p>
              </AnimatedCard>
              <AnimatedCard className="rounded-2xl border border-[#17211f] bg-[#17211f] p-5 text-white">
                <p className="eyebrow text-[#aab7af]">Reliability score</p>
                <p className="tabular-nums mb-2 mt-4 text-4xl font-black tracking-[-0.06em] text-[#f2b84b]">94%</p>
                <p className="m-0 text-xs font-semibold text-[#d9e7db]">+3.4% vs last month</p>
              </AnimatedCard>
            </AnimatedSection>

            <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
              <AnimatedSection id="schedule" delay={0.1}>
                <AppPanel title="Maintenance queue" eyebrow="Next up" extra={<a className="text-xs font-bold text-[#668875]" href="#schedule">View plan</a>}>
                  <AnimatedList>
                    <div className="divide-y divide-[#dfe4df]">
                      {maintenanceQueue.map((item) => (
                        <AnimatedListItem className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between" key={item.machine}>
                          <div>
                            <p className="m-0 text-sm font-bold text-[#17211f]">{item.machine}</p>
                            <p className="m-0 mt-1 text-xs text-[#68736f]">{item.task}</p>
                          </div>
                          <div className="flex items-center justify-between gap-5 sm:justify-end">
                            <span className="text-xs font-semibold text-[#68736f]">{item.due}</span>
                            <AppTag tone={item.tone}>{item.tone === 'warning' ? 'Due soon' : item.tone === 'success' ? 'On track' : 'Scheduled'}</AppTag>
                          </div>
                        </AnimatedListItem>
                      ))}
                    </div>
                  </AnimatedList>
                </AppPanel>
              </AnimatedSection>

              <AnimatedSection id="machines" delay={0.15}>
                <AppPanel title="Machine health" eyebrow="Live distribution">
                  <div className="p-5">
                    <div className="mb-6 flex h-3 overflow-hidden rounded-full bg-[#e8ece8]" aria-label="Machine health distribution">
                      {machineStatus.map((status) => <span key={status.label} style={{ backgroundColor: status.color, width: status.width }} />)}
                    </div>
                    <div className="space-y-4">
                      {machineStatus.map((status) => (
                        <div className="flex items-center justify-between text-sm" key={status.label}>
                          <span className="flex items-center gap-2 text-[#68736f]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />{status.label}</span>
                          <span className="tabular-nums font-bold text-[#17211f]">{status.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AppPanel>
              </AnimatedSection>

              <AnimatedSection className="xl:col-span-2" id="alerts" delay={0.2}>
                <AppPanel title="Open alerts" eyebrow="Requires attention" extra={<AppTag tone="critical">2 urgent</AppTag>}>
                  <AnimatedList>
                    <div className="grid divide-y divide-[#f3d7d2] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                      {alerts.map((alert) => (
                        <AnimatedListItem className="flex gap-4 p-5" key={alert.machine}>
                          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff0ed] text-sm font-black text-[#d95b4f]">!</div>
                          <div className="min-w-0">
                            <p className="m-0 truncate text-sm font-bold text-[#17211f]">{alert.machine}</p>
                            <p className="m-0 mt-1 text-xs leading-5 text-[#68736f]">{alert.message}</p>
                            <p className="m-0 mt-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#a56c14]">{alert.time}</p>
                          </div>
                        </AnimatedListItem>
                      ))}
                    </div>
                  </AnimatedList>
                </AppPanel>
              </AnimatedSection>
            </div>
          </main>
        </div>
      </div>
    </AnimatedPage>
  );
}
