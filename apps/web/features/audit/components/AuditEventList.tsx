import type { AuditEvent } from '../types';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

export function AuditEventList({ events }: { events: AuditEvent[] }) {
  if (!events.length)
    return (
      <p className="p-5 text-sm font-semibold text-[#68736f]">
        No hay eventos que coincidan con los filtros.
      </p>
    );
  return (
    <div className="divide-y divide-[#dfe4df]">
      {events.map((event) => (
        <details className="group p-5" key={event.id}>
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
            <div>
              <p className="m-0 text-sm font-black text-[#17211f]">{event.action}</p>
              <p className="m-0 mt-1 text-xs font-semibold text-[#68736f]">
                {event.entityType}
                {event.entityId ? ` · ${event.entityId}` : ''} · {formatDate(event.createdAt)}
              </p>
            </div>
            <span className="rounded-md bg-[#eef1ec] px-2 py-1 text-[0.65rem] font-bold text-[#495852]">
              {event.actorType} · {event.actorId}
            </span>
          </summary>
          <div className="mt-4 grid gap-3 rounded-xl bg-[#f5f7f3] p-4 text-xs text-[#495852] sm:grid-cols-2">
            <div>
              <p className="m-0 font-black uppercase tracking-[0.1em] text-[#68736f]">Motivo</p>
              <p className="m-0 mt-1">{event.reason || 'Sin motivo registrado'}</p>
            </div>
            <div>
              <p className="m-0 font-black uppercase tracking-[0.1em] text-[#68736f]">Request ID</p>
              <p className="m-0 mt-1 break-all">{event.requestId || 'No disponible'}</p>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
