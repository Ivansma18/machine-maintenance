'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { PermissionGate } from '@/components/auth/PermissionGate';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { AppButton } from '@/components/ui/AppButton';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppShell } from '@/components/layout/AppShell';
import { AppTag } from '@/components/ui/AppTag';
import { formatDateOnly, formatDateTime } from '@/lib/formatters/dateFormatters';

import { useMachineProfile } from './hooks/useMachineProfile';
import type {
  MachineActivity,
  MachineProfile,
  ProfileMaintenanceLog,
  ProfileMaintenancePlan,
  ProfileNotification,
} from './types';
import {
  getMachineCategoryLabel,
  getMachineCriticalityLabel,
  getMachineCriticalityTone,
  getMachineStatusLabel,
  getMachineStatusTone,
} from './utils/machineFormatters';

type MachineProfilePageProps = { id: string };

export function MachineProfilePage({ id }: MachineProfilePageProps) {
  const query = useMachineProfile(id);

  return (
    <AppShell
      activeHref="/machines"
      header={{ eyebrow: 'Expediente tecnico', title: query.profile?.machine.name ?? 'Maquina' }}
    >
      <Link
        className="mb-6 inline-flex text-sm font-bold text-[#365441] underline underline-offset-4"
        href="/machines"
      >
        Volver a maquinas
      </Link>
      {query.loading && !query.profile ? <ProfileSkeleton /> : null}
      {!query.loading && query.errorStatus === 404 ? <NotFoundState /> : null}
      {!query.loading && query.error && query.errorStatus !== 404 ? (
        <ErrorState message={query.error} onRetry={query.retry} />
      ) : null}
      {query.profile ? <ProfileContent profile={query.profile} /> : null}
    </AppShell>
  );
}

function ProfileContent({ profile }: { profile: MachineProfile }) {
  const { machine, health } = profile;
  const hasUrgency = health.overduePreventiveCount > 0 || health.openNotificationCount > 0;
  const nextAction = health.overduePreventiveCount
    ? `Hay ${health.overduePreventiveCount} mantenimiento${health.overduePreventiveCount > 1 ? 's' : ''} preventivo${health.overduePreventiveCount > 1 ? 's' : ''} vencido${health.overduePreventiveCount > 1 ? 's' : ''}.`
    : health.openNotificationCount
      ? `Hay ${health.openNotificationCount} alerta${health.openNotificationCount > 1 ? 's' : ''} abierta${health.openNotificationCount > 1 ? 's' : ''}.`
      : health.nextMaintenanceAt
        ? `El siguiente mantenimiento vence el ${formatDateOnly(health.nextMaintenanceAt)}.`
        : 'No hay pendientes inmediatos.';

  return (
    <div className="space-y-6">
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
            <Detail label="Numero de serie" value={machine.serialNumber ?? 'No registrado'} dark />
            <Detail
              label="Fabricante / modelo"
              value={
                [machine.manufacturer, machine.model].filter(Boolean).join(' · ') || 'No registrado'
              }
              dark
            />
            <Detail label="Instalada" value={formatDateOnly(machine.installedAt)} dark />
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

      <section aria-label="Salud operativa" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric
          label="Proximo mantenimiento"
          value={formatDateOnly(health.nextMaintenanceAt)}
          tone={
            health.nextMaintenanceAt && new Date(health.nextMaintenanceAt) < new Date()
              ? 'danger'
              : 'neutral'
          }
        />
        <Metric
          label="Preventivos vencidos"
          value={String(health.overduePreventiveCount)}
          tone={health.overduePreventiveCount ? 'danger' : 'good'}
        />
        <Metric
          label="Alertas abiertas"
          value={String(health.openNotificationCount)}
          tone={health.openNotificationCount ? 'warning' : 'good'}
        />
        <Metric
          label="Dias desde mantenimiento"
          value={
            health.daysSinceLastMaintenance == null
              ? 'N/D'
              : String(health.daysSinceLastMaintenance)
          }
        />
        <Metric
          label="Fallas criticas recientes"
          value={String(health.recentCriticalFailureCount)}
          tone={health.recentCriticalFailureCount ? 'danger' : 'good'}
        />
        <Metric label="Ultima actualizacion" value={formatDateOnly(machine.updatedAt)} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PlansSection plans={profile.maintenancePlans} />
        <AlertsSection notifications={profile.openNotifications} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <HistorySection logs={profile.recentMaintenanceLogs} machineId={machine.id} />
        <ActivitySection activity={profile.activity} />
      </div>
      <div className="flex flex-wrap gap-3 border-t border-[#dfe4df] pt-5">
        <PermissionGate permission="machines:update">
          <AppButton href="/machines" variant="secondary">
            Editar en registro
          </AppButton>
        </PermissionGate>
        <PermissionGate permission="machines:retire">
          {machine.status !== 'RETIRED' ? (
            <AppButton href="/machines" variant="danger">
              Retirar desde registro
            </AppButton>
          ) : null}
        </PermissionGate>
      </div>
    </div>
  );
}

function PlansSection({ plans }: { plans: ProfileMaintenancePlan[] }) {
  return (
    <AppPanel
      eyebrow="Programacion preventiva"
      title="Planes asociados"
      extra={
        <PermissionGate permission="maintenance-plans:create">
          <AppButton href="/maintenance-plans" variant="quiet">
            Crear plan
          </AppButton>
        </PermissionGate>
      }
    >
      {plans.length ? (
        <div className="divide-y divide-[#dfe4df]">
          {plans.map((plan) => (
            <div className="p-5" key={plan.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="m-0 text-base font-black text-[#17211f]">{plan.name}</h2>
                  <p className="m-0 mt-1 text-sm text-[#68736f]">
                    Cada {plan.frequencyDays} dias · inicia {formatDateOnly(plan.startsAt)}
                  </p>
                </div>
                <AppTag
                  tone={
                    plan.isOverdue
                      ? 'critical'
                      : plan.isDueSoon
                        ? 'warning'
                        : plan.isActive
                          ? 'success'
                          : 'neutral'
                  }
                >
                  {plan.isOverdue
                    ? 'Vencido'
                    : plan.isDueSoon
                      ? 'Proximo'
                      : plan.isActive
                        ? 'En tiempo'
                        : 'Inactivo'}
                </AppTag>
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <Detail label="Proximo vencimiento" value={formatDateOnly(plan.nextDueAt)} />
                <Detail label="Ventana de aviso" value={formatDateOnly(plan.warningStartsAt)} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Sin planes preventivos"
          text="Esta maquina no tiene un plan preventivo activo."
          action={
            <PermissionGate permission="maintenance-plans:create">
              <AppButton href="/maintenance-plans">Crear primer plan</AppButton>
            </PermissionGate>
          }
        />
      )}
    </AppPanel>
  );
}

function AlertsSection({ notifications }: { notifications: ProfileNotification[] }) {
  return (
    <AppPanel
      eyebrow="Riesgo operativo"
      title="Alertas abiertas"
      extra={
        <AppButton href="/notifications" variant="quiet">
          Ver bandeja
        </AppButton>
      }
    >
      {notifications.length ? (
        <div className="divide-y divide-[#dfe4df]">
          {notifications.map((notification) => (
            <div className="p-5" key={notification.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <AppTag
                  tone={
                    notification.severity === 'CRITICAL' || notification.severity === 'URGENT'
                      ? 'critical'
                      : 'warning'
                  }
                >
                  {notification.severity}
                </AppTag>
                <span className="text-xs font-bold text-[#68736f]">
                  {notification.status === 'OPEN' ? 'Abierta' : 'Reconocida'}
                </span>
              </div>
              <h2 className="mb-1 mt-3 text-base font-black text-[#17211f]">
                {notification.title}
              </h2>
              <p className="m-0 text-sm leading-6 text-[#68736f]">{notification.message}</p>
              <p className="m-0 mt-3 text-xs text-[#68736f]">
                {notification.dueAt
                  ? `Vence ${formatDateTime(notification.dueAt)}`
                  : `Creada ${formatDateTime(notification.createdAt)}`}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Sin alertas abiertas"
          text="No hay alertas abiertas para esta maquina."
        />
      )}
    </AppPanel>
  );
}

function HistorySection({ logs, machineId }: { logs: ProfileMaintenanceLog[]; machineId: string }) {
  return (
    <AppPanel
      eyebrow="Registro inmutable"
      title="Historial reciente"
      extra={
        <AppButton href={`/maintenance-logs?machineId=${machineId}`} variant="quiet">
          Ver historial completo
        </AppButton>
      }
    >
      {logs.length ? (
        <div className="divide-y divide-[#dfe4df]">
          {logs.map((log) => (
            <div className="p-5" key={log.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-black text-[#17211f]">
                  {formatDateTime(log.performedAt)}
                </span>
                <AppTag
                  tone={
                    log.result === 'CRITICAL_FAILURE'
                      ? 'critical'
                      : log.result === 'OK'
                        ? 'success'
                        : 'warning'
                  }
                >
                  {log.result.replaceAll('_', ' ')}
                </AppTag>
              </div>
              <p className="m-0 mt-2 text-sm text-[#68736f]">
                {log.type} · {log.performedBy}
                {log.maintenancePlan ? ` · ${log.maintenancePlan.name}` : ''}
              </p>
              {log.notes ? (
                <p className="m-0 mt-3 text-sm leading-6 text-[#68736f]">{log.notes}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Todavia no hay mantenimientos"
          text="Todavia no hay mantenimientos registrados para esta maquina."
          action={
            <PermissionGate permission="maintenance-logs:create">
              <AppButton href={`/maintenance-logs?machineId=${machineId}`}>
                Registrar mantenimiento
              </AppButton>
            </PermissionGate>
          }
        />
      )}
    </AppPanel>
  );
}

function ActivitySection({ activity }: { activity: MachineActivity[] }) {
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
        <EmptyState title="Sin actividad" text="Aun no hay actividad tecnica para esta maquina." />
      )}
    </AppPanel>
  );
}

function getActivityTitle(event: MachineActivity) {
  if (event.kind === 'MACHINE') return 'Maquina agregada al registro';
  if (event.kind === 'MAINTENANCE') {
    const labels: Record<string, string> = {
      PREVENTIVE: 'Mantenimiento preventivo',
      CORRECTIVE: 'Mantenimiento correctivo',
      INSPECTION: 'Inspeccion',
    };
    return labels[event.title.split(' ')[0]] ?? 'Mantenimiento registrado';
  }
  return event.title;
}

function Metric({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'good' | 'warning' | 'danger';
}) {
  const toneClass = {
    neutral: 'text-[#17211f]',
    good: 'text-[#365441]',
    warning: 'text-[#9a6812]',
    danger: 'text-[#8e2f28]',
  }[tone];
  return (
    <div className="rounded-2xl border border-[#dfe4df] bg-white p-4">
      <p className="eyebrow">{label}</p>
      <p className={`m-0 mt-3 text-xl font-black tracking-[-0.04em] ${toneClass}`}>{value}</p>
    </div>
  );
}

function Detail({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  return (
    <div>
      <dt className={`eyebrow ${dark ? '!text-[#b8c7bc]' : ''}`}>{label}</dt>
      <dd className={`m-0 mt-1 text-sm font-semibold ${dark ? 'text-white' : 'text-[#17211f]'}`}>
        {value}
      </dd>
    </div>
  );
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="p-8 text-center">
      <h2 className="m-0 text-base font-black text-[#17211f]">{title}</h2>
      <p className="mb-0 mt-2 text-sm text-[#68736f]">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-label="Cargando expediente" className="animate-pulse space-y-6" role="status">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="h-72 rounded-[1.5rem] bg-[#dfe4df]" />
        <div className="h-72 rounded-[1.5rem] bg-[#e8ece8]" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="h-24 rounded-2xl bg-[#e8ece8]" key={index} />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-[#e8ece8]" />
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="rounded-2xl border border-[#dfe4df] bg-white p-10 text-center">
      <h1 className="m-0 text-2xl font-black tracking-[-0.04em] text-[#17211f]">
        Maquina no encontrada
      </h1>
      <p className="mb-0 mt-3 text-sm text-[#68736f]">
        El expediente solicitado no existe o ya no esta disponible.
      </p>
      <div className="mt-6">
        <AppButton href="/machines">Volver a maquinas</AppButton>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-7 sm:flex-row sm:items-center">
      <div>
        <h1 className="m-0 text-lg font-black text-[#8e2f28]">Expediente no disponible</h1>
        <p className="mb-0 mt-2 text-sm text-[#a65a52]">{message}</p>
      </div>
      <AppButton variant="secondary" onClick={onRetry}>
        Reintentar
      </AppButton>
    </div>
  );
}
