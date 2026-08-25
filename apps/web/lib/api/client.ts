const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path.startsWith('http') ? path : `${apiBaseUrl}${path}`, {
    ...init,
    cache: 'no-store',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    const error = new ApiError(
      localizeApiMessage(message) ?? `La solicitud fallo con el estado ${response.status}`,
      response.status,
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(error.status === 401 ? 'app:auth-unauthorized' : 'app:auth-error', {
          detail: error,
        }),
      );
    }

    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function localizeApiMessage(message?: string) {
  if (!message) return undefined;
  if (message.includes('serial number already exists'))
    return 'Ya existe una maquina con ese numero de serie.';
  if (message.includes('equivalent active maintenance plan'))
    return 'Ya existe un plan preventivo equivalente y activo para esta maquina.';
  if (message.includes('category') && message.includes('does not exist'))
    return 'La categoria seleccionada no existe.';
  if (message.includes('does not belong'))
    return 'El plan seleccionado no pertenece a esa maquina.';
  if (message.includes('performedAt')) return 'La fecha y hora del mantenimiento no son validas.';
  if (message.includes('Machine') && message.includes('not found'))
    return 'La maquina no fue encontrada.';
  if (message.includes('not found')) return 'El registro solicitado no fue encontrado.';
  if (message.includes('cannot transition'))
    return 'La alerta ya no permite esa transicion de estado.';
  return message;
}
