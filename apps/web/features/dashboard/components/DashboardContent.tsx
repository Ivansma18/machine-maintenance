import { AnimatedSection } from '@/components/motion/AnimatedSection';

import { MachineHealthPanel } from './MachineHealthPanel';
import { MaintenanceHorizonPanel } from './MaintenanceHorizonPanel';
import { MetricsGrid } from './MetricsGrid';
import { RecentMaintenancePanel } from './RecentMaintenancePanel';
import { UrgentLanePanel } from './UrgentLanePanel';
import type { DashboardSummary } from '../types';

export function DashboardContent({ summary }: { summary: DashboardSummary }) {
  return (
    <>
      <AnimatedSection className="mb-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]" delay={0.05}>
        <MachineHealthPanel machines={summary.machines} />
        <UrgentLanePanel count={summary.openUrgentNotifications} />
      </AnimatedSection>
      <MetricsGrid summary={summary} />
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <MaintenanceHorizonPanel maintenance={summary.maintenance} />
        <RecentMaintenancePanel logs={summary.recentLogs} />
      </div>
    </>
  );
}
