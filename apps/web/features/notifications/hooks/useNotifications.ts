'use client';

import { useEffect, useState } from 'react';

import {
  acknowledgeNotification,
  dismissNotification,
  fetchNotificationMachines,
  fetchNotifications,
  processPreventiveNotifications,
  resolveNotification,
} from '../api/notificationsApi';
import type { Notification, NotificationFilters, NotificationMachineOption } from '../types';

const initialFilters: NotificationFilters = { page: 1 };

export function useNotifications() {
  const [filters, setFilters] = useState(initialFilters);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [machines, setMachines] = useState<NotificationMachineOption[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setCatalogLoading(true);
    void fetchNotificationMachines(controller.signal)
      .then((result) => setMachines(result.data))
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError'))
          setError('No se pudieron cargar las maquinas disponibles.');
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
    void fetchNotifications(filters, controller.signal)
      .then((result) => {
        setNotifications(result.data);
        setMeta(result.meta);
      })
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError'))
          setError('No se pudieron cargar las alertas. Verifica la API e intenta de nuevo.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters, refreshKey]);

  function updateFilters(nextFilters: Partial<NotificationFilters>) {
    setFilters((current) => ({ ...current, ...nextFilters, page: nextFilters.page ?? 1 }));
  }

  async function runAction(action: () => Promise<unknown>, message: string) {
    setActionLoading(true);
    setActionError(null);
    setFeedback(null);
    try {
      await action();
      setFeedback(message);
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : 'No se pudo actualizar la alerta.',
      );
      throw requestError;
    } finally {
      setActionLoading(false);
    }
  }

  function acknowledge(notification: Notification) {
    return runAction(() => acknowledgeNotification(notification.id), 'Alerta reconocida.');
  }

  function resolve(notification: Notification) {
    return runAction(() => resolveNotification(notification.id), 'Alerta resuelta.');
  }

  function dismiss(notification: Notification) {
    return runAction(() => dismissNotification(notification.id), 'Alerta descartada.');
  }

  function processPreventive() {
    return runAction(
      () => processPreventiveNotifications(),
      'Motor preventivo ejecutado y bandeja actualizada.',
    );
  }

  function retry() {
    setRefreshKey((value) => value + 1);
  }

  return {
    notifications,
    machines,
    meta,
    filters,
    loading,
    catalogLoading,
    error,
    actionError,
    actionLoading,
    feedback,
    updateFilters,
    acknowledge,
    resolve,
    dismiss,
    processPreventive,
    retry,
  };
}
