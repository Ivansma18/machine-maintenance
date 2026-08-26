import { AppButton } from '@/components/ui/AppButton';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppTag } from '@/components/ui/AppTag';
import { formatDateTime } from '@/lib/formatters/dateFormatters';

import type { ProfileNotification } from '../types';
import { ProfileEmptyState } from './MachineProfilePrimitives';

export function MachineProfileAlerts({ notifications }: { notifications: ProfileNotification[] }) {
  return (
    <AppPanel
      eyebrow="Riesgo operativo"
      title="Alertas abiertas"
      extra={
        <AppButton href="/notifications" variant="quiet">
          Ver bandeja
        </AppButton>
      }
    >
      {notifications.length ? (
        <div className="divide-y divide-[#dfe4df]">
          {notifications.map((notification) => (
            <div className="p-5" key={notification.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <AppTag
                  tone={
                    notification.severity === 'CRITICAL' || notification.severity === 'URGENT'
                      ? 'critical'
                      : 'warning'
                  }
                >
                  {notification.severity}
                </AppTag>
                <span className="text-xs font-bold text-[#68736f]">
                  {notification.status === 'OPEN' ? 'Abierta' : 'Reconocida'}
                </span>
              </div>
              <h2 className="mb-1 mt-3 text-base font-black text-[#17211f]">
                {notification.title}
              </h2>
              <p className="m-0 text-sm leading-6 text-[#68736f]">{notification.message}</p>
              <p className="m-0 mt-3 text-xs text-[#68736f]">
                {notification.dueAt
                  ? `Vence ${formatDateTime(notification.dueAt)}`
                  : `Creada ${formatDateTime(notification.createdAt)}`}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <ProfileEmptyState
          title="Sin alertas abiertas"
          text="No hay alertas abiertas para esta maquina."
        />
      )}
    </AppPanel>
  );
}
