import { PermissionGate } from '@/components/auth/PermissionGate';
import { AppButton } from '@/components/ui/AppButton';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppTag } from '@/components/ui/AppTag';
import { formatDateTime } from '@/lib/formatters/dateFormatters';

import type { ProfileMaintenanceLog } from '../types';
import { ProfileEmptyState } from './MachineProfilePrimitives';

export function MachineProfileHistory({
  logs,
  machineId,
}: {
  logs: ProfileMaintenanceLog[];
  machineId: string;
}) {
  return (
    <AppPanel
      eyebrow="Registro inmutable"
      title="Historial reciente"
      extra={
        <AppButton href={`/maintenance-logs?machineId=${machineId}`} variant="quiet">
          Ver historial completo
        </AppButton>
      }
    >
      {logs.length ? (
        <div className="divide-y divide-[#dfe4df]">
          {logs.map((log) => (
            <div className="p-5" key={log.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-black text-[#17211f]">
                  {formatDateTime(log.performedAt)}
                </span>
                <AppTag
                  tone={
                    log.result === 'CRITICAL_FAILURE'
                      ? 'critical'
                      : log.result === 'OK'
                        ? 'success'
                        : 'warning'
                  }
                >
                  {getResultLabel(log.result)}
                </AppTag>
              </div>
              <p className="m-0 mt-2 text-sm text-[#68736f]">
                {getTypeLabel(log.type)} · {log.performedBy}
                {log.maintenancePlan ? ` · ${log.maintenancePlan.name}` : ''}
              </p>
              {log.notes ? (
                <p className="m-0 mt-3 text-sm leading-6 text-[#68736f]">{log.notes}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <ProfileEmptyState
          title="Todavia no hay mantenimientos"
          text="Todavia no hay mantenimientos registrados para esta maquina."
          action={
            <PermissionGate permission="maintenance-logs:create">
              <AppButton href={`/maintenance-logs?machineId=${machineId}`}>
                Registrar mantenimiento
              </AppButton>
            </PermissionGate>
          }
        />
      )}
    </AppPanel>
  );
}

function getTypeLabel(type: ProfileMaintenanceLog['type']) {
  return { PREVENTIVE: 'Preventivo', CORRECTIVE: 'Correctivo', INSPECTION: 'Inspeccion' }[type];
}
function getResultLabel(result: ProfileMaintenanceLog['result']) {
  return {
    OK: 'Correcto',
    NEEDS_FOLLOW_UP: 'Requiere seguimiento',
    FAILED: 'Fallido',
    CRITICAL_FAILURE: 'Fallo critico',
  }[result];
}
