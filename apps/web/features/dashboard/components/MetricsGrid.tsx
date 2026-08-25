import { AnimatedSection } from '@/components/motion/AnimatedSection';

import { MetricCard } from './MetricCard';
import type { DashboardSummary } from '../types';

export function MetricsGrid({ summary }: { summary: DashboardSummary }) {
  return (
    <AnimatedSection className="mb-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" delay={0.1}>
      <MetricCard
        label="Maquinas activas"
        value={summary.machines.active}
        detail="Listas para produccion"
        tone="ink"
      />
      <MetricCard
        label="Proximos"
        value={summary.maintenance.dueSoon}
        detail="Dentro de la ventana de aviso"
        tone="warning"
      />
      <MetricCard
        label="Vencidos"
        value={summary.maintenance.overdue}
        detail="Requieren atencion hoy"
        tone="critical"
      />
      <MetricCard
        label="Alertas urgentes"
        value={summary.openUrgentNotifications}
        detail="Trabajo critico abierto"
        tone="sage"
      />
    </AnimatedSection>
  );
}
