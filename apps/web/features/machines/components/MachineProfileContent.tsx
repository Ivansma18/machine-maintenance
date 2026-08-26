'use client';

import { useState } from 'react';
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
import { MachineProfileParts } from './MachineProfileParts';
import { useMachineParts } from '../hooks/useMachineParts';
import { AppModal } from '@/components/ui/AppModal';
import { WorkOrderForm } from '@/features/work-orders/components/WorkOrderForm';
import { useScheduleMachineWorkOrder } from '../hooks/useScheduleMachineWorkOrder';
import type { WorkOrderFormValues } from '@/features/work-orders/types';

export function MachineProfileContent({
  profile,
  onRefresh,
}: {
  profile: MachineProfile;
  onRefresh: () => void;
}) {
  const { machine, health } = profile;
  const hasUrgency = health.overduePreventiveCount > 0 || health.openNotificationCount > 0;
  const workOrders = useMachineWorkOrders(machine.id);
  const parts = useMachineParts(machine.id);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const schedule = useScheduleMachineWorkOrder();

  async function submitSchedule(values: WorkOrderFormValues) {
    await schedule.schedule(values);
    setScheduleOpen(false);
    onRefresh();
  }

  return (
    <div className="space-y-6">
      <MachineProfileHero profile={profile} nextAction={getMachineProfileNextAction(profile)} />
      <PermissionGate permission="work-orders:create">
        <div className="flex justify-end">
          <AppButton onClick={() => setScheduleOpen(true)}>Programar intervención</AppButton>
        </div>
      </PermissionGate>
      <MachineProfileHealth profile={profile} />
      <MachineWorkOrders orders={workOrders.orders} loading={workOrders.loading} />
      <MachineProfileParts
        result={parts.result}
        loading={parts.loading}
        error={parts.error}
        onRetry={parts.retry}
      />
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
      <AppModal
        centered
        destroyOnHidden
        footer={null}
        open={scheduleOpen}
        title={`Programar intervención · ${machine.name}`}
        width={720}
        onCancel={() => setScheduleOpen(false)}
      >
        <WorkOrderForm
          fixedMachineId={machine.id}
          initialValues={{
            machineId: machine.id,
            type: 'PREVENTIVE',
            priority: 'MEDIUM',
          }}
          machines={[{ id: machine.id, name: machine.name, location: machine.location }]}
          loading={schedule.loading}
          error={schedule.error}
          onCancel={() => setScheduleOpen(false)}
          onSubmit={submitSchedule}
          requireSchedule
          submitLabel="Programar intervención"
        />
      </AppModal>
    </div>
  );
}
