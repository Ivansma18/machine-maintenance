'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppPanel } from '@/components/ui/AppPanel';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { useSession } from '@/hooks/useSession';
import { fetchMachines } from '@/features/machines/api/machinesApi';
import { fetchWorkOrder } from './api/workOrdersApi';
import { WorkOrderDetail } from './components/WorkOrderDetail';
import { WorkOrderFilters } from './components/WorkOrderFilters';
import { WorkOrderForm } from './components/WorkOrderForm';
import { WorkOrderList } from './components/WorkOrderList';
import { useWorkOrders } from './hooks/useWorkOrders';
import type { WorkOrder, WorkOrderMachine } from './types';

export function WorkOrdersPage() {
  const orders = useWorkOrders();
  const { identity } = useSession();
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<WorkOrder | null>(null);
  const [cancelTarget, setCancelTarget] = useState<WorkOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [machines, setMachines] = useState<WorkOrderMachine[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    void fetchMachines({ search: '', page: 1 }, controller.signal)
      .then((result) => setMachines(result.data))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);
  async function view(order: WorkOrder) {
    setSelected(await fetchWorkOrder(order.id));
  }
  async function submit(values: Parameters<typeof orders.create>[0]) {
    await orders.create(values);
    setFormOpen(false);
  }
  async function action(callback: () => Promise<unknown>) {
    await callback();
    if (selected) setSelected(await fetchWorkOrder(selected.id));
  }
  return (
    <AppShell
      activeHref="/work-orders"
      header={{
        eyebrow: 'Espacio de trabajo / ejecución',
        title: 'Órdenes de trabajo',
        action: (
          <PermissionGate permission="work-orders:create">
            <AppButton onClick={() => setFormOpen(true)}>Nueva orden</AppButton>
          </PermissionGate>
        ),
      }}
    >
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Control diario</p>
          <p className="mb-0 mt-3 max-w-xl text-sm leading-6 text-[#68736f]">
            Coordina lo pendiente, activa el trabajo en piso y conserva una lectura clara de lo que
            ya terminó.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="tabular-nums m-0 text-3xl font-black tracking-[-0.06em]">
            {orders.meta.total}
          </p>
          <p className="m-0 text-xs font-semibold text-[#68736f]">órdenes visibles</p>
        </div>
      </div>
      {orders.error ? (
        <div
          className="mb-5 flex items-center justify-between rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-5"
          role="alert"
        >
          <span className="text-sm font-bold text-[#8e2f28]">{orders.error}</span>
          <AppButton variant="secondary" onClick={orders.retry}>
            Reintentar
          </AppButton>
        </div>
      ) : null}
      {orders.actionError ? (
        <div
          className="mb-5 rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-4 text-sm font-semibold text-[#8e2f28]"
          role="alert"
        >
          {orders.actionError}
        </div>
      ) : null}
      <AppPanel className="mb-5" title="Filtrar órdenes" eyebrow="Prioridad operativa">
        <WorkOrderFilters
          filters={orders.filters}
          machines={machines}
          onChange={orders.updateFilters}
        />
      </AppPanel>
      <AppPanel title="Cola de trabajo" eyebrow="Seguimiento en vivo">
        <div className="px-1 pb-1">
          {orders.loading && !orders.data.length ? (
            <div className="grid gap-3 p-5">
              <div className="h-28 animate-pulse rounded-xl bg-[#e8ece8]" />
              <div className="h-28 animate-pulse rounded-xl bg-[#e8ece8]" />
            </div>
          ) : (
            <WorkOrderList
              orders={orders.data}
              onView={view}
              onStart={(id) => void action(() => orders.start(id))}
              onComplete={(id) => void action(() => orders.complete(id))}
              onCancel={setCancelTarget}
            />
          )}
        </div>
      </AppPanel>
      {orders.meta.totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-end gap-3">
          <AppButton
            variant="secondary"
            disabled={orders.filters.page <= 1}
            onClick={() => orders.updateFilters({ page: orders.filters.page - 1 })}
          >
            Anterior
          </AppButton>
          <span className="text-xs font-bold text-[#68736f]">
            Página {orders.filters.page} de {orders.meta.totalPages}
          </span>
          <AppButton
            variant="secondary"
            disabled={orders.filters.page >= orders.meta.totalPages}
            onClick={() => orders.updateFilters({ page: orders.filters.page + 1 })}
          >
            Siguiente
          </AppButton>
        </div>
      ) : null}
      <AppModal
        centered
        destroyOnHidden
        footer={null}
        open={formOpen}
        title="Nueva orden de trabajo"
        width={720}
        onCancel={() => setFormOpen(false)}
      >
        <WorkOrderForm
          machines={machines}
          currentUserId={identity?.user.id}
          loading={orders.actionLoading}
          error={orders.actionError}
          onCancel={() => setFormOpen(false)}
          onSubmit={submit}
        />
      </AppModal>
      <AppModal
        centered
        footer={null}
        open={Boolean(selected)}
        title="Detalle de orden"
        width={680}
        onCancel={() => setSelected(null)}
      >
        {selected ? (
          <WorkOrderDetail
            order={selected}
            currentUserId={identity?.user.id}
            loading={orders.actionLoading}
            onAssign={(id) => void action(() => orders.assign(selected.id, id))}
            onStart={() => void action(() => orders.start(selected.id))}
            onComplete={() => void action(() => orders.complete(selected.id))}
            onCancel={() => setCancelTarget(selected)}
          />
        ) : null}
      </AppModal>
      <AppModal
        centered
        okButtonProps={{ danger: true }}
        okText="Cancelar orden"
        open={Boolean(cancelTarget)}
        title="¿Cancelar esta orden?"
        confirmLoading={orders.actionLoading}
        onCancel={() => setCancelTarget(null)}
        onOk={() => {
          if (cancelTarget && cancelReason.trim())
            void action(() => orders.cancel(cancelTarget.id, cancelReason.trim())).then(() => {
              setCancelTarget(null);
              setCancelReason('');
            });
        }}
      >
        <p className="text-sm text-[#68736f]">
          El motivo quedará registrado en la auditoría y la orden no podrá reabrirse.
        </p>
        <textarea
          className="min-h-24 w-full rounded-lg border border-[#d9dfda] px-3 py-2 text-sm outline-none focus:border-[#426b50]"
          placeholder="Motivo de cancelación"
          value={cancelReason}
          onChange={(event) => setCancelReason(event.target.value)}
        />
      </AppModal>
    </AppShell>
  );
}
