import Link from 'next/link';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppTag } from '@/components/ui/AppTag';
import type { CalendarEvent } from '../types';
import { eventLabel } from '../utils/calendarFormatters';

export function MaintenanceCalendarSidebar({ events }: { events: CalendarEvent[] }) {
  const overdue = events.filter((event) => event.overdue).slice(0, 5);
  const workload = events
    .filter((event) => event.kind === 'WORK_ORDER' && event.technicianName)
    .reduce<Record<string, number>>((result, event) => {
      const technician = event.technicianName!;
      result[technician] = (result[technician] ?? 0) + 1;
      return result;
    }, {});
  return (
    <div className="grid gap-5">
      <AppPanel title="Trabajos vencidos" eyebrow="Atención inmediata">
        <div className="px-5 pb-5 pt-1">
          {overdue.length ? (
            <div className="grid gap-3">
              {overdue.map((event) => (
                <Link
                  className="rounded-xl border border-[#f3d7d2] bg-[#fff7f5] p-3"
                  href={event.href}
                  key={event.id}
                >
                  <p className="m-0 text-sm font-black text-[#8e2f28]">{event.title}</p>
                  <p className="m-0 mt-1 text-xs font-semibold text-[#a65a52]">
                    {event.machineName} · {eventLabel(event)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="m-0 text-sm text-[#68736f]">
              No hay trabajos vencidos en la agenda actual.
            </p>
          )}
        </div>
      </AppPanel>
      <AppPanel title="Carga operativa" eyebrow="Órdenes por técnico">
        <div className="px-5 pb-5 pt-1">
          {Object.entries(workload).length ? (
            <div className="grid gap-3">
              {Object.entries(workload)
                .sort(([, first], [, second]) => second - first)
                .slice(0, 6)
                .map(([technician, count]) => (
                  <div className="flex items-center justify-between gap-3" key={technician}>
                    <span className="text-sm font-bold">{technician}</span>
                    <AppTag tone={count > 3 ? 'warning' : 'success'}>{count} órdenes</AppTag>
                  </div>
                ))}
            </div>
          ) : (
            <p className="m-0 text-sm text-[#68736f]">No hay órdenes asignadas en la agenda.</p>
          )}
        </div>
      </AppPanel>
    </div>
  );
}
