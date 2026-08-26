import { AppButton } from '@/components/ui/AppButton';

export function ProfileSkeleton() {
  return (
    <div aria-label="Cargando expediente" className="animate-pulse space-y-6" role="status">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="h-72 rounded-[1.5rem] bg-[#dfe4df]" />
        <div className="h-72 rounded-[1.5rem] bg-[#e8ece8]" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="h-24 rounded-2xl bg-[#e8ece8]" key={index} />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-[#e8ece8]" />
    </div>
  );
}
export function NotFoundState() {
  return (
    <div className="rounded-2xl border border-[#dfe4df] bg-white p-10 text-center">
      <h1 className="m-0 text-2xl font-black tracking-[-0.04em] text-[#17211f]">
        Maquina no encontrada
      </h1>
      <p className="mb-0 mt-3 text-sm text-[#68736f]">
        El expediente solicitado no existe o ya no esta disponible.
      </p>
      <div className="mt-6">
        <AppButton href="/machines">Volver a maquinas</AppButton>
      </div>
    </div>
  );
}
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-7 sm:flex-row sm:items-center">
      <div>
        <h1 className="m-0 text-lg font-black text-[#8e2f28]">Expediente no disponible</h1>
        <p className="mb-0 mt-2 text-sm text-[#a65a52]">{message}</p>
      </div>
      <AppButton variant="secondary" onClick={onRetry}>
        Reintentar
      </AppButton>
    </div>
  );
}
