import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { AppPanel } from '@/components/ui/AppPanel';

import type { DashboardSummary } from '../types';

export function MaintenanceHorizonPanel({
  maintenance,
}: {
  maintenance: DashboardSummary['maintenance'];
}) {
  return (
    <AnimatedSection id="schedule" delay={0.15}>
      <AppPanel title="Maintenance horizon" eyebrow="Preventive workload">
        <div className="grid grid-cols-2 divide-x divide-[#dfe4df] p-6">
          <div>
            <p className="eyebrow">Due soon</p>
            <p className="tabular-nums mb-1 mt-3 text-4xl font-black tracking-[-0.06em] text-[#a56c14]">
              {maintenance.dueSoon}
            </p>
            <p className="m-0 text-xs text-[#68736f]">within warning window</p>
          </div>
          <div className="pl-6">
            <p className="eyebrow">Overdue</p>
            <p className="tabular-nums mb-1 mt-3 text-4xl font-black tracking-[-0.06em] text-[#d95b4f]">
              {maintenance.overdue}
            </p>
            <p className="m-0 text-xs text-[#68736f]">past the due date</p>
          </div>
        </div>
      </AppPanel>
    </AnimatedSection>
  );
}
