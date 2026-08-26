import { PermissionGate } from '@/components/auth/PermissionGate';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { AppButton } from '@/components/ui/AppButton';

import { MachineProfileActivity } from './MachineProfileActivity';
import { MachineProfileAlerts } from './MachineProfileAlerts';
import { MachineProfileHealth } from './MachineProfileHealth';
import { MachineProfileHero } from './MachineProfileHero';
import { MachineProfileHistory } from './MachineProfileHistory';
import { MachineProfilePlans } from './MachineProfilePlans';
import type { MachineProfile } from '../types';
import { getMachineProfileNextAction } from '../utils/machineProfileFormatters';

export function MachineProfileContent({ profile }: { profile: MachineProfile }) {
  const { machine, health } = profile;
  const hasUrgency = health.overduePreventiveCount > 0 || health.openNotificationCount > 0;

  return (
    <div className="space-y-6">
      <MachineProfileHero profile={profile} nextAction={getMachineProfileNextAction(profile)} />
      <MachineProfileHealth profile={profile} />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <MachineProfilePlans plans={profile.maintenancePlans} />
        <MachineProfileAlerts notifications={profile.openNotifications} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <MachineProfileHistory logs={profile.recentMaintenanceLogs} machineId={machine.id} />
        <MachineProfileActivity activity={profile.activity} />
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
