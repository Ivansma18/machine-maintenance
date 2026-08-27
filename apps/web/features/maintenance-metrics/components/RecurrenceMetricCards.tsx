import { AppPanel } from '@/components/ui/AppPanel';
import { formatCost } from '../utils/metricsFormatters';
import type { RecurrenceMetrics } from '../types';

export function RecurrenceMetricCards({ summary }: { summary: RecurrenceMetrics['summary'] }) {
  const cards = [
    ['Fallas registradas', summary.failureCount, 'Resultado fallido o critico'],
    ['Maquinas con patrón', summary.recurringMachines, 'Reincidencia o consumo repetido'],
    ['Preventivos vencidos', summary.overduePreventiveCount, 'Planes activos fuera de fecha'],
    ['Costo estimado', formatCost(summary.maintenanceCost), 'Piezas consumidas en el periodo'],
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, detail]) => (
        <AppPanel key={label as string}>
          <div className="p-5">
            <p className="eyebrow">{label}</p>
            <p className="tabular-nums m-0 mt-3 text-3xl font-black tracking-[-0.06em] text-[#17211f]">
              {value}
            </p>
            <p className="m-0 mt-2 text-xs font-semibold leading-5 text-[#68736f]">{detail}</p>
          </div>
        </AppPanel>
      ))}
    </div>
  );
}
