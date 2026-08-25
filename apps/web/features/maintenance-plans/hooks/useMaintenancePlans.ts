'use client';

import { useEffect, useState } from 'react';

import {
  activateMaintenancePlan,
  createMaintenancePlan,
  deactivateMaintenancePlan,
  fetchMaintenancePlans,
  fetchPlanMachines,
  updateMaintenancePlan,
} from '../api/maintenancePlansApi';
import type {
  MaintenancePlan,
  MaintenancePlanFilters,
  MaintenancePlanFormValues,
  PlanMachine,
} from '../types';

const initialFilters: MaintenancePlanFilters = {
  activeState: 'ALL',
  situation: 'ALL',
  page: 1,
};

export function useMaintenancePlans() {
  const [filters, setFilters] = useState(initialFilters);
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [machines, setMachines] = useState<PlanMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [machinesLoading, setMachinesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setMachinesLoading(true);
    void fetchPlanMachines(controller.signal)
      .then((result) => setMachines(result.data))
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError'))
          setError('No se pudieron cargar las maquinas disponibles.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setMachinesLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const isActive = filters.activeState === 'ALL' ? undefined : filters.activeState === 'ACTIVE';
    void fetchMaintenancePlans(filters.machineId, isActive, controller.signal)
      .then((result) => setPlans(result.data))
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError'))
          setError(
            'No se pudieron cargar los planes preventivos. Verifica la API e intenta de nuevo.',
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters.activeState, filters.machineId, refreshKey]);

  function updateFilters(nextFilters: Partial<MaintenancePlanFilters>) {
    setFilters((current) => ({ ...current, ...nextFilters, page: nextFilters.page ?? 1 }));
  }

  async function savePlan(values: MaintenancePlanFormValues, plan?: MaintenancePlan) {
    setActionLoading(true);
    setActionError(null);
    try {
      if (plan) await updateMaintenancePlan(plan.id, values);
      else await createMaintenancePlan(values);
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo guardar el plan preventivo.',
      );
      throw requestError;
    } finally {
      setActionLoading(false);
    }
  }

  async function changePlanStatus(plan: MaintenancePlan) {
    setActionLoading(true);
    setActionError(null);
    try {
      if (plan.isActive) await deactivateMaintenancePlan(plan.id);
      else await activateMaintenancePlan(plan.id);
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo actualizar el estado del plan.',
      );
      throw requestError;
    } finally {
      setActionLoading(false);
    }
  }

  function retry() {
    setRefreshKey((value) => value + 1);
  }

  const filteredPlans = plans.filter((plan) => {
    if (filters.situation === 'DUE_SOON') return plan.isActive && plan.isDueSoon;
    if (filters.situation === 'OVERDUE') return plan.isActive && plan.isOverdue;
    if (filters.situation === 'ON_TRACK')
      return plan.isActive && !plan.isDueSoon && !plan.isOverdue;
    return true;
  });
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / pageSize));
  const page = Math.min(filters.page, totalPages);
  const data = filteredPlans.slice((page - 1) * pageSize, page * pageSize);

  return {
    data,
    allPlans: plans,
    machines,
    filters: { ...filters, page },
    total: filteredPlans.length,
    totalPages,
    loading,
    machinesLoading,
    error,
    actionError,
    actionLoading,
    updateFilters,
    savePlan,
    changePlanStatus,
    retry,
  };
}
