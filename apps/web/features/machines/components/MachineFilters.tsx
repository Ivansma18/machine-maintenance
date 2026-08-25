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
import { getMachineCriticalityLabel, getMachineStatusLabel } from '../utils/machineFormatters';

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
    <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_minmax(160px,0.7fr)_180px_180px_180px_auto]">
      <form autoComplete="off" className="flex gap-2" onSubmit={applySearch}>
        <AppInput
          aria-label="Search machines"
          id="machine-search"
          name="search"
          placeholder="Search name, serial or manufacturer"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <AppButton htmlType="submit" variant="secondary">
          Search
        </AppButton>
      </form>
      <AppInput
        aria-label="Filter by location"
        id="machine-location-filter"
        name="location"
        placeholder="Location"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        onPressEnter={() => onChange({ location })}
      />
      <AppSelect
        allowClear
        id="machine-category-filter"
        className="w-full"
        aria-label="Filter by category"
        placeholder="All categories"
        value={filters.categoryId}
        options={categories.map((category) => ({ label: category.name, value: category.id }))}
        onChange={(value) => onChange({ categoryId: value })}
      />
      <AppSelect
        allowClear
        className="w-full"
        aria-label="Filter by status"
        id="machine-status-filter"
        placeholder="All statuses"
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
        aria-label="Filter by criticality"
        id="machine-criticality-filter"
        placeholder="All criticality"
        value={filters.criticality}
        options={criticalities.map((criticality) => ({
          label: getMachineCriticalityLabel(criticality),
          value: criticality,
        }))}
        onChange={(value) => onChange({ criticality: value })}
      />
      <AppButton variant="quiet" onClick={reset}>
        Clear
      </AppButton>
    </div>
  );
}
