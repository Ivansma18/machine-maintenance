import { AppPanel } from '@/components/ui/AppPanel';

import { NotificationList } from './NotificationList';
import type { Notification } from '../types';

type NotificationsContentProps = {
  notifications: Notification[];
  total: number;
  onAcknowledge: (notification: Notification) => void;
  onResolve: (notification: Notification) => void;
  onDismiss: (notification: Notification) => void;
};

export function NotificationsContent({
  notifications,
  total,
  onAcknowledge,
  onResolve,
  onDismiss,
}: NotificationsContentProps) {
  return (
    <AppPanel title="Bandeja de alertas" eyebrow="Atencion operativa">
      <div className="px-5 pb-5 pt-1">
        <p className="m-0 mb-4 text-xs font-semibold text-[#68736f]">{total} alertas encontradas</p>
        <NotificationList
          notifications={notifications}
          onAcknowledge={onAcknowledge}
          onResolve={onResolve}
          onDismiss={onDismiss}
        />
      </div>
    </AppPanel>
  );
}
