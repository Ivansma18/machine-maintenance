const dateOnlyOptions: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
};

const dateTimeOptions: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export function formatDateOnly(value: string | null) {
  if (!value) return 'No registrada';
  return new Intl.DateTimeFormat('es-MX', dateOnlyOptions).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-MX', dateTimeOptions).format(new Date(value));
}
