import { PermissionGate } from '@/components/auth/PermissionGate';
import { AppButton } from '@/components/ui/AppButton';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppTag } from '@/components/ui/AppTag';
import { formatDateOnly } from '@/lib/formatters/dateFormatters';

import type { ProfileMaintenancePlan } from '../types';
import { ProfileDetail, ProfileEmptyState } from './MachineProfilePrimitives';

export function MachineProfilePlans({ plans }: { plans: ProfileMaintenancePlan[] }) {
  return (
    <AppPanel
      eyebrow="Programacion preventiva"
      title="Planes asociados"
      extra={
        <PermissionGate permission="maintenance-plans:create">
          <AppButton href="/maintenance-plans" variant="quiet">
            Crear plan
          </AppButton>
        </PermissionGate>
      }
    >
      {plans.length ? (
        <div className="divide-y divide-[#dfe4df]">
          {plans.map((plan) => (
            <div className="p-5" key={plan.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="m-0 text-base font-black text-[#17211f]">{plan.name}</h2>
                  <p className="m-0 mt-1 text-sm text-[#68736f]">
                    Cada {plan.frequencyDays} dias · inicia {formatDateOnly(plan.startsAt)}
                  </p>
                </div>
                <AppTag
                  tone={
                    plan.isOverdue
                      ? 'critical'
                      : plan.isDueSoon
                        ? 'warning'
                        : plan.isActive
                          ? 'success'
                          : 'neutral'
                  }
                >
                  {plan.isOverdue
                    ? 'Vencido'
                    : plan.isDueSoon
                      ? 'Proximo'
                      : plan.isActive
                        ? 'En tiempo'
                        : 'Inactivo'}
                </AppTag>
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <ProfileDetail label="Proximo vencimiento" value={formatDateOnly(plan.nextDueAt)} />
                <ProfileDetail
                  label="Ventana de aviso"
                  value={formatDateOnly(plan.warningStartsAt)}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ProfileEmptyState
          title="Sin planes preventivos"
          text="Esta maquina no tiene un plan preventivo activo."
          action={
            <PermissionGate permission="maintenance-plans:create">
              <AppButton href="/maintenance-plans">Crear primer plan</AppButton>
            </PermissionGate>
          }
        />
      )}
    </AppPanel>
  );
}
