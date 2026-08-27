'use client';

import { AppButton } from '@/components/ui/AppButton';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppTag } from '@/components/ui/AppTag';
import { formatDateTime } from '@/lib/formatters/dateFormatters';

import { useMachineTimeline } from '../hooks/useMachineTimeline';
import { getTimelineEventLabel, getTimelineEventTone } from '../utils/machineProfileFormatters';

export function MachineProfileTimeline({ machineId }: { machineId: string }) {
  const timeline = useMachineTimeline(machineId);
  return (
    <AppPanel
      eyebrow="Trazabilidad completa"
      title="Timeline tecnico"
      extra={
        <AppButton variant="quiet" onClick={timeline.retry}>
          Actualizar
        </AppButton>
      }
    >
      {timeline.loading ? (
        <div
          aria-label="Cargando timeline tecnico"
          className="animate-pulse space-y-3 p-5"
          role="status"
        >
          <div className="h-16 rounded-xl bg-[#e8ece8]" />
          <div className="h-16 rounded-xl bg-[#e8ece8]" />
          <div className="h-16 rounded-xl bg-[#e8ece8]" />
        </div>
      ) : null}
      {!timeline.loading && timeline.error ? (
        <div className="p-7">
          <p className="m-0 text-sm font-bold text-[#8e2f28]">No se pudo cargar el timeline.</p>
          <p className="m-0 mt-2 text-sm text-[#a65a52]">{timeline.error}</p>
          <AppButton className="mt-5" variant="secondary" onClick={timeline.retry}>
            Reintentar
          </AppButton>
        </div>
      ) : null}
      {!timeline.loading && !timeline.error && timeline.events.length === 0 ? (
        <div className="p-8 text-center">
          <p className="m-0 text-base font-black text-[#17211f]">Sin eventos registrados</p>
          <p className="mb-0 mt-2 text-sm text-[#68736f]">
            Aun no hay trazabilidad tecnica para esta maquina.
          </p>
        </div>
      ) : null}
      {!timeline.loading && !timeline.error && timeline.events.length ? (
        <ol className="m-0 list-none divide-y divide-[#dfe4df] p-0">
          {timeline.events.map((event) => (
            <li className="flex gap-4 p-5" key={event.id}>
              <span
                aria-hidden="true"
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#668875] ring-4 ring-[#e8f1e9]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="m-0 text-sm font-black text-[#17211f]">
                    {getTimelineEventLabel(event)}
                  </p>
                  <AppTag tone={getTimelineEventTone(event.kind)}>{event.kind}</AppTag>
                </div>
                <p className="m-0 mt-1 text-xs text-[#68736f]">
                  {formatDateTime(event.occurredAt)}
                  {event.entityId ? ` · ${event.entityId.slice(0, 8)}` : ''}
                </p>
                {event.description ? (
                  <p className="m-0 mt-2 text-sm leading-6 text-[#68736f]">{event.description}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </AppPanel>
  );
}
