'use client';

import { useEffect, useState } from 'react';

import {
  createMaintenanceLog,
  fetchLogMachines,
  fetchLogPlans,
  fetchMaintenanceLogs,
} from '../api/maintenanceLogsApi';
import type {
  LogMachine,
  LogPlan,
  MaintenanceLog,
  MaintenanceLogFilters,
  MaintenanceLogFormValues,
} from '../types';

const initialFilters: MaintenanceLogFilters = { page: 1 };

export function useMaintenanceLogs() {
  const [filters, setFilters] = useState(initialFilters);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [machines, setMachines] = useState<LogMachine[]>([]);
  const [plans, setPlans] = useState<LogPlan[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setCatalogLoading(true);
    void Promise.all([fetchLogMachines(controller.signal), fetchLogPlans(controller.signal)])
      .then(([machineResult, planResult]) => {
        setMachines(machineResult.data);
        setPlans(planResult.data);
      })
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError'))
          setError('No se pudieron cargar las maquinas y planes disponibles.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setCatalogLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void fetchMaintenanceLogs(filters, controller.signal)
      .then((result) => {
        setLogs(result.data);
        setMeta(result.meta);
      })
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError'))
          setError(
            'No se pudo cargar el historial de mantenimientos. Verifica la API e intenta de nuevo.',
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters, refreshKey]);

  function updateFilters(nextFilters: Partial<MaintenanceLogFilters>) {
    setFilters((current) => ({ ...current, ...nextFilters, page: nextFilters.page ?? 1 }));
  }

  async function saveLog(values: MaintenanceLogFormValues) {
    setActionLoading(true);
    setActionError(null);
    try {
      const result = await createMaintenanceLog(values);
      setRefreshKey((value) => value + 1);
      return result;
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo registrar el mantenimiento.',
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
    logs,
    machines,
    plans,
    meta,
    filters,
    loading,
    catalogLoading,
    error,
    actionError,
    actionLoading,
    updateFilters,
    saveLog,
    retry,
  };
}
