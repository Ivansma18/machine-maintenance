import { AppButton } from '@/components/ui/AppButton';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { AppTag } from '@/components/ui/AppTag';
import { formatDateTime } from '@/lib/formatters/dateFormatters';

import type { Notification } from '../types';
import {
  getNotificationSeverityLabel,
  getNotificationStatusLabel,
  getNotificationStatusTone,
  getNotificationTone,
  getNotificationTypeLabel,
} from '../utils/notificationFormatters';

type NotificationListProps = {
  notifications: Notification[];
  onAcknowledge: (notification: Notification) => void;
  onResolve: (notification: Notification) => void;
  onDismiss: (notification: Notification) => void;
};

export function NotificationList({
  notifications,
  onAcknowledge,
  onResolve,
  onDismiss,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#bfc9c1] bg-white p-10 text-center">
        <p className="m-0 text-lg font-black text-[#17211f]">No hay alertas para mostrar</p>
        <p className="mx-auto mb-0 mt-2 max-w-md text-sm leading-6 text-[#68736f]">
          Ajusta los filtros o ejecuta el motor preventivo para revisar nuevas alertas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {notifications.map((notification) => {
        return (
          <article
            className={`rounded-2xl border bg-white p-5 shadow-[0_12px_35px_rgba(35,55,43,0.05)] ${notification.severity === 'CRITICAL' ? 'border-[#e9aaa1] ring-1 ring-[#f0c6bf]' : 'border-[#dfe4df]'}`}
            key={notification.id}
          >
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="m-0 text-base font-black text-[#17211f]">{notification.title}</h2>
                  <AppTag tone={getNotificationTone(notification.severity)}>
                    {getNotificationSeverityLabel(notification.severity)}
                  </AppTag>
                  <AppTag tone={getNotificationStatusTone(notification.status)}>
                    {getNotificationStatusLabel(notification.status)}
                  </AppTag>
                </div>
                <p className="m-0 mt-2 text-sm font-bold text-[#426b50]">
                  {notification.machine.name}
                </p>
                <p className="m-0 mt-1 text-xs text-[#68736f]">
                  {getNotificationTypeLabel(notification.type)} · {notification.machine.location}
                </p>
              </div>
              <div className="text-left lg:text-right">
                <p className="eyebrow m-0">Generada</p>
                <p className="m-0 mt-1 text-sm font-bold text-[#17211f]">
                  {formatDateTime(notification.createdAt)}
                </p>
                {notification.dueAt ? (
                  <p className="m-0 mt-1 text-xs text-[#68736f]">
                    Limite: {formatDateTime(notification.dueAt)}
                  </p>
                ) : null}
              </div>
            </div>
            <div
              className={`mt-4 rounded-xl px-4 py-3 text-sm ${notification.severity === 'CRITICAL' ? 'border border-[#f0c6bf] bg-[#fff1ee] text-[#8e2f28]' : 'bg-[#f5f7f4] text-[#68736f]'}`}
            >
              <p className="m-0 leading-6">{notification.message}</p>
              {notification.maintenancePlan ? (
                <p className="m-0 mt-2 text-xs font-bold">
                  Plan: {notification.maintenancePlan.name}
                </p>
              ) : null}
            </div>
            {notification.status === 'OPEN' || notification.status === 'ACKNOWLEDGED' ? (
              <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-[#edf0ed] pt-4">
                {notification.status === 'OPEN' ? (
                  <PermissionGate permission="notifications:acknowledge">
                    <AppButton variant="secondary" onClick={() => onAcknowledge(notification)}>
                      Reconocer
                    </AppButton>
                  </PermissionGate>
                ) : null}
                <PermissionGate permission="notifications:resolve">
                  <AppButton variant="quiet" onClick={() => onResolve(notification)}>
                    Resolver
                  </AppButton>
                </PermissionGate>
                <PermissionGate permission="notifications:dismiss">
                  <AppButton variant="quiet" onClick={() => onDismiss(notification)}>
                    Descartar
                  </AppButton>
                </PermissionGate>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
