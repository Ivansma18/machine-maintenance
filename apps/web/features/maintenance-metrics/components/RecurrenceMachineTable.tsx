import Link from 'next/link';
import { AppTag } from '@/components/ui/AppTag';
import type { RecurrenceMachine } from '../types';
import { formatCost, maintenanceTypeLabels, metricState } from '../utils/metricsFormatters';

export function RecurrenceMachineTable({ machines }: { machines: RecurrenceMachine[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[#dfe4df] text-[0.65rem] uppercase tracking-[0.1em] text-[#68736f]">
            <th className="px-5 py-3 font-black">Maquina</th>
            <th className="px-5 py-3 font-black">Fallas</th>
            <th className="px-5 py-3 font-black">Preventivos</th>
            <th className="px-5 py-3 font-black">Repeticion</th>
            <th className="px-5 py-3 font-black">Costo</th>
            <th className="px-5 py-3 font-black">Estado</th>
          </tr>
        </thead>
        <tbody>
          {machines.map((machine) => {
            const state = metricState(machine);
            return (
              <tr className="border-b border-[#eef1ec] last:border-0" key={machine.machineId}>
                <td className="px-5 py-4">
                  <Link
                    className="font-black text-[#365441] underline-offset-4 hover:underline"
                    href={`/machines/${machine.machineId}`}
                  >
                    {machine.machineName}
                  </Link>
                  <p className="m-0 mt-1 text-xs text-[#68736f]">
                    {machine.category || 'Sin categoria'}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm font-bold">
                  {machine.failureCount}
                  <span className="block text-xs font-medium text-[#68736f]">
                    {machine.correctiveCount} correctivas
                  </span>
                </td>
                <td className="px-5 py-4 text-sm font-bold">
                  {machine.overduePreventiveCount || '0'}
                </td>
                <td className="px-5 py-4 text-xs font-bold text-[#68736f]">
                  {machine.recurringFailure
                    ? `${maintenanceTypeLabels[machine.recurringFailure.type] ?? machine.recurringFailure.type} x${machine.recurringFailure.count}`
                    : null}
                  {machine.repeatedPart ? (
                    <span className="block text-[#8e2f28]">
                      {machine.repeatedPart.name} x{machine.repeatedPart.count}
                    </span>
                  ) : null}
                  {!machine.recurringFailure && !machine.repeatedPart ? 'Sin repeticion' : null}
                </td>
                <td className="px-5 py-4 text-sm font-black">
                  {formatCost(machine.maintenanceCost)}
                </td>
                <td className="px-5 py-4">
                  <AppTag
                    tone={
                      state === 'critical'
                        ? 'critical'
                        : state === 'warning'
                          ? 'warning'
                          : 'success'
                    }
                  >
                    {state === 'critical'
                      ? 'Revisar'
                      : state === 'warning'
                        ? 'Observar'
                        : 'Estable'}
                  </AppTag>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
