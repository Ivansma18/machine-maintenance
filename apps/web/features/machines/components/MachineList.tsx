import { AnimatedList } from '@/components/motion/AnimatedList';
import { AnimatedListItem } from '@/components/motion/AnimatedListItem';
import { AppButton } from '@/components/ui/AppButton';
import { AppTag } from '@/components/ui/AppTag';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { formatDateOnly } from '@/lib/formatters/dateFormatters';

import type { Machine } from '../types';
import {
  getMachineCategoryLabel,
  getMachineCriticalityLabel,
  getMachineCriticalityTone,
  getMachineStatusLabel,
  getMachineStatusTone,
} from '../utils/machineFormatters';

type MachineListProps = {
  machines: Machine[];
  onEdit: (machine: Machine) => void;
  onRetire: (machine: Machine) => void;
};

export function MachineList({ machines, onEdit, onRetire }: MachineListProps) {
  return (
    <AnimatedList>
      <div className="divide-y divide-[#dfe4df]">
        {machines.map((machine) => (
          <AnimatedListItem
            className="grid gap-4 px-5 py-5 lg:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto] lg:items-center"
            key={machine.id}
          >
            <div className="min-w-0">
              <p className="m-0 truncate text-base font-black text-[#17211f]">{machine.name}</p>
              <p className="m-0 mt-1 truncate text-xs text-[#68736f]">
                {getMachineCategoryLabel(machine.category.name)} ·{' '}
                {machine.serialNumber ?? 'Sin numero de serie'}
              </p>
            </div>
            <div>
              <p className="eyebrow">Ubicacion</p>
              <p className="m-0 mt-1 text-sm text-[#68736f]">{machine.location}</p>
            </div>
            <div className="flex gap-2 lg:flex-col lg:items-start">
              <AppTag tone={getMachineStatusTone(machine.status)}>
                {getMachineStatusLabel(machine.status)}
              </AppTag>
              <AppTag tone={getMachineCriticalityTone(machine.criticality)}>
                {getMachineCriticalityLabel(machine.criticality)}
              </AppTag>
            </div>
            <div>
              <p className="eyebrow">Instalada</p>
              <p className="m-0 mt-1 text-sm text-[#68736f]">
                {formatDateOnly(machine.installedAt)}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <PermissionGate permission="machines:update">
                <AppButton variant="quiet" onClick={() => onEdit(machine)}>
                  Editar
                </AppButton>
              </PermissionGate>
              {machine.status !== 'RETIRED' ? (
                <PermissionGate permission="machines:retire">
                  <AppButton variant="danger" onClick={() => onRetire(machine)}>
                    Retirar
                  </AppButton>
                </PermissionGate>
              ) : null}
            </div>
          </AnimatedListItem>
        ))}
      </div>
    </AnimatedList>
  );
}
