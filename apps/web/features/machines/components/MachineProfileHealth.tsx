import { formatDateOnly } from '@/lib/formatters/dateFormatters';
import type { MachineProfile } from '../types';

export function MachineProfileHealth({ profile }: { profile: MachineProfile }) {
  const { machine, health } = profile;
  return (
    <section aria-label="Salud operativa" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {[
        [
          'Proximo mantenimiento',
          formatDateOnly(health.nextMaintenanceAt),
          health.nextMaintenanceAt && new Date(health.nextMaintenanceAt) < new Date()
            ? 'danger'
            : 'neutral',
        ],
        [
          'Preventivos vencidos',
          String(health.overduePreventiveCount),
          health.overduePreventiveCount ? 'danger' : 'good',
        ],
        [
          'Alertas abiertas',
          String(health.openNotificationCount),
          health.openNotificationCount ? 'warning' : 'good',
        ],
        [
          'Dias desde mantenimiento',
          health.daysSinceLastMaintenance == null ? 'N/D' : String(health.daysSinceLastMaintenance),
          'neutral',
        ],
        [
          'Fallas criticas recientes',
          String(health.recentCriticalFailureCount),
          health.recentCriticalFailureCount ? 'danger' : 'good',
        ],
        ['Ultima actualizacion', formatDateOnly(machine.updatedAt), 'neutral'],
      ].map(([label, value, tone]) => (
        <div className="rounded-2xl border border-[#dfe4df] bg-white p-4" key={label}>
          <p className="eyebrow">{label}</p>
          <p
            className={`m-0 mt-3 text-xl font-black tracking-[-0.04em] ${({ neutral: 'text-[#17211f]', good: 'text-[#365441]', warning: 'text-[#9a6812]', danger: 'text-[#8e2f28]' } as Record<string, string>)[tone]}`}
          >
            {value}
          </p>
        </div>
      ))}
    </section>
  );
}
