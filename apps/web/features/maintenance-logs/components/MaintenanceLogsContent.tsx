import { AppPanel } from '@/components/ui/AppPanel';

import { MaintenanceLogList } from './MaintenanceLogList';
import type { MaintenanceLog } from '../types';

type MaintenanceLogsContentProps = { logs: MaintenanceLog[]; total: number };

export function MaintenanceLogsContent({ logs, total }: MaintenanceLogsContentProps) {
  return (
    <AppPanel title="Historial operativo" eyebrow="Registros inmutables">
      <div className="px-5 pb-5 pt-1">
        <p className="m-0 mb-4 text-xs font-semibold text-[#68736f]">
          {total} mantenimientos encontrados
        </p>
        <MaintenanceLogList logs={logs} />
      </div>
    </AppPanel>
  );
}
