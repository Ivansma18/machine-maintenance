import { AppSelect } from '@/components/ui/AppSelect';
import type { WorkOrderFilters, WorkOrderMachine } from '../types';

export function WorkOrderFilters({
  filters,
  machines,
  onChange,
}: {
  filters: WorkOrderFilters;
  machines: WorkOrderMachine[];
  onChange: (filters: Partial<WorkOrderFilters>) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <AppSelect
        allowClear
        className="w-full"
        placeholder="Todos los estados"
        value={filters.status}
        options={[
          ['OPEN', 'Abierta'],
          ['SCHEDULED', 'Programada'],
          ['IN_PROGRESS', 'En ejecución'],
          ['COMPLETED', 'Completada'],
          ['CANCELLED', 'Cancelada'],
        ].map(([value, label]) => ({ value, label }))}
        onChange={(value) => onChange({ status: value })}
      />
      <AppSelect
        allowClear
        className="w-full"
        placeholder="Todas las prioridades"
        value={filters.priority}
        options={[
          ['URGENT', 'Urgente'],
          ['HIGH', 'Alta'],
          ['MEDIUM', 'Media'],
          ['LOW', 'Baja'],
        ].map(([value, label]) => ({ value, label }))}
        onChange={(value) => onChange({ priority: value })}
      />
      <AppSelect
        allowClear
        className="w-full"
        placeholder="Todos los tipos"
        value={filters.type}
        options={[
          ['PREVENTIVE', 'Preventiva'],
          ['CORRECTIVE', 'Correctiva'],
          ['INSPECTION', 'Inspección'],
        ].map(([value, label]) => ({ value, label }))}
        onChange={(value) => onChange({ type: value })}
      />
      <AppSelect
        allowClear
        showSearch
        optionFilterProp="label"
        className="w-full"
        placeholder="Todas las máquinas"
        value={filters.machineId}
        options={machines.map((machine) => ({ value: machine.id, label: machine.name }))}
        onChange={(value) => onChange({ machineId: value })}
      />
    </div>
  );
}
