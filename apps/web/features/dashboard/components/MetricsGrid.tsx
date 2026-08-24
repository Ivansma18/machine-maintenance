import { AnimatedSection } from '@/components/motion/AnimatedSection';

import { MetricCard } from './MetricCard';
import type { DashboardSummary } from '../types';

export function MetricsGrid({ summary }: { summary: DashboardSummary }) {
  return (
    <AnimatedSection className="mb-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" delay={0.1}>
      <MetricCard
        label="Active machines"
        value={summary.machines.active}
        detail="Ready for production"
        tone="ink"
      />
      <MetricCard
        label="Due soon"
        value={summary.maintenance.dueSoon}
        detail="Inside warning window"
        tone="warning"
      />
      <MetricCard
        label="Overdue"
        value={summary.maintenance.overdue}
        detail="Needs attention today"
        tone="critical"
      />
      <MetricCard
        label="Urgent alerts"
        value={summary.openUrgentNotifications}
        detail="Open critical work"
        tone="sage"
      />
    </AnimatedSection>
  );
}
