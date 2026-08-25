'use client';

import { AppButton } from '@/components/ui/AppButton';
import { AppSelect } from '@/components/ui/AppSelect';

import type { MaintenancePlanFilters, PlanMachine } from '../types';
import { getPlanSituationLabel } from '../utils/maintenancePlanFormatters';

type MaintenancePlanFiltersProps = {
  filters: MaintenancePlanFilters;
  machines: PlanMachine[];
  onChange: (filters: Partial<MaintenancePlanFilters>) => void;
};

export function MaintenancePlanFilters({
  filters,
  machines,
  onChange,
}: MaintenancePlanFiltersProps) {
  return (
    <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_auto]">
      <AppSelect
        aria-label="Filtrar por maquina"
        className="w-full"
        placeholder="Todas las maquinas"
        value={filters.machineId}
        options={machines.map((machine) => ({
          label: `${machine.name} · ${machine.location}`,
          value: machine.id,
        }))}
        onChange={(value) => onChange({ machineId: value || undefined })}
      />
      <AppSelect
        aria-label="Filtrar por estado"
        className="w-full"
        value={filters.activeState}
        options={[
          { label: 'Todos los estados', value: 'ALL' },
          { label: 'Activos', value: 'ACTIVE' },
          { label: 'Inactivos', value: 'INACTIVE' },
        ]}
        onChange={(value) => onChange({ activeState: value })}
      />
      <AppSelect
        aria-label="Filtrar por situacion"
        className="w-full"
        value={filters.situation}
        options={['ALL', 'DUE_SOON', 'OVERDUE', 'ON_TRACK'].map((situation) => ({
          label: getPlanSituationLabel(situation),
          value: situation,
        }))}
        onChange={(value) => onChange({ situation: value })}
      />
      <AppButton
        variant="secondary"
        onClick={() => onChange({ machineId: undefined, activeState: 'ALL', situation: 'ALL' })}
      >
        Limpiar
      </AppButton>
    </div>
  );
}
