import { AppButton } from '@/components/ui/AppButton';
import { AppPanel } from '@/components/ui/AppPanel';

import { MachineList } from './MachineList';
import type { Machine } from '../types';

type MachinesContentProps = {
  machines: Machine[];
  total: number;
  onCreate: () => void;
  onEdit: (machine: Machine) => void;
  onRetire: (machine: Machine) => void;
};

export function MachinesContent({
  machines,
  total,
  onCreate,
  onEdit,
  onRetire,
}: MachinesContentProps) {
  return (
    <AppPanel
      title="Registro de maquinas"
      eyebrow="Activos de produccion"
      extra={<AppButton onClick={onCreate}>Agregar maquina</AppButton>}
    >
      <div className="flex items-center justify-between border-b border-[#dfe4df] px-5 py-4">
        <p className="m-0 text-sm text-[#68736f]">
          <strong className="text-[#17211f]">{total}</strong> maquinas registradas
        </p>
        <p className="eyebrow">Inventario en vivo</p>
      </div>
      {machines.length ? (
        <MachineList machines={machines} onEdit={onEdit} onRetire={onRetire} />
      ) : (
        <div className="p-10 text-center">
          <p className="m-0 text-base font-black text-[#17211f]">
            Ninguna maquina coincide con los filtros
          </p>
          <p className="mb-0 mt-2 text-sm text-[#68736f]">
            Limpia los filtros o agrega la primera maquina a este registro.
          </p>
        </div>
      )}
    </AppPanel>
  );
}
