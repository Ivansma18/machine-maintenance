'use client';

import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { AppButton } from '@/components/ui/AppButton';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppShell } from '@/components/layout/AppShell';

import { NotificationFilters } from './components/NotificationFilters';
import { NotificationsContent } from './components/NotificationsContent';
import { useNotifications } from './hooks/useNotifications';

export function NotificationsPage() {
  const notifications = useNotifications();
  const criticalOpenCount = notifications.notifications.filter(
    (notification) => notification.severity === 'CRITICAL' && notification.status === 'OPEN',
  ).length;

  return (
    <AppShell
      activeHref="/notifications"
      header={{
        eyebrow: 'Espacio de trabajo / control',
        title: 'Alertas operativas',
        action: (
          <AppButton
            loading={notifications.actionLoading}
            onClick={() => void notifications.processPreventive()}
          >
            Procesar preventivos
          </AppButton>
        ),
      }}
    >
      <AnimatedSection className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Bandeja de atencion</p>
          <p className="mb-0 mt-3 max-w-xl text-sm leading-6 text-[#68736f]">
            Localiza primero las alertas criticas y urgentes, y cierra cada transición con una
            acción explícita.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="tabular-nums m-0 text-3xl font-black tracking-[-0.06em] text-[#17211f]">
            {notifications.meta.total}
          </p>
          <p className="m-0 text-xs font-semibold text-[#68736f]">alertas encontradas</p>
        </div>
      </AnimatedSection>
      {criticalOpenCount > 0 ? (
        <div
          className="mb-5 rounded-2xl border border-[#e9aaa1] bg-[#fff1ee] p-5 text-[#8e2f28]"
          role="alert"
        >
          <p className="m-0 text-sm font-black">
            {criticalOpenCount} alerta(s) critica(s) abierta(s)
          </p>
          <p className="m-0 mt-1 text-sm leading-6">
            Requieren atención inmediata y permanecen destacadas en esta bandeja.
          </p>
        </div>
      ) : null}
      {notifications.error ? (
        <div
          className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-5"
          role="alert"
        >
          <div>
            <p className="m-0 text-sm font-bold text-[#8e2f28]">Bandeja no disponible</p>
            <p className="m-0 mt-1 text-xs text-[#a65a52]">{notifications.error}</p>
          </div>
          <AppButton variant="secondary" onClick={notifications.retry}>
            Reintentar
          </AppButton>
        </div>
      ) : null}
      {notifications.actionError ? (
        <div
          className="mb-5 rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-4 text-sm font-semibold text-[#8e2f28]"
          role="alert"
        >
          {notifications.actionError}
        </div>
      ) : null}
      {notifications.feedback ? (
        <div
          className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-[#cfe0d2] bg-[#e8f1e9] p-4 text-sm font-semibold text-[#365441]"
          role="status"
        >
          <span>{notifications.feedback}</span>
          <button
            className="text-xs font-black uppercase tracking-[0.1em]"
            type="button"
            onClick={() => void notifications.retry()}
          >
            Actualizar
          </button>
        </div>
      ) : null}
      <AppPanel className="mb-5" title="Filtrar alertas" eyebrow="Encuentra una señal operativa">
        <NotificationFilters
          filters={notifications.filters}
          machines={notifications.machines}
          onChange={notifications.updateFilters}
        />
      </AppPanel>
      {notifications.loading && notifications.notifications.length === 0 ? (
        <div className="grid animate-pulse gap-3">
          <div className="h-40 rounded-2xl bg-[#e8ece8]" />
          <div className="h-40 rounded-2xl bg-[#e8ece8]" />
        </div>
      ) : (
        <NotificationsContent
          notifications={notifications.notifications}
          total={notifications.meta.total}
          onAcknowledge={(notification) => void notifications.acknowledge(notification)}
          onResolve={(notification) => void notifications.resolve(notification)}
          onDismiss={(notification) => void notifications.dismiss(notification)}
        />
      )}
      {notifications.meta.totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-end gap-3">
          <AppButton
            variant="secondary"
            disabled={notifications.filters.page <= 1}
            onClick={() => notifications.updateFilters({ page: notifications.filters.page - 1 })}
          >
            Anterior
          </AppButton>
          <span className="text-xs font-bold text-[#68736f]">
            Pagina {notifications.filters.page} de {notifications.meta.totalPages}
          </span>
          <AppButton
            variant="secondary"
            disabled={notifications.filters.page >= notifications.meta.totalPages}
            onClick={() => notifications.updateFilters({ page: notifications.filters.page + 1 })}
          >
            Siguiente
          </AppButton>
        </div>
      ) : null}
    </AppShell>
  );
}
