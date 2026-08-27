'use client';

import { useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';

import type { MaintenancePlan, MaintenancePlanFormValues, PlanMachine } from '../types';

type MaintenancePlanFormProps = {
  plan?: MaintenancePlan;
  machines: PlanMachine[];
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (values: MaintenancePlanFormValues) => Promise<void>;
};

function getInitialValues(plan?: MaintenancePlan): MaintenancePlanFormValues {
  return {
    machineId: plan?.machineId ?? '',
    name: plan?.name ?? '',
    description: plan?.description ?? '',
    frequencyDays: plan?.frequencyDays ?? 30,
    warningDaysBefore: plan?.warningDaysBefore ?? 7,
    startsAt: plan?.startsAt.slice(0, 10) ?? '',
    isActive: plan?.isActive ?? true,
  };
}

export function MaintenancePlanForm({
  plan,
  machines,
  loading,
  error,
  onCancel,
  onSubmit,
}: MaintenancePlanFormProps) {
  const [values, setValues] = useState(() => getInitialValues(plan));
  const [validationError, setValidationError] = useState<string | null>(null);

  function updateValue<Key extends keyof MaintenancePlanFormValues>(
    key: Key,
    value: MaintenancePlanFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.machineId || !values.name.trim() || !values.startsAt) {
      setValidationError('La maquina, el nombre y la fecha de inicio son obligatorios.');
      return;
    }
    if (values.frequencyDays < 1 || values.warningDaysBefore < 1) {
      setValidationError('La frecuencia y la ventana preventiva deben ser mayores a cero.');
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
        <label className="grid gap-2 text-sm font-bold text-[#17211f] sm:col-span-2">
          Maquina
          <AppSelect
            aria-label="Maquina del plan"
            className="w-full"
            disabled={Boolean(plan)}
            placeholder="Selecciona una maquina"
            value={values.machineId || undefined}
            options={machines.map((machine) => ({
              label: `${machine.name} · ${machine.location}`,
              value: machine.id,
            }))}
            onChange={(value) => updateValue('machineId', value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f] sm:col-span-2">
          Nombre del plan
          <AppInput
            id="plan-name"
            maxLength={150}
            name="name"
            value={values.name}
            onChange={(event) => updateValue('name', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f] sm:col-span-2">
          Descripcion
          <textarea
            className="min-h-24 rounded-lg border border-[#d9dfda] bg-white px-3 py-2 text-sm font-medium text-[#17211f] outline-none transition focus:border-[#426b50] focus:ring-2 focus:ring-[#d8e8da]"
            id="plan-description"
            maxLength={5000}
            name="description"
            value={values.description}
            onChange={(event) => updateValue('description', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Frecuencia (dias)
          <AppInput
            id="plan-frequency-days"
            min={1}
            name="frequencyDays"
            type="number"
            value={values.frequencyDays}
            onChange={(event) => updateValue('frequencyDays', Number(event.target.value))}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Aviso previo (dias)
          <AppInput
            id="plan-warning-days"
            min={1}
            name="warningDaysBefore"
            type="number"
            value={values.warningDaysBefore}
            onChange={(event) => updateValue('warningDaysBefore', Number(event.target.value))}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Fecha de inicio
          <AppInput
            id="plan-starts-at"
            name="startsAt"
            type="date"
            value={values.startsAt}
            onChange={(event) => updateValue('startsAt', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Estado
          <AppSelect
            aria-label="Estado del plan"
            className="w-full"
            value={values.isActive ? 'ACTIVE' : 'INACTIVE'}
            options={[
              { label: 'Activo', value: 'ACTIVE' },
              { label: 'Inactivo', value: 'INACTIVE' },
            ]}
            onChange={(value) => updateValue('isActive', value === 'ACTIVE')}
          />
        </label>
      </div>
      <div className="flex justify-end gap-3 border-t border-[#dfe4df] pt-5">
        <AppButton variant="secondary" htmlType="button" onClick={onCancel}>
          Cancelar
        </AppButton>
        <AppButton htmlType="submit" loading={loading}>
          {plan ? 'Guardar cambios' : 'Agregar plan'}
        </AppButton>
      </div>
    </form>
  );
}
