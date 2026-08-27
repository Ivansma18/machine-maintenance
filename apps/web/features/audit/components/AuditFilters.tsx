'use client';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import type { AuditFilters } from '../types';

export function AuditFiltersForm({
  filters,
  onChange,
}: {
  filters: AuditFilters;
  onChange: (filters: Partial<AuditFilters>) => void;
}) {
  return (
    <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-[1.3fr_1.3fr_1fr_1fr_1fr_1fr_1fr_auto]">
      <AppInput
        aria-label="Filtrar por actor"
        placeholder="Actor o ID"
        value={filters.actor ?? ''}
        onChange={(event) => onChange({ actor: event.target.value || undefined })}
      />
      <AppInput
        aria-label="Filtrar por acción"
        placeholder="Acción"
        value={filters.action ?? ''}
        onChange={(event) => onChange({ action: event.target.value || undefined })}
      />
      <AppInput
        aria-label="Filtrar por tipo de entidad"
        placeholder="Tipo de entidad"
        value={filters.entityType ?? ''}
        onChange={(event) => onChange({ entityType: event.target.value || undefined })}
      />
      <AppInput
        aria-label="Filtrar por ID de entidad"
        placeholder="ID de entidad"
        value={filters.entityId ?? ''}
        onChange={(event) => onChange({ entityId: event.target.value || undefined })}
      />
      <AppInput
        aria-label="Filtrar por request ID"
        placeholder="Request ID"
        value={filters.requestId ?? ''}
        onChange={(event) => onChange({ requestId: event.target.value || undefined })}
      />
      <AppInput
        aria-label="Eventos desde"
        type="date"
        value={filters.from ?? ''}
        onChange={(event) => onChange({ from: event.target.value || undefined })}
      />
      <AppInput
        aria-label="Eventos hasta"
        type="date"
        value={filters.to ?? ''}
        onChange={(event) => onChange({ to: event.target.value || undefined })}
      />
      <AppButton
        variant="secondary"
        onClick={() =>
          onChange({
            actor: undefined,
            action: undefined,
            entityType: undefined,
            entityId: undefined,
            requestId: undefined,
            from: undefined,
            to: undefined,
          })
        }
      >
        Limpiar
      </AppButton>
    </div>
  );
}
