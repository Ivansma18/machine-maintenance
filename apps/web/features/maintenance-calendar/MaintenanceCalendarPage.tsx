'use client';

import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppShell } from '@/components/layout/AppShell';
import { MaintenanceCalendarGrid } from './components/MaintenanceCalendarGrid';
import { MaintenanceCalendarSidebar } from './components/MaintenanceCalendarSidebar';
import { useMaintenanceCalendar } from './hooks/useMaintenanceCalendar';
import { calendarDays, periodLabel } from './utils/calendarFormatters';

export function MaintenanceCalendarPage() {
  const query = useMaintenanceCalendar();
  const [anchor, setAnchor] = useState(() => new Date());
  const [mode, setMode] = useState<'month' | 'week'>('month');
  function move(offset: number) {
    setAnchor((current) => {
      const next = new Date(current);
      if (mode === 'month') next.setMonth(current.getMonth() + offset);
      else next.setDate(current.getDate() + offset * 7);
      return next;
    });
  }
  return (
    <AppShell
      activeHref="/maintenance-calendar"
      header={{ eyebrow: 'Espacio de trabajo / programación', title: 'Agenda de mantenimiento' }}
    >
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Horizonte operativo</p>
          <p className="mb-0 mt-3 max-w-xl text-sm leading-6 text-[#68736f]">
            Visualiza preventivos, órdenes programadas y trabajo vencido antes de que afecte la
            producción.
          </p>
        </div>
        <AppButton variant="secondary" onClick={query.retry}>
          Actualizar agenda
        </AppButton>
      </div>
      {query.error ? (
        <div
          className="mb-5 flex items-center justify-between rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-4 text-sm font-semibold text-[#8e2f28]"
          role="alert"
        >
          <span>{query.error}</span>
          <button className="font-black" type="button" onClick={query.retry}>
            Reintentar
          </button>
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <AppPanel
          title={periodLabel(anchor, mode)}
          eyebrow="Agenda viva"
          extra={
            <div className="flex gap-2">
              <AppButton
                variant={mode === 'month' ? 'primary' : 'secondary'}
                onClick={() => setMode('month')}
              >
                Mes
              </AppButton>
              <AppButton
                variant={mode === 'week' ? 'primary' : 'secondary'}
                onClick={() => setMode('week')}
              >
                Semana
              </AppButton>
            </div>
          }
        >
          <div className="flex items-center justify-between border-b border-[#e7ebe7] px-5 py-3">
            <AppButton variant="quiet" onClick={() => move(-1)}>
              Anterior
            </AppButton>
            <AppButton variant="quiet" onClick={() => setAnchor(new Date())}>
              Hoy
            </AppButton>
            <AppButton variant="quiet" onClick={() => move(1)}>
              Siguiente
            </AppButton>
          </div>
          {query.loading && !query.data ? (
            <div className="m-5 h-[31rem] animate-pulse rounded-xl bg-[#e8ece8]" />
          ) : (
            <MaintenanceCalendarGrid
              anchor={anchor}
              days={calendarDays(anchor, mode)}
              events={query.data?.events ?? []}
              mode={mode}
            />
          )}
        </AppPanel>
        <MaintenanceCalendarSidebar events={query.data?.events ?? []} />
      </div>
    </AppShell>
  );
}
