import { AppPanel } from '@/components/ui/AppPanel';

import { getMachineDistribution } from '../utils/dashboardFormatters';
import type { DashboardSummary } from '../types';

export function MachineHealthPanel({ machines }: { machines: DashboardSummary['machines'] }) {
  const distribution = getMachineDistribution(machines);
  const total = Math.max(machines.total, 1);

  return (
    <AppPanel
      className="overflow-hidden"
      title="Estado de las maquinas"
      eyebrow="Flota actual"
      extra={
        <span className="tabular-nums text-sm font-black text-[#17211f]">
          {machines.total} en total
        </span>
      }
    >
      <div className="grid gap-8 p-5 sm:grid-cols-[0.9fr_1.1fr] sm:p-7">
        <div className="flex flex-col justify-between">
          <div>
            <p className="eyebrow">Listas para produccion</p>
            <p className="tabular-nums mb-1 mt-4 text-6xl font-black tracking-[-0.08em] text-[#17211f]">
              {machines.active}
            </p>
            <p className="m-0 text-sm text-[#68736f]">maquinas activas en planta</p>
          </div>
          <p className="mb-0 mt-8 text-xs font-semibold text-[#668875]">
            {machines.underMaintenance} reciben atencion actualmente
          </p>
        </div>
        <div className="flex flex-col justify-center">
          <div
            className="mb-6 flex h-4 overflow-hidden rounded-full bg-[#e8ece8]"
            aria-label="Distribucion por estado de maquina"
          >
            {distribution.map((status) => (
              <span
                key={status.label}
                style={{ backgroundColor: status.color, width: `${(status.count / total) * 100}%` }}
                title={`${status.label}: ${status.count}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            {distribution.map((status) => (
              <div className="flex items-center justify-between gap-3 text-sm" key={status.label}>
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
  );
}
