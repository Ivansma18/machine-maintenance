'use client';

import { useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';

import type {
  LogMachine,
  LogPlan,
  MaintenanceLogFormValues,
  MaintenanceResult,
  MaintenanceType,
} from '../types';
import {
  getMaintenanceResultLabel,
  getMaintenanceTypeLabel,
} from '../utils/maintenanceLogFormatters';

type MaintenanceLogFormProps = {
  machines: LogMachine[];
  plans: LogPlan[];
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (values: MaintenanceLogFormValues) => Promise<void>;
};

const types: MaintenanceType[] = ['PREVENTIVE', 'CORRECTIVE', 'INSPECTION'];
const results: MaintenanceResult[] = ['OK', 'NEEDS_FOLLOW_UP', 'FAILED', 'CRITICAL_FAILURE'];

function getInitialValues(): MaintenanceLogFormValues {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return {
    machineId: '',
    maintenancePlanId: '',
    performedAt: now.toISOString().slice(0, 16),
    type: 'PREVENTIVE',
    result: 'OK',
    notes: '',
    performedBy: '',
  };
}

export function MaintenanceLogForm({
  machines,
  plans,
  loading,
  error,
  onCancel,
  onSubmit,
}: MaintenanceLogFormProps) {
  const [values, setValues] = useState(() => getInitialValues());
  const [validationError, setValidationError] = useState<string | null>(null);

  function updateValue<Key extends keyof MaintenanceLogFormValues>(
    key: Key,
    value: MaintenanceLogFormValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === 'machineId' ? { maintenancePlanId: '' } : {}),
    }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.machineId || !values.performedAt || !values.performedBy.trim()) {
      setValidationError('La maquina, la fecha, la hora y el responsable son obligatorios.');
      return;
    }
    setValidationError(null);
    await onSubmit(values);
  }

  const availablePlans = plans.filter((plan) => plan.machineId === values.machineId);

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
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Maquina
          <AppSelect
            aria-label="Maquina del mantenimiento"
            className="w-full"
            placeholder="Selecciona una maquina"
            value={values.machineId || undefined}
            options={machines.map((machine) => ({
              label: `${machine.name} · ${machine.location}`,
              value: machine.id,
            }))}
            onChange={(value) => updateValue('machineId', value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Plan preventivo <span className="font-normal text-[#68736f]">(opcional)</span>
          <AppSelect
            aria-label="Plan preventivo del mantenimiento"
            className="w-full"
            disabled={!values.machineId}
            placeholder={values.machineId ? 'Sin plan asociado' : 'Selecciona una maquina primero'}
            value={values.maintenancePlanId || undefined}
            options={availablePlans.map((plan) => ({ label: plan.name, value: plan.id }))}
            onChange={(value) => updateValue('maintenancePlanId', value || '')}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Fecha y hora
          <AppInput
            id="log-performed-at"
            name="performedAt"
            type="datetime-local"
            value={values.performedAt}
            onChange={(event) => updateValue('performedAt', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Responsable
          <AppInput
            id="log-performed-by"
            maxLength={150}
            name="performedBy"
            value={values.performedBy}
            onChange={(event) => updateValue('performedBy', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Tipo
          <AppSelect
            aria-label="Tipo de mantenimiento"
            className="w-full"
            value={values.type}
            options={types.map((type) => ({ label: getMaintenanceTypeLabel(type), value: type }))}
            onChange={(value) => updateValue('type', value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Resultado
          <AppSelect
            aria-label="Resultado del mantenimiento"
            className="w-full"
            value={values.result}
            options={results.map((result) => ({
              label: getMaintenanceResultLabel(result),
              value: result,
            }))}
            onChange={(value) => updateValue('result', value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f] sm:col-span-2">
          Notas
          <textarea
            className="min-h-24 rounded-lg border border-[#d9dfda] bg-white px-3 py-2 text-sm font-medium text-[#17211f] outline-none transition focus:border-[#426b50] focus:ring-2 focus:ring-[#d8e8da]"
            id="log-notes"
            maxLength={10000}
            name="notes"
            value={values.notes}
            onChange={(event) => updateValue('notes', event.target.value)}
          />
        </label>
      </div>
      {values.result === 'CRITICAL_FAILURE' ? (
        <div
          className="rounded-xl border border-[#f0c6bf] bg-[#fff1ee] p-4 text-sm text-[#8e2f28]"
          role="alert"
        >
          <p className="m-0 font-black">Se generara una alerta urgente</p>
          <p className="m-0 mt-1 leading-6">
            Este resultado creara una notificacion critica abierta para el equipo de mantenimiento.
          </p>
        </div>
      ) : null}
      <div className="flex justify-end gap-3 border-t border-[#dfe4df] pt-5">
        <AppButton variant="secondary" htmlType="button" onClick={onCancel}>
          Cancelar
        </AppButton>
        <AppButton htmlType="submit" loading={loading}>
          Registrar mantenimiento
        </AppButton>
      </div>
    </form>
  );
}
