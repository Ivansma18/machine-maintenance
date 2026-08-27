import { PermissionGate } from '@/components/auth/PermissionGate';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { AppButton } from '@/components/ui/AppButton';
import { AppTag } from '@/components/ui/AppTag';
import { formatDateOnly } from '@/lib/formatters/dateFormatters';

import type { MachineProfile } from '../types';
import {
  getMachineCategoryLabel,
  getMachineCriticalityLabel,
  getMachineCriticalityTone,
  getMachineStatusLabel,
  getMachineStatusTone,
} from '../utils/machineFormatters';
import { ProfileDetail } from './MachineProfilePrimitives';

export function MachineProfileHero({
  profile,
  nextAction,
}: {
  profile: MachineProfile;
  nextAction: string;
}) {
  const { machine, health } = profile;
  const hasUrgency = health.overduePreventiveCount > 0 || health.openNotificationCount > 0;
  return (
    <AnimatedSection className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <section className="rounded-[1.5rem] bg-[#17211f] p-6 text-white shadow-[0_20px_50px_rgba(23,33,31,0.12)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="eyebrow !text-[#b8c7bc]">
              {getMachineCategoryLabel(machine.category.name)}
            </p>
            <p className="mb-2 mt-3 text-3xl font-black tracking-[-0.05em] sm:text-4xl">
              {machine.name}
            </p>
            <p className="m-0 text-sm text-[#c4d0c7]">
              ID corto: {machine.id.slice(0, 8)} · {machine.location}
              {machine.productionLine
                ? ` · ${machine.productionLine.area.site.name} / ${machine.productionLine.area.name} / ${machine.productionLine.name}`
                : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AppTag tone={getMachineStatusTone(machine.status)}>
              {getMachineStatusLabel(machine.status)}
            </AppTag>
            <AppTag tone={getMachineCriticalityTone(machine.criticality)}>
              {getMachineCriticalityLabel(machine.criticality)}
            </AppTag>
          </div>
        </div>
        <dl className="mt-8 grid gap-5 border-t border-white/15 pt-6 sm:grid-cols-3">
          <ProfileDetail
            label="Numero de serie"
            value={machine.serialNumber ?? 'No registrado'}
            dark
          />
          <ProfileDetail
            label="Fabricante / modelo"
            value={
              [machine.manufacturer, machine.model].filter(Boolean).join(' · ') || 'No registrado'
            }
            dark
          />
          <ProfileDetail label="Instalada" value={formatDateOnly(machine.installedAt)} dark />
        </dl>
      </section>
      <section
        className={`rounded-[1.5rem] border p-6 sm:p-8 ${hasUrgency ? 'border-[#f3d7d2] bg-[#fff7f5]' : 'border-[#cfe0d2] bg-[#e8f1e9]'}`}
      >
        <p className="eyebrow">Siguiente accion</p>
        <p className="mb-0 mt-5 text-2xl font-black leading-tight tracking-[-0.04em] text-[#17211f]">
          {nextAction}
        </p>
        <p className="mb-0 mt-4 text-sm leading-6 text-[#68736f]">
          {hasUrgency
            ? 'Revisa el pendiente antes de continuar con la operacion.'
            : 'La maquina no presenta riesgos inmediatos en el expediente.'}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <PermissionGate permission="maintenance-logs:create">
            <AppButton href={`/maintenance-logs?machineId=${machine.id}`}>
              Registrar mantenimiento
            </AppButton>
          </PermissionGate>
          <PermissionGate permission="notifications:read">
            <AppButton href="/notifications" variant="secondary">
              Abrir alertas
            </AppButton>
          </PermissionGate>
        </div>
      </section>
    </AnimatedSection>
  );
}
