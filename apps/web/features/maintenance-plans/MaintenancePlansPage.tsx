'use client';

import { useState } from 'react';

import { OperationsSidebar } from '@/components/layout/OperationsSidebar';
import { AnimatedPage } from '@/components/motion/AnimatedPage';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppPanel } from '@/components/ui/AppPanel';

import { MaintenancePlanFilters } from './components/MaintenancePlanFilters';
import { MaintenancePlanForm } from './components/MaintenancePlanForm';
import { MaintenancePlansContent } from './components/MaintenancePlansContent';
import { useMaintenancePlans } from './hooks/useMaintenancePlans';
import type { MaintenancePlan } from './types';

export function MaintenancePlansPage() {
  const plans = useMaintenancePlans();
  const [editingPlan, setEditingPlan] = useState<MaintenancePlan | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [togglingPlan, setTogglingPlan] = useState<MaintenancePlan | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function openCreate() {
    setEditingPlan(null);
    setFeedback(null);
    setFormOpen(true);
  }

  function openEdit(plan: MaintenancePlan) {
    setEditingPlan(plan);
    setFeedback(null);
    setFormOpen(true);
  }

  async function savePlan(values: Parameters<typeof plans.savePlan>[0]) {
    await plans.savePlan(values, editingPlan ?? undefined);
    setFormOpen(false);
    setFeedback(editingPlan ? 'Plan preventivo actualizado.' : 'Plan preventivo agregado.');
  }

  async function confirmToggle() {
    if (!togglingPlan) return;
    await plans.changePlanStatus(togglingPlan);
    setTogglingPlan(null);
    setFeedback(
      togglingPlan.isActive ? 'Plan preventivo desactivado.' : 'Plan preventivo activado.',
    );
  }

  return (
    <AnimatedPage>
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <OperationsSidebar activeHref="/maintenance-plans" />
        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-[#dfe4df] px-5 py-5 sm:px-8 lg:px-10">
            <div>
              <p className="eyebrow">Espacio de trabajo / mantenimiento</p>
              <h1 className="mb-0 mt-2 text-2xl font-black tracking-[-0.04em] text-[#17211f] sm:text-3xl">
                Planes preventivos
              </h1>
            </div>
            <AppButton onClick={openCreate}>Agregar plan</AppButton>
          </header>
          <main className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-12">
            <AnimatedSection className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Frecuencias operativas</p>
                <p className="mb-0 mt-3 max-w-xl text-sm leading-6 text-[#68736f]">
                  Mantén visibles las próximas tareas preventivas antes de que se conviertan en
                  trabajo vencido.
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="tabular-nums m-0 text-3xl font-black tracking-[-0.06em] text-[#17211f]">
                  {plans.total}
                </p>
                <p className="m-0 text-xs font-semibold text-[#68736f]">planes visibles</p>
              </div>
            </AnimatedSection>
            {plans.error ? (
              <div
                className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-5"
                role="alert"
              >
                <div>
                  <p className="m-0 text-sm font-bold text-[#8e2f28]">Registro no disponible</p>
                  <p className="m-0 mt-1 text-xs text-[#a65a52]">{plans.error}</p>
                </div>
                <AppButton variant="secondary" onClick={plans.retry}>
                  Reintentar
                </AppButton>
              </div>
            ) : null}
            {feedback ? (
              <div
                className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-[#cfe0d2] bg-[#e8f1e9] p-4 text-sm font-semibold text-[#365441]"
                role="status"
              >
                <span>{feedback}</span>
                <button
                  className="text-xs font-black uppercase tracking-[0.1em]"
                  type="button"
                  onClick={() => setFeedback(null)}
                >
                  Cerrar
                </button>
              </div>
            ) : null}
            <AppPanel
              className="mb-5"
              title="Filtrar planes"
              eyebrow="Encuentra trabajo preventivo"
            >
              <MaintenancePlanFilters
                filters={plans.filters}
                machines={plans.machines}
                onChange={plans.updateFilters}
              />
            </AppPanel>
            {plans.loading && plans.allPlans.length === 0 ? (
              <div className="grid animate-pulse gap-3">
                <div className="h-32 rounded-2xl bg-[#e8ece8]" />
                <div className="h-32 rounded-2xl bg-[#e8ece8]" />
              </div>
            ) : (
              <MaintenancePlansContent
                plans={plans.data}
                total={plans.total}
                onCreate={openCreate}
                onEdit={openEdit}
                onToggleStatus={setTogglingPlan}
              />
            )}
            {plans.totalPages > 1 ? (
              <div className="mt-5 flex items-center justify-end gap-3">
                <AppButton
                  variant="secondary"
                  disabled={plans.filters.page <= 1}
                  onClick={() => plans.updateFilters({ page: plans.filters.page - 1 })}
                >
                  Anterior
                </AppButton>
                <span className="text-xs font-bold text-[#68736f]">
                  Pagina {plans.filters.page} de {plans.totalPages}
                </span>
                <AppButton
                  variant="secondary"
                  disabled={plans.filters.page >= plans.totalPages}
                  onClick={() => plans.updateFilters({ page: plans.filters.page + 1 })}
                >
                  Siguiente
                </AppButton>
              </div>
            ) : null}
          </main>
        </div>
      </div>
      <AppModal
        centered
        destroyOnHidden
        footer={null}
        open={formOpen}
        title={editingPlan ? 'Editar plan preventivo' : 'Agregar plan preventivo'}
        width={720}
        onCancel={() => setFormOpen(false)}
      >
        <MaintenancePlanForm
          key={editingPlan?.id ?? 'new'}
          plan={editingPlan ?? undefined}
          machines={plans.machines}
          error={plans.actionError}
          loading={plans.actionLoading}
          onCancel={() => setFormOpen(false)}
          onSubmit={savePlan}
        />
      </AppModal>
      <AppModal
        centered
        okButtonProps={{ danger: togglingPlan?.isActive }}
        okText={togglingPlan?.isActive ? 'Desactivar plan' : 'Activar plan'}
        open={Boolean(togglingPlan)}
        title={togglingPlan?.isActive ? '¿Desactivar plan?' : '¿Activar plan?'}
        confirmLoading={plans.actionLoading}
        onCancel={() => setTogglingPlan(null)}
        onOk={() => void confirmToggle()}
      >
        <p className="mb-0 text-sm leading-6 text-[#68736f]">
          {togglingPlan
            ? `${togglingPlan.name} ${togglingPlan.isActive ? 'dejara de generar trabajo preventivo pendiente.' : 'volverá a participar en el trabajo preventivo.'}`
            : ''}
        </p>
      </AppModal>
    </AnimatedPage>
  );
}
