'use client';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';

import type {
  MaintenanceLogFilters,
  MaintenanceResult,
  MaintenanceType,
  LogMachine,
} from '../types';
import {
  getMaintenanceResultLabel,
  getMaintenanceTypeLabel,
} from '../utils/maintenanceLogFormatters';

type MaintenanceLogFiltersProps = {
  filters: MaintenanceLogFilters;
  machines: LogMachine[];
  onChange: (filters: Partial<MaintenanceLogFilters>) => void;
};

const types: MaintenanceType[] = ['PREVENTIVE', 'CORRECTIVE', 'INSPECTION'];
const results: MaintenanceResult[] = ['OK', 'NEEDS_FOLLOW_UP', 'FAILED', 'CRITICAL_FAILURE'];

export function MaintenanceLogFilters({ filters, machines, onChange }: MaintenanceLogFiltersProps) {
  return (
    <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]">
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
        aria-label="Filtrar por tipo"
        className="w-full"
        placeholder="Todos los tipos"
        value={filters.type}
        options={types.map((type) => ({ label: getMaintenanceTypeLabel(type), value: type }))}
        onChange={(value) => onChange({ type: value || undefined })}
      />
      <AppSelect
        aria-label="Filtrar por resultado"
        className="w-full"
        placeholder="Todos los resultados"
        value={filters.result}
        options={results.map((result) => ({
          label: getMaintenanceResultLabel(result),
          value: result,
        }))}
        onChange={(value) => onChange({ result: value || undefined })}
      />
      <AppInput
        aria-label="Mantenimientos desde"
        type="date"
        value={filters.performedFrom ?? ''}
        onChange={(event) => onChange({ performedFrom: event.target.value || undefined })}
      />
      <AppInput
        aria-label="Mantenimientos hasta"
        type="date"
        value={filters.performedTo ?? ''}
        onChange={(event) => onChange({ performedTo: event.target.value || undefined })}
      />
      <AppButton
        variant="secondary"
        onClick={() =>
          onChange({
            machineId: undefined,
            type: undefined,
            result: undefined,
            performedFrom: undefined,
            performedTo: undefined,
          })
        }
      >
        Limpiar
      </AppButton>
    </div>
  );
}
