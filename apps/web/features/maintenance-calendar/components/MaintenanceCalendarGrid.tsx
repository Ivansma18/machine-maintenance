import Link from 'next/link';
import type { CalendarEvent } from '../types';
import { dayKey, eventLabel } from '../utils/calendarFormatters';

export function MaintenanceCalendarGrid({
  days,
  events,
  anchor,
  mode,
}: {
  days: Date[];
  events: CalendarEvent[];
  anchor: Date;
  mode: 'month' | 'week';
}) {
  const today = dayKey(new Date());
  return (
    <div
      className={`grid overflow-hidden rounded-2xl border border-[#dfe4df] bg-white ${mode === 'month' ? 'grid-cols-7' : 'grid-cols-7'}`}
    >
      <div className="col-span-7 grid grid-cols-7 border-b border-[#dfe4df] bg-[#eef1ec]">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
          <span
            className="px-2 py-3 text-center text-[0.65rem] font-black uppercase tracking-[0.1em] text-[#68736f]"
            key={day}
          >
            {day}
          </span>
        ))}
      </div>
      {days.map((day) => {
        const key = dayKey(day);
        const dayEvents = events.filter((event) => dayKey(new Date(event.date)) === key);
        const outside = mode === 'month' && day.getMonth() !== anchor.getMonth();
        return (
          <div
            className={`min-h-32 border-b border-r border-[#e7ebe7] p-2 ${outside ? 'bg-[#fafbf9]' : ''} ${key === today ? 'bg-[#fff8e7]' : ''}`}
            key={key}
          >
            <span
              className={`mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${key === today ? 'bg-[#17211f] text-white' : outside ? 'text-[#a9b1ac]' : 'text-[#17211f]'}`}
            >
              {day.getDate()}
            </span>
            <div className="grid gap-1">
              {dayEvents.slice(0, 3).map((event) => (
                <Link
                  className={`block truncate rounded-md border px-2 py-1 text-[0.68rem] font-bold ${event.overdue ? 'border-[#f0c1b9] bg-[#fff0ed] text-[#8e2f28]' : event.kind === 'PLAN' ? 'border-[#e8d39b] bg-[#fff4d8] text-[#72551a]' : 'border-[#cfe0d2] bg-[#e8f1e9] text-[#365441]'}`}
                  href={event.href}
                  key={event.id}
                  title={`${event.title} · ${event.machineName}`}
                >
                  {event.title}
                </Link>
              ))}
              {dayEvents.length > 3 ? (
                <span className="px-2 text-[0.65rem] font-bold text-[#68736f]">
                  +{dayEvents.length - 3} más
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
