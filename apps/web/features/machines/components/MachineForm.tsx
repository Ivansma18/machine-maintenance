'use client';

import { useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';

import type {
  Machine,
  MachineCategory,
  MachineFormValues,
  MachineCriticality,
  MachineStatus,
} from '../types';
import { getMachineCriticalityLabel, getMachineStatusLabel } from '../utils/machineFormatters';

type MachineFormProps = {
  machine?: Machine;
  categories: MachineCategory[];
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (values: MachineFormValues) => Promise<void>;
};

const statuses: MachineStatus[] = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'RETIRED'];
const criticalities: MachineCriticality[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function getInitialValues(machine?: Machine): MachineFormValues {
  return {
    categoryId: machine?.categoryId ?? '',
    name: machine?.name ?? '',
    serialNumber: machine?.serialNumber ?? '',
    location: machine?.location ?? '',
    manufacturer: machine?.manufacturer ?? '',
    model: machine?.model ?? '',
    status: machine?.status ?? 'ACTIVE',
    criticality: machine?.criticality ?? 'MEDIUM',
    installedAt: machine?.installedAt?.slice(0, 10) ?? '',
  };
}

export function MachineForm({
  machine,
  categories,
  loading,
  error,
  onCancel,
  onSubmit,
}: MachineFormProps) {
  const [values, setValues] = useState(() => getInitialValues(machine));
  const [validationError, setValidationError] = useState<string | null>(null);

  function updateValue<Key extends keyof MachineFormValues>(
    key: Key,
    value: MachineFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.categoryId || !values.name.trim() || !values.location.trim()) {
      setValidationError('Category, name and location are required.');
      return;
    }
    setValidationError(null);
    await onSubmit(values);
  }

  return (
    <form className="grid gap-5" onSubmit={submit}>
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
          Machine name{' '}
          <AppInput
            maxLength={150}
            value={values.name}
            onChange={(event) => updateValue('name', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Category{' '}
          <AppSelect
            className="w-full"
            placeholder="Select category"
            value={values.categoryId || undefined}
            options={categories.map((category) => ({ label: category.name, value: category.id }))}
            onChange={(value) => updateValue('categoryId', value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Location{' '}
          <AppInput
            maxLength={150}
            value={values.location}
            onChange={(event) => updateValue('location', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Serial number{' '}
          <AppInput
            maxLength={100}
            value={values.serialNumber}
            onChange={(event) => updateValue('serialNumber', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Manufacturer{' '}
          <AppInput
            maxLength={100}
            value={values.manufacturer}
            onChange={(event) => updateValue('manufacturer', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Model{' '}
          <AppInput
            maxLength={100}
            value={values.model}
            onChange={(event) => updateValue('model', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Installed date{' '}
          <AppInput
            type="date"
            value={values.installedAt}
            onChange={(event) => updateValue('installedAt', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Status{' '}
          <AppSelect
            className="w-full"
            value={values.status}
            options={statuses.map((status) => ({
              label: getMachineStatusLabel(status),
              value: status,
            }))}
            onChange={(value) => updateValue('status', value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#17211f]">
          Criticality{' '}
          <AppSelect
            className="w-full"
            value={values.criticality}
            options={criticalities.map((criticality) => ({
              label: getMachineCriticalityLabel(criticality),
              value: criticality,
            }))}
            onChange={(value) => updateValue('criticality', value)}
          />
        </label>
      </div>
      <div className="flex justify-end gap-3 border-t border-[#dfe4df] pt-5">
        <AppButton variant="secondary" htmlType="button" onClick={onCancel}>
          Cancel
        </AppButton>
        <AppButton htmlType="submit" loading={loading}>
          {machine ? 'Save changes' : 'Add machine'}
        </AppButton>
      </div>
    </form>
  );
}
