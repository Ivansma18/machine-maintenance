import Link from 'next/link';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppTag } from '@/components/ui/AppTag';
import type { WorkOrder } from '../types';
import { priorityLabels, statusLabels } from '../utils/workOrderFormatters';

export function MachineWorkOrders({ orders, loading }: { orders: WorkOrder[]; loading: boolean }) {
  const visible = orders.filter((order) => order.status !== 'CANCELLED').slice(0, 4);
  return (
    <AppPanel
      title="Órdenes de trabajo"
      eyebrow="Ejecución reciente"
      extra={
        <Link
          className="text-xs font-black uppercase tracking-[0.1em] text-[#365441]"
          href="/work-orders"
        >
          Ver todas
        </Link>
      }
    >
      <div className="px-5 pb-5 pt-1">
        {loading ? (
          <div className="h-20 animate-pulse rounded-xl bg-[#e8ece8]" />
        ) : visible.length ? (
          <div className="divide-y divide-[#e7ebe7]">
            {visible.map((order) => (
              <Link
                className="block py-3 first:pt-0 last:pb-0"
                href={`/work-orders/${order.id}`}
                key={order.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-[#17211f]">{order.title}</span>
                  <AppTag tone={order.priority === 'URGENT' ? 'critical' : 'warning'}>
                    {priorityLabels[order.priority]}
                  </AppTag>
                </div>
                <p className="m-0 mt-1 text-xs font-semibold text-[#68736f]">
                  {statusLabels[order.status]} · {order.assignedTo?.name ?? 'Sin responsable'}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="m-0 text-sm text-[#68736f]">
            No hay órdenes activas o recientes para esta máquina.
          </p>
        )}
      </div>
    </AppPanel>
  );
}
