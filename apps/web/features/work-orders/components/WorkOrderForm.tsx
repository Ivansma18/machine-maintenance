'use client';

import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import type { WorkOrderFormValues, WorkOrderMachine } from '../types';

export function WorkOrderForm({
  machines,
  loading,
  error,
  currentUserId,
  onCancel,
  onSubmit,
  initialValues,
  fixedMachineId,
  submitLabel = 'Crear orden',
  requireSchedule = false,
}: {
  machines: WorkOrderMachine[];
  loading: boolean;
  error: string | null;
  currentUserId?: string;
  onCancel: () => void;
  onSubmit: (values: WorkOrderFormValues) => Promise<void>;
  initialValues?: Partial<WorkOrderFormValues>;
  fixedMachineId?: string;
  submitLabel?: string;
  requireSchedule?: boolean;
}) {
  const [values, setValues] = useState<WorkOrderFormValues>({
    machineId: '',
    title: '',
    description: '',
    type: 'CORRECTIVE',
    priority: 'MEDIUM',
    ...initialValues,
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const set = <K extends keyof WorkOrderFormValues>(key: K, value: WorkOrderFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.machineId || !values.title.trim() || (requireSchedule && !values.scheduledAt)) {
      setValidationError(
        requireSchedule
          ? 'La máquina, el título y la fecha de programación son obligatorios.'
          : 'La máquina y el título son obligatorios.',
      );
      return;
    }
    setValidationError(null);
    await onSubmit(values);
  }
  return (
    <form autoComplete="off" className="grid gap-5" onSubmit={submit}>
      {validationError || error ? (
        <div
          className="rounded-lg border border-[#f3d7d2] bg-[#fff7f5] px-4 py-3 text-sm text-[#8e2f28]"
          role="alert"
        >
          {validationError ?? error}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold sm:col-span-2">
          Máquina
          <AppSelect
            className="w-full"
            disabled={Boolean(fixedMachineId)}
            placeholder="Selecciona una máquina"
            value={values.machineId || undefined}
            options={machines.map((machine) => ({
              value: machine.id,
              label: `${machine.name} · ${machine.location}`,
            }))}
            onChange={(value) => set('machineId', value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold sm:col-span-2">
          Título
          <AppInput
            maxLength={180}
            value={values.title}
            onChange={(event) => set('title', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold sm:col-span-2">
          Descripción
          <textarea
            className="min-h-24 rounded-lg border border-[#d9dfda] px-3 py-2 text-sm outline-none focus:border-[#426b50]"
            maxLength={5000}
            value={values.description}
            onChange={(event) => set('description', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Tipo
          <AppSelect
            className="w-full"
            value={values.type}
            options={[
              { value: 'CORRECTIVE', label: 'Correctiva' },
              { value: 'PREVENTIVE', label: 'Preventiva' },
              { value: 'INSPECTION', label: 'Inspección' },
            ]}
            onChange={(value) => set('type', value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Prioridad
          <AppSelect
            className="w-full"
            value={values.priority}
            options={[
              { value: 'URGENT', label: 'Urgente' },
              { value: 'HIGH', label: 'Alta' },
              { value: 'MEDIUM', label: 'Media' },
              { value: 'LOW', label: 'Baja' },
            ]}
            onChange={(value) => set('priority', value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Programar
          <AppInput
            type="datetime-local"
            value={values.scheduledAt?.slice(0, 16) ?? ''}
            onChange={(event) =>
              set(
                'scheduledAt',
                event.target.value ? new Date(event.target.value).toISOString() : undefined,
              )
            }
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Vencimiento
          <AppInput
            type="datetime-local"
            value={values.dueAt?.slice(0, 16) ?? ''}
            onChange={(event) =>
              set(
                'dueAt',
                event.target.value ? new Date(event.target.value).toISOString() : undefined,
              )
            }
          />
        </label>
      </div>
      {currentUserId ? (
        <button
          className="text-left text-xs font-bold text-[#365441]"
          type="button"
          onClick={() =>
            set('assignedToUserId', values.assignedToUserId ? undefined : currentUserId)
          }
        >
          {values.assignedToUserId ? '✓ Me asignaré esta orden' : 'Asignarme esta orden al crear'}
        </button>
      ) : null}
      <div className="flex justify-end gap-3 border-t border-[#dfe4df] pt-5">
        <AppButton variant="secondary" htmlType="button" onClick={onCancel}>
          Cancelar
        </AppButton>
        <AppButton htmlType="submit" loading={loading}>
          {submitLabel}
        </AppButton>
      </div>
    </form>
  );
}
