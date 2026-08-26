'use client';

import { useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';

import type {
  MachineCategory,
  MachineCriticality,
  MachineFilters as Filters,
  MachineStatus,
} from '../types';
import {
  getMachineCategoryLabel,
  getMachineCriticalityLabel,
  getMachineStatusLabel,
} from '../utils/machineFormatters';

type MachineFiltersProps = {
  categories: MachineCategory[];
  filters: Filters;
  onChange: (filters: Partial<Filters>) => void;
};

const statuses: MachineStatus[] = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'RETIRED'];
const criticalities: MachineCriticality[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function MachineFilters({ categories, filters, onChange }: MachineFiltersProps) {
  const [search, setSearch] = useState(filters.search);
  const [location, setLocation] = useState(filters.location ?? '');

  function applySearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onChange({ search, location });
  }

  function reset() {
    setSearch('');
    setLocation('');
    onChange({
      search: '',
      location: '',
      categoryId: undefined,
      status: undefined,
      criticality: undefined,
    });
  }

  return (
    <div className="grid p-5 gap-3 lg:grid-cols-[minmax(240px,1fr)_minmax(160px,0.7fr)_180px_180px_180px_auto]">
      <form autoComplete="off" className="flex gap-2" onSubmit={applySearch}>
        <AppInput
          aria-label="Buscar maquinas"
          id="machine-search"
          name="search"
          placeholder="Buscar por nombre, serie o fabricante"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <AppButton htmlType="submit" variant="secondary">
          Buscar
        </AppButton>
      </form>
      <AppInput
        aria-label="Filtrar por ubicacion"
        id="machine-location-filter"
        name="location"
        placeholder="Ubicacion"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        onPressEnter={() => onChange({ location })}
      />
      <AppSelect
        allowClear
        id="machine-category-filter"
        className="w-full"
        aria-label="Filtrar por categoria"
        placeholder="Todas las categorias"
        value={filters.categoryId}
        options={categories.map((category) => ({
          label: getMachineCategoryLabel(category.name),
          value: category.id,
        }))}
        onChange={(value) => onChange({ categoryId: value })}
      />
      <AppSelect
        allowClear
        className="w-full"
        aria-label="Filtrar por estado"
        id="machine-status-filter"
        placeholder="Todos los estados"
        value={filters.status}
        options={statuses.map((status) => ({
          label: getMachineStatusLabel(status),
          value: status,
        }))}
        onChange={(value) => onChange({ status: value })}
      />
      <AppSelect
        allowClear
        className="w-full"
        aria-label="Filtrar por criticidad"
        id="machine-criticality-filter"
        placeholder="Toda criticidad"
        value={filters.criticality}
        options={criticalities.map((criticality) => ({
          label: getMachineCriticalityLabel(criticality),
          value: criticality,
        }))}
        onChange={(value) => onChange({ criticality: value })}
      />
      <AppButton variant="quiet" onClick={reset}>
        Limpiar
      </AppButton>
    </div>
  );
}
