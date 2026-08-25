'use client';

import { AppButton } from '@/components/ui/AppButton';
import { AppSelect } from '@/components/ui/AppSelect';

import type {
  NotificationFilters as NotificationFiltersState,
  NotificationMachineOption,
  NotificationSeverity,
  NotificationStatus,
  NotificationType,
} from '../types';
import {
  getNotificationSeverityLabel,
  getNotificationStatusLabel,
  getNotificationTypeLabel,
} from '../utils/notificationFormatters';

type NotificationFiltersProps = {
  filters: NotificationFiltersState;
  machines: NotificationMachineOption[];
  onChange: (filters: Partial<NotificationFiltersState>) => void;
};

const types: NotificationType[] = [
  'PREVENTIVE_DUE_SOON',
  'PREVENTIVE_OVERDUE',
  'URGENT_CRITICAL_FAILURE',
];
const severities: NotificationSeverity[] = ['INFO', 'WARNING', 'URGENT', 'CRITICAL'];
const statuses: NotificationStatus[] = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'];

export function NotificationFilters({ filters, machines, onChange }: NotificationFiltersProps) {
  return (
    <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
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
        aria-label="Filtrar por severidad"
        className="w-full"
        placeholder="Todas las severidades"
        value={filters.severity}
        options={severities.map((severity) => ({
          label: getNotificationSeverityLabel(severity),
          value: severity,
        }))}
        onChange={(value) => onChange({ severity: value || undefined })}
      />
      <AppSelect
        aria-label="Filtrar por estado"
        className="w-full"
        placeholder="Todos los estados"
        value={filters.status}
        options={statuses.map((status) => ({
          label: getNotificationStatusLabel(status),
          value: status,
        }))}
        onChange={(value) => onChange({ status: value || undefined })}
      />
      <AppSelect
        aria-label="Filtrar por tipo"
        className="w-full"
        placeholder="Todos los tipos"
        value={filters.type}
        options={types.map((type) => ({ label: getNotificationTypeLabel(type), value: type }))}
        onChange={(value) => onChange({ type: value || undefined })}
      />
      <AppButton
        variant="secondary"
        onClick={() =>
          onChange({
            machineId: undefined,
            severity: undefined,
            status: undefined,
            type: undefined,
          })
        }
      >
        Limpiar
      </AppButton>
    </div>
  );
}
