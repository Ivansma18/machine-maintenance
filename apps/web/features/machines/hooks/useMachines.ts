'use client';

import { useEffect, useState } from 'react';

import {
  createMachine,
  deactivateMachine,
  fetchMachineCategories,
  fetchMachines,
  updateMachine,
} from '../api/machinesApi';
import type {
  Machine,
  MachineCategory,
  MachineFilters,
  MachineFormValues,
  MachinesResponse,
} from '../types';

const initialFilters: MachineFilters = { search: '', location: '', page: 1 };

export function useMachines() {
  const [filters, setFilters] = useState(initialFilters);
  const [result, setResult] = useState<MachinesResponse | null>(null);
  const [categories, setCategories] = useState<MachineCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setCategoriesLoading(true);
    void fetchMachineCategories(controller.signal)
      .then(setCategories)
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError'))
          setError('No se pudieron cargar las categorias de maquinas.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetchMachines(filters, controller.signal)
      .then(setResult)
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError'))
          setError('No se pudieron cargar las maquinas. Verifica la API e intenta de nuevo.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters, refreshKey]);

  function updateFilters(nextFilters: Partial<MachineFilters>) {
    setFilters((current) => ({ ...current, ...nextFilters, page: nextFilters.page ?? 1 }));
  }

  async function saveMachine(values: MachineFormValues, machine?: Machine) {
    setActionLoading(true);
    setActionError(null);
    try {
      if (machine) await updateMachine(machine.id, values);
      else await createMachine(values);
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : 'No se pudo guardar la maquina.',
      );
      throw requestError;
    } finally {
      setActionLoading(false);
    }
  }

  async function retireMachine(machine: Machine) {
    setActionLoading(true);
    setActionError(null);
    try {
      await deactivateMachine(machine.id);
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : 'No se pudo retirar la maquina.',
      );
      throw requestError;
    } finally {
      setActionLoading(false);
    }
  }

  function retry() {
    setRefreshKey((value) => value + 1);
  }

  return {
    ...result,
    filters,
    categories,
    loading,
    categoriesLoading,
    error,
    actionError,
    actionLoading,
    updateFilters,
    saveMachine,
    retireMachine,
    retry,
  };
}
