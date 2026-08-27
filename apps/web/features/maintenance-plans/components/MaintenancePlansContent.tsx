import { AppButton } from '@/components/ui/AppButton';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { AppPanel } from '@/components/ui/AppPanel';

import { MaintenancePlanList } from './MaintenancePlanList';
import type { MaintenancePlan } from '../types';

type MaintenancePlansContentProps = {
  plans: MaintenancePlan[];
  total: number;
  onCreate: () => void;
  onEdit: (plan: MaintenancePlan) => void;
  onToggleStatus: (plan: MaintenancePlan) => void;
};

export function MaintenancePlansContent({
  plans,
  total,
  onCreate,
  onEdit,
  onToggleStatus,
}: MaintenancePlansContentProps) {
  return (
    <AppPanel
      title="Registro de planes"
      eyebrow="Trabajo preventivo"
      extra={
        <PermissionGate permission="maintenance-plans:create">
          <AppButton onClick={onCreate}>Agregar plan</AppButton>
        </PermissionGate>
      }
    >
      <div className="px-5 pb-5 pt-1">
        <p className="m-0 mb-4 text-xs font-semibold text-[#68736f]">{total} planes visibles</p>
        <MaintenancePlanList
          plans={plans}
          total={total}
          onCreate={onCreate}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
        />
      </div>
    </AppPanel>
  );
}
