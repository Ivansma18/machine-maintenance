'use client';

import { AppButton } from '@/components/ui/AppButton';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppShell } from '@/components/layout/AppShell';
import { RecurrenceMetricCards } from './components/RecurrenceMetricCards';
import { RecurrenceMachineTable } from './components/RecurrenceMachineTable';
import { RecommendationList } from './components/RecommendationList';
import { useRecurrenceMetrics } from './hooks/useRecurrenceMetrics';

export function MaintenanceMetricsPage() {
  const metrics = useRecurrenceMetrics();
  return (
    <AppShell
      activeHref="/maintenance-metrics"
      header={{
        eyebrow: 'Espacio de trabajo / inteligencia operativa',
        title: 'Métricas de reincidencia',
        action: (
          <AppButton variant="secondary" onClick={metrics.retry}>
            Actualizar métricas
          </AppButton>
        ),
      }}
    >
      <div className="mb-8">
        <p className="eyebrow">Lectura determinística · últimos 6 meses</p>
        <p className="mb-0 mt-3 max-w-2xl text-sm leading-6 text-[#68736f]">
          Encuentra máquinas que fallan con frecuencia, acumulan preventivos vencidos o consumen las
          mismas piezas repetidamente. Los indicadores se calculan sobre el historial existente.
        </p>
      </div>
      {metrics.error ? (
        <div
          className="mb-5 flex items-center justify-between rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-5 text-sm font-bold text-[#8e2f28]"
          role="alert"
        >
          <span>{metrics.error}</span>
          <AppButton variant="secondary" onClick={metrics.retry}>
            Reintentar
          </AppButton>
        </div>
      ) : null}
      {metrics.loading && !metrics.data ? (
        <div className="grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div className="h-36 rounded-2xl bg-[#e8ece8]" key={item} />
          ))}
        </div>
      ) : metrics.data ? (
        <div className="grid gap-6">
          <RecurrenceMetricCards summary={metrics.data.summary} />
          <AppPanel title="Recomendaciones operativas" eyebrow="Reglas explicables">
            <div className="p-5 pt-1">
              <RecommendationList recommendations={metrics.data.recommendations} />
            </div>
          </AppPanel>
          <AppPanel title="Máquinas a observar" eyebrow="Ordenadas por fallas y costo">
            <RecurrenceMachineTable machines={metrics.data.machines} />
          </AppPanel>
        </div>
      ) : null}
    </AppShell>
  );
}
