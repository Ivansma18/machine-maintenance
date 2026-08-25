import { AppTag } from '@/components/ui/AppTag';
import { formatDateTime } from '@/lib/formatters/dateFormatters';

import type { MaintenanceLog } from '../types';
import {
  getMaintenanceLogSummary,
  getMaintenanceResultLabel,
  getMaintenanceResultTone,
  getMaintenanceTypeLabel,
} from '../utils/maintenanceLogFormatters';

type MaintenanceLogListProps = { logs: MaintenanceLog[] };

export function MaintenanceLogList({ logs }: MaintenanceLogListProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#bfc9c1] bg-white p-10 text-center">
        <p className="m-0 text-lg font-black text-[#17211f]">No hay mantenimientos registrados</p>
        <p className="mx-auto mb-0 mt-2 max-w-md text-sm leading-6 text-[#68736f]">
          Ajusta los filtros o registra el primer mantenimiento del historial.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {logs.map((log) => (
        <article
          className="rounded-2xl border border-[#dfe4df] bg-white p-5 shadow-[0_12px_35px_rgba(35,55,43,0.05)]"
          key={log.id}
        >
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="m-0 text-base font-black text-[#17211f]">{log.machine.name}</h2>
                <AppTag tone={getMaintenanceResultTone(log.result)}>
                  {getMaintenanceResultLabel(log.result)}
                </AppTag>
              </div>
              <p className="m-0 mt-2 text-sm font-bold text-[#426b50]">
                {getMaintenanceTypeLabel(log.type)} · {formatDateTime(log.performedAt)}
              </p>
              <p className="m-0 mt-1 text-xs text-[#68736f]">
                {log.machine.location} · {log.machine.category.name}
              </p>
            </div>
            <div className="text-left lg:text-right">
              <p className="eyebrow m-0">Responsable</p>
              <p className="m-0 mt-1 text-sm font-bold text-[#17211f]">{log.performedBy}</p>
              <p className="m-0 mt-1 text-xs text-[#68736f]">
                {log.maintenancePlan?.name ?? 'Sin plan asociado'}
              </p>
            </div>
          </div>
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${log.result === 'CRITICAL_FAILURE' ? 'border border-[#f0c6bf] bg-[#fff1ee] text-[#8e2f28]' : 'bg-[#f5f7f4] text-[#68736f]'}`}
          >
            <p className="m-0 font-bold">{getMaintenanceLogSummary(log)}</p>
            {log.notes ? <p className="m-0 mt-1 leading-6">{log.notes}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
