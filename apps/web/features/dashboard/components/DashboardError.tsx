import { AppButton } from '@/components/ui/AppButton';

type DashboardErrorProps = { message: string; onRetry: () => void };

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <div
      className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-5 sm:flex-row sm:items-center"
      role="alert"
    >
      <div>
        <p className="m-0 text-sm font-bold text-[#8e2f28]">Resumen no disponible</p>
        <p className="m-0 mt-1 text-xs leading-5 text-[#a65a52]">{message}</p>
      </div>
      <AppButton variant="secondary" onClick={onRetry}>
        Reintentar
      </AppButton>
    </div>
  );
}
