import Link from 'next/link';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { AppButton } from '@/components/ui/AppButton';
import { AppTag } from '@/components/ui/AppTag';
import { AnimatedList } from '@/components/motion/AnimatedList';
import type { WorkOrder } from '../types';
import {
  formatDate,
  isOverdue,
  priorityLabels,
  statusLabels,
  typeLabels,
} from '../utils/workOrderFormatters';

export function WorkOrderList({
  orders,
  onView,
  onStart,
  onComplete,
  onCancel,
}: {
  orders: WorkOrder[];
  onView: (order: WorkOrder) => void;
  onStart: (id: string) => void;
  onComplete: (order: WorkOrder) => void;
  onCancel: (order: WorkOrder) => void;
}) {
  if (!orders.length)
    return (
      <div className="rounded-xl border border-dashed border-[#cbd5cb] px-6 py-12 text-center">
        <p className="m-0 text-lg font-black">No hay órdenes con estos filtros</p>
        <p className="mb-4 mt-2 text-sm text-[#68736f]">
          Prueba limpiando los filtros o crea una nueva intervención.
        </p>
      </div>
    );
  return (
    <AnimatedList>
      <div className="divide-y divide-[#e7ebe7]">
        {orders.map((order) => (
          <article className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_auto]" key={order.id}>
            <button className="text-left" type="button" onClick={() => onView(order)}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <AppTag
                  tone={
                    order.priority === 'URGENT'
                      ? 'critical'
                      : order.status === 'COMPLETED'
                        ? 'success'
                        : 'warning'
                  }
                >
                  {priorityLabels[order.priority]}
                </AppTag>
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#68736f]">
                  {statusLabels[order.status]}
                </span>
                {isOverdue(order.dueAt, order.status) ? (
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#b13f35]">
                    Vencida
                  </span>
                ) : null}
              </div>
              <h3 className="m-0 text-base font-black text-[#17211f]">{order.title}</h3>
              <p className="m-0 mt-1 text-sm text-[#68736f]">
                {order.machine.name} · {order.machine.location} · {typeLabels[order.type]}
              </p>
              <p className="m-0 mt-3 text-xs font-semibold text-[#68736f]">
                {order.assignedTo ? `Responsable: ${order.assignedTo.name}` : 'Sin responsable'} ·
                Vence: {formatDate(order.dueAt)}
              </p>
            </button>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {order.status === 'OPEN' || order.status === 'SCHEDULED' ? (
                <PermissionGate permission="work-orders:start">
                  <AppButton variant="secondary" onClick={() => onStart(order.id)}>
                    Iniciar
                  </AppButton>
                </PermissionGate>
              ) : null}
              {order.status === 'IN_PROGRESS' ? (
                <PermissionGate permission="work-orders:complete">
                  <AppButton onClick={() => onComplete(order)}>Completar</AppButton>
                </PermissionGate>
              ) : null}
              {!['COMPLETED', 'CANCELLED'].includes(order.status) ? (
                <PermissionGate permission="work-orders:cancel">
                  <AppButton variant="danger" onClick={() => onCancel(order)}>
                    Cancelar
                  </AppButton>
                </PermissionGate>
              ) : null}
              <Link
                className="text-xs font-black uppercase tracking-[0.1em] text-[#365441]"
                href={`/work-orders/${order.id}`}
              >
                Detalle
              </Link>
            </div>
          </article>
        ))}
      </div>
    </AnimatedList>
  );
}
