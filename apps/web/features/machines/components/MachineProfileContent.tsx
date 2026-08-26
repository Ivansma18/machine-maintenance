import { PermissionGate } from '@/components/auth/PermissionGate';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { AppButton } from '@/components/ui/AppButton';

import { MachineProfileAlerts } from './MachineProfileAlerts';
import { MachineProfileHealth } from './MachineProfileHealth';
import { MachineProfileHero } from './MachineProfileHero';
import { MachineProfileHistory } from './MachineProfileHistory';
import { MachineProfilePlans } from './MachineProfilePlans';
import { MachineProfileTimeline } from './MachineProfileTimeline';
import type { MachineProfile } from '../types';
import { getMachineProfileNextAction } from '../utils/machineProfileFormatters';
import { MachineWorkOrders } from '@/features/work-orders/components/MachineWorkOrders';
import { useMachineWorkOrders } from '@/features/work-orders/hooks/useMachineWorkOrders';

export function MachineProfileContent({ profile }: { profile: MachineProfile }) {
  const { machine, health } = profile;
  const hasUrgency = health.overduePreventiveCount > 0 || health.openNotificationCount > 0;
  const workOrders = useMachineWorkOrders(machine.id);

  return (
    <div className="space-y-6">
      <MachineProfileHero profile={profile} nextAction={getMachineProfileNextAction(profile)} />
      <MachineProfileHealth profile={profile} />
      <MachineWorkOrders orders={workOrders.orders} loading={workOrders.loading} />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <MachineProfilePlans plans={profile.maintenancePlans} />
        <MachineProfileAlerts notifications={profile.openNotifications} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <MachineProfileHistory logs={profile.recentMaintenanceLogs} machineId={machine.id} />
        <MachineProfileTimeline machineId={machine.id} />
      </div>
      <div className="flex flex-wrap gap-3 border-t border-[#dfe4df] pt-5">
        <PermissionGate permission="machines:update">
          <AppButton href="/machines" variant="secondary">
            Editar en registro
          </AppButton>
        </PermissionGate>
        <PermissionGate permission="machines:retire">
          {machine.status !== 'RETIRED' ? (
            <AppButton href="/machines" variant="danger">
              Retirar desde registro
            </AppButton>
          ) : null}
        </PermissionGate>
      </div>
    </div>
  );
}
