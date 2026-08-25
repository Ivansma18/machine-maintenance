'use client';

import { useState } from 'react';

import { OperationsSidebar } from '@/components/layout/OperationsSidebar';
import { AnimatedPage } from '@/components/motion/AnimatedPage';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppPanel } from '@/components/ui/AppPanel';

import { MachineFilters } from './components/MachineFilters';
import { MachineForm } from './components/MachineForm';
import { MachinesContent } from './components/MachinesContent';
import { useMachines } from './hooks/useMachines';
import type { Machine } from './types';

export function MachinesPage() {
  const machines = useMachines();
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [retiringMachine, setRetiringMachine] = useState<Machine | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function openCreate() {
    setFeedback(null);
    setEditingMachine(null);
    setFormOpen(true);
  }

  function openEdit(machine: Machine) {
    setFeedback(null);
    setEditingMachine(machine);
    setFormOpen(true);
  }

  async function saveMachine(values: Parameters<typeof machines.saveMachine>[0]) {
    await machines.saveMachine(values, editingMachine ?? undefined);
    setFormOpen(false);
    setFeedback(
      editingMachine ? 'Datos de la maquina actualizados.' : 'Maquina agregada al registro.',
    );
  }

  async function confirmRetire() {
    if (!retiringMachine) return;
    await machines.retireMachine(retiringMachine);
    setRetiringMachine(null);
    setFeedback(`${retiringMachine.name} fue trasladada a retiradas.`);
  }

  const pageCount = machines.meta?.totalPages ?? 0;

  return (
    <AnimatedPage>
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <OperationsSidebar activeHref="/machines" />
        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-[#dfe4df] px-5 py-5 sm:px-8 lg:px-10">
            <div>
              <p className="eyebrow">Espacio de trabajo / activos</p>
              <h1 className="mb-0 mt-2 text-2xl font-black tracking-[-0.04em] text-[#17211f] sm:text-3xl">
                Maquinas
              </h1>
            </div>
            <AppButton onClick={openCreate}>Agregar maquina</AppButton>
          </header>
          <main className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-12">
            <AnimatedSection className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Activos de produccion</p>
                <p className="mb-0 mt-3 max-w-xl text-sm leading-6 text-[#68736f]">
                  Mantén actualizado el registro de equipos para que cada mantenimiento comience con
                  el contexto correcto.
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="tabular-nums m-0 text-3xl font-black tracking-[-0.06em] text-[#17211f]">
                  {machines.meta?.total ?? 0}
                </p>
                <p className="m-0 text-xs font-semibold text-[#68736f]">maquinas registradas</p>
              </div>
            </AnimatedSection>
            {machines.error ? (
              <div
                className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-5"
                role="alert"
              >
                <div>
                  <p className="m-0 text-sm font-bold text-[#8e2f28]">Registro no disponible</p>
                  <p className="m-0 mt-1 text-xs text-[#a65a52]">{machines.error}</p>
                </div>
                <AppButton variant="secondary" onClick={machines.retry}>
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
              title="Filtrar registro"
              eyebrow="Encuentra un activo de produccion"
            >
              <MachineFilters
                categories={machines.categories}
                filters={machines.filters}
                onChange={machines.updateFilters}
              />
            </AppPanel>
            {machines.loading && !machines.data ? (
              <div className="grid gap-3 animate-pulse">
                <div className="h-20 rounded-2xl bg-[#e8ece8]" />
                <div className="h-20 rounded-2xl bg-[#e8ece8]" />
                <div className="h-20 rounded-2xl bg-[#e8ece8]" />
              </div>
            ) : (
              <MachinesContent
                machines={machines.data ?? []}
                total={machines.meta?.total ?? 0}
                onCreate={openCreate}
                onEdit={openEdit}
                onRetire={setRetiringMachine}
              />
            )}
            {pageCount > 1 ? (
              <div className="mt-5 flex items-center justify-end gap-3">
                <AppButton
                  disabled={machines.filters.page <= 1}
                  variant="secondary"
                  onClick={() => machines.updateFilters({ page: machines.filters.page - 1 })}
                >
                  Anterior
                </AppButton>
                <span className="text-xs font-bold text-[#68736f]">
                  Pagina {machines.filters.page} de {pageCount}
                </span>
                <AppButton
                  disabled={machines.filters.page >= pageCount}
                  variant="secondary"
                  onClick={() => machines.updateFilters({ page: machines.filters.page + 1 })}
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
        title={editingMachine ? 'Editar maquina' : 'Agregar maquina'}
        width={720}
        onCancel={() => setFormOpen(false)}
      >
        <MachineForm
          key={editingMachine?.id ?? 'new'}
          categories={machines.categories}
          error={machines.actionError}
          loading={machines.actionLoading}
          machine={editingMachine ?? undefined}
          onCancel={() => setFormOpen(false)}
          onSubmit={saveMachine}
        />
      </AppModal>
      <AppModal
        centered
        okButtonProps={{ danger: true }}
        okText="Retirar maquina"
        open={Boolean(retiringMachine)}
        title="¿Retirar maquina?"
        confirmLoading={machines.actionLoading}
        onCancel={() => setRetiringMachine(null)}
        onOk={() => void confirmRetire()}
      >
        <p className="mb-0 text-sm leading-6 text-[#68736f]">
          {retiringMachine
            ? `${retiringMachine.name} permanecera en el registro como retirada y no sera eliminada.`
            : ''}
        </p>
      </AppModal>
    </AnimatedPage>
  );
}
