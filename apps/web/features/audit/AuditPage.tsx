'use client';

import { PermissionGate } from '@/components/auth/PermissionGate';
import { AppButton } from '@/components/ui/AppButton';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppShell } from '@/components/layout/AppShell';
import { AuditEventList } from './components/AuditEventList';
import { AuditFiltersForm } from './components/AuditFilters';
import { useAuditEvents } from './hooks/useAuditEvents';

export function AuditPage() {
  const audit = useAuditEvents();
  return (
    <AppShell
      activeHref="/audit"
      header={{
        eyebrow: 'Administración / trazabilidad',
        title: 'Consulta de auditoría',
        action: (
          <AppButton variant="secondary" onClick={audit.retry}>
            Actualizar eventos
          </AppButton>
        ),
      }}
    >
      <PermissionGate
        permission="audit:read"
        fallback={
          <div className="rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-5 text-sm font-bold text-[#8e2f28]">
            No tienes permisos para consultar la auditoría.
          </div>
        }
      >
        <div className="mb-8">
          <p className="eyebrow">Registro inmutable de actividad</p>
          <p className="mb-0 mt-3 max-w-2xl text-sm leading-6 text-[#68736f]">
            Consulta quién ejecutó una acción, sobre qué entidad, cuándo ocurrió y con qué solicitud
            se relaciona.
          </p>
        </div>
        {audit.error ? (
          <div
            className="mb-5 flex items-center justify-between rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-5 text-sm font-bold text-[#8e2f28]"
            role="alert"
          >
            <span>{audit.error}</span>
            <AppButton variant="secondary" onClick={audit.retry}>
              Reintentar
            </AppButton>
          </div>
        ) : null}
        <AppPanel className="mb-5" title="Filtrar eventos" eyebrow="Búsqueda administrativa">
          <AuditFiltersForm filters={audit.filters} onChange={audit.updateFilters} />
        </AppPanel>
        <AppPanel title="Eventos auditados" eyebrow={`${audit.meta.total} registros`}>
          <div className={audit.loading ? 'animate-pulse opacity-60' : ''}>
            <AuditEventList events={audit.events} />
          </div>
        </AppPanel>
        {audit.meta.totalPages > 1 ? (
          <div className="mt-5 flex items-center justify-end gap-3">
            <AppButton
              variant="secondary"
              disabled={audit.filters.page <= 1}
              onClick={() => audit.updateFilters({ page: audit.filters.page - 1 })}
            >
              Anterior
            </AppButton>
            <span className="text-xs font-bold text-[#68736f]">
              Página {audit.filters.page} de {audit.meta.totalPages}
            </span>
            <AppButton
              variant="secondary"
              disabled={audit.filters.page >= audit.meta.totalPages}
              onClick={() => audit.updateFilters({ page: audit.filters.page + 1 })}
            >
              Siguiente
            </AppButton>
          </div>
        ) : null}
      </PermissionGate>
    </AppShell>
  );
}
