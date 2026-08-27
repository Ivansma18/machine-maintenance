import { AppButton } from '@/components/ui/AppButton';
import { AppTag } from '@/components/ui/AppTag';
import type { WorkOrder } from '../types';
import { formatDate, priorityLabels, statusLabels, typeLabels } from '../utils/workOrderFormatters';

export function WorkOrderDetail({
  order,
  currentUserId,
  loading,
  onAssign,
  onStart,
  onComplete,
  onCancel,
}: {
  order: WorkOrder;
  currentUserId?: string;
  loading: boolean;
  onAssign: (id: string) => void;
  onStart: () => void;
  onComplete: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="grid gap-6">
      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          <AppTag tone={order.priority === 'URGENT' ? 'critical' : 'warning'}>
            {priorityLabels[order.priority]}
          </AppTag>
          <AppTag>{statusLabels[order.status]}</AppTag>
        </div>
        <h2 className="m-0 text-2xl font-black tracking-[-0.04em]">{order.title}</h2>
        <p className="mb-0 mt-2 text-sm text-[#68736f]">
          {order.machine.name} · {order.machine.location}
        </p>
      </div>
      <div className="grid gap-4 rounded-xl bg-[#f4f5f1] p-4 text-sm sm:grid-cols-2">
        <div>
          <span className="eyebrow">Tipo</span>
          <p className="mb-0 mt-1 font-bold">{typeLabels[order.type]}</p>
        </div>
        <div>
          <span className="eyebrow">Responsable</span>
          <p className="mb-0 mt-1 font-bold">{order.assignedTo?.name ?? 'Sin asignar'}</p>
        </div>
        <div>
          <span className="eyebrow">Programada</span>
          <p className="mb-0 mt-1 font-bold">{formatDate(order.scheduledAt)}</p>
        </div>
        <div>
          <span className="eyebrow">Vencimiento</span>
          <p className="mb-0 mt-1 font-bold">{formatDate(order.dueAt)}</p>
        </div>
      </div>
      {order.description ? (
        <p className="m-0 whitespace-pre-wrap text-sm leading-6 text-[#53605a]">
          {order.description}
        </p>
      ) : (
        <p className="m-0 text-sm italic text-[#68736f]">Sin descripción adicional.</p>
      )}
      <div className="flex flex-wrap gap-2 border-t border-[#dfe4df] pt-5">
        {currentUserId &&
        !order.assignedTo &&
        !['COMPLETED', 'CANCELLED'].includes(order.status) ? (
          <AppButton variant="secondary" loading={loading} onClick={() => onAssign(currentUserId)}>
            Asignarme
          </AppButton>
        ) : null}
        {['OPEN', 'SCHEDULED'].includes(order.status) ? (
          <AppButton loading={loading} onClick={onStart}>
            Iniciar
          </AppButton>
        ) : null}
        {order.status === 'IN_PROGRESS' ? (
          <AppButton loading={loading} onClick={onComplete}>
            Completar
          </AppButton>
        ) : null}
        {!['COMPLETED', 'CANCELLED'].includes(order.status) ? (
          <AppButton variant="danger" loading={loading} onClick={onCancel}>
            Cancelar
          </AppButton>
        ) : null}
      </div>
    </div>
  );
}
