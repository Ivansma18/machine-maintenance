'use client';

import { useState } from 'react';

import { OperationsSidebar } from '@/components/layout/OperationsSidebar';
import { AnimatedPage } from '@/components/motion/AnimatedPage';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppPanel } from '@/components/ui/AppPanel';

import { MaintenanceLogFilters } from './components/MaintenanceLogFilters';
import { MaintenanceLogForm } from './components/MaintenanceLogForm';
import { MaintenanceLogsContent } from './components/MaintenanceLogsContent';
import { useMaintenanceLogs } from './hooks/useMaintenanceLogs';

export function MaintenanceLogsPage() {
  const logs = useMaintenanceLogs();
  const [formOpen, setFormOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function saveLog(values: Parameters<typeof logs.saveLog>[0]) {
    const result = await logs.saveLog(values);
    setFormOpen(false);
    setFeedback(
      result.criticalNotification
        ? 'Mantenimiento registrado y alerta urgente creada.'
        : 'Mantenimiento registrado en el historial.',
    );
  }

  return (
    <AnimatedPage>
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <OperationsSidebar activeHref="/maintenance-logs" />
        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-[#dfe4df] px-5 py-5 sm:px-8 lg:px-10">
            <div>
              <p className="eyebrow">Espacio de trabajo / mantenimiento</p>
              <h1 className="mb-0 mt-2 text-2xl font-black tracking-[-0.04em] text-[#17211f] sm:text-3xl">
                Historial de mantenimientos
              </h1>
            </div>
            <AppButton
              onClick={() => {
                setFeedback(null);
                setFormOpen(true);
              }}
            >
              Registrar mantenimiento
            </AppButton>
          </header>
          <main className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-12">
            <AnimatedSection className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Actividad tecnica</p>
                <p className="mb-0 mt-3 max-w-xl text-sm leading-6 text-[#68736f]">
                  Registra cada intervención y conserva una trazabilidad clara de la operación
                  preventiva y correctiva.
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="tabular-nums m-0 text-3xl font-black tracking-[-0.06em] text-[#17211f]">
                  {logs.meta.total}
                </p>
                <p className="m-0 text-xs font-semibold text-[#68736f]">registros encontrados</p>
              </div>
            </AnimatedSection>
            {logs.error ? (
              <div
                className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-5"
                role="alert"
              >
                <div>
                  <p className="m-0 text-sm font-bold text-[#8e2f28]">Historial no disponible</p>
                  <p className="m-0 mt-1 text-xs text-[#a65a52]">{logs.error}</p>
                </div>
                <AppButton variant="secondary" onClick={logs.retry}>
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
              title="Filtrar historial"
              eyebrow="Encuentra una intervención"
            >
              <MaintenanceLogFilters
                filters={logs.filters}
                machines={logs.machines}
                onChange={logs.updateFilters}
              />
            </AppPanel>
            {logs.loading && logs.logs.length === 0 ? (
              <div className="grid animate-pulse gap-3">
                <div className="h-36 rounded-2xl bg-[#e8ece8]" />
                <div className="h-36 rounded-2xl bg-[#e8ece8]" />
              </div>
            ) : (
              <MaintenanceLogsContent logs={logs.logs} total={logs.meta.total} />
            )}
            {logs.meta.totalPages > 1 ? (
              <div className="mt-5 flex items-center justify-end gap-3">
                <AppButton
                  variant="secondary"
                  disabled={logs.filters.page <= 1}
                  onClick={() => logs.updateFilters({ page: logs.filters.page - 1 })}
                >
                  Anterior
                </AppButton>
                <span className="text-xs font-bold text-[#68736f]">
                  Pagina {logs.filters.page} de {logs.meta.totalPages}
                </span>
                <AppButton
                  variant="secondary"
                  disabled={logs.filters.page >= logs.meta.totalPages}
                  onClick={() => logs.updateFilters({ page: logs.filters.page + 1 })}
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
        title="Registrar mantenimiento"
        width={760}
        onCancel={() => setFormOpen(false)}
      >
        <MaintenanceLogForm
          machines={logs.machines}
          plans={logs.plans}
          error={logs.actionError}
          loading={logs.actionLoading}
          onCancel={() => setFormOpen(false)}
          onSubmit={saveLog}
        />
      </AppModal>
    </AnimatedPage>
  );
}
