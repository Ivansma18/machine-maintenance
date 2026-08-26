import { AppPanel } from '@/components/ui/AppPanel';
import { formatDateTime } from '@/lib/formatters/dateFormatters';

import type { MachineActivity } from '../types';
import { getActivityTitle } from '../utils/machineProfileFormatters';
import { ProfileEmptyState } from './MachineProfilePrimitives';

export function MachineProfileActivity({ activity }: { activity: MachineActivity[] }) {
  return (
    <AppPanel eyebrow="Trazabilidad tecnica" title="Actividad reciente">
      {activity.length ? (
        <ol className="m-0 list-none divide-y divide-[#dfe4df] p-0">
          {activity.map((event) => (
            <li className="flex gap-4 p-5" key={event.id}>
              <span
                aria-hidden="true"
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#668875] ring-4 ring-[#e8f1e9]"
              />
              <div>
                <p className="m-0 text-sm font-black text-[#17211f]">{getActivityTitle(event)}</p>
                <p className="m-0 mt-1 text-xs text-[#68736f]">
                  {formatDateTime(event.occurredAt)}
                </p>
                {event.description ? (
                  <p className="m-0 mt-2 text-sm leading-6 text-[#68736f]">{event.description}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <ProfileEmptyState
          title="Sin actividad"
          text="Aun no hay actividad tecnica para esta maquina."
        />
      )}
    </AppPanel>
  );
}
