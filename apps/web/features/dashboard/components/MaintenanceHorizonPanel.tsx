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
      <AppPanel title="Horizonte de mantenimiento" eyebrow="Carga preventiva">
        <div className="grid grid-cols-2 divide-x divide-[#dfe4df] p-6">
          <div>
            <p className="eyebrow">Proximos</p>
            <p className="tabular-nums mb-1 mt-3 text-4xl font-black tracking-[-0.06em] text-[#a56c14]">
              {maintenance.dueSoon}
            </p>
            <p className="m-0 text-xs text-[#68736f]">dentro de la ventana de aviso</p>
          </div>
          <div className="pl-6">
            <p className="eyebrow">Vencidos</p>
            <p className="tabular-nums mb-1 mt-3 text-4xl font-black tracking-[-0.06em] text-[#d95b4f]">
              {maintenance.overdue}
            </p>
            <p className="m-0 text-xs text-[#68736f]">pasaron la fecha limite</p>
          </div>
        </div>
      </AppPanel>
    </AnimatedSection>
  );
}
