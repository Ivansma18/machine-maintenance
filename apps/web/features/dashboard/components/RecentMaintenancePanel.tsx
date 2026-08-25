import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { AnimatedList } from '@/components/motion/AnimatedList';
import { AnimatedListItem } from '@/components/motion/AnimatedListItem';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppTag } from '@/components/ui/AppTag';

import {
  formatDashboardDate,
  getMaintenanceTypeLabel,
  getResultLabel,
  getResultTone,
} from '../utils/dashboardFormatters';
import type { DashboardSummary } from '../types';

export function RecentMaintenancePanel({ logs }: { logs: DashboardSummary['recentLogs'] }) {
  return (
    <AnimatedSection id="alerts" delay={0.2}>
      <AppPanel title="Mantenimientos recientes" eyebrow="Ultima actividad">
        <AnimatedList>
          <div className="divide-y divide-[#dfe4df]">
            {logs.length ? (
              logs.map((log) => (
                <AnimatedListItem
                  className="flex items-center justify-between gap-4 px-5 py-4"
                  key={log.id}
                >
                  <div className="min-w-0">
                    <p className="m-0 truncate text-sm font-bold text-[#17211f]">
                      {log.machine.name}
                    </p>
                    <p className="m-0 mt-1 truncate text-xs text-[#68736f]">
                      {log.maintenancePlan?.name ?? getMaintenanceTypeLabel(log.type)} ·{' '}
                      {formatDashboardDate(log.performedAt)}
                    </p>
                  </div>
                  <AppTag tone={getResultTone(log.result)}>{getResultLabel(log.result)}</AppTag>
                </AnimatedListItem>
              ))
            ) : (
              <div className="p-6 text-sm text-[#68736f]">
                Todavia no hay mantenimientos registrados.
              </div>
            )}
          </div>
        </AnimatedList>
      </AppPanel>
    </AnimatedSection>
  );
}
