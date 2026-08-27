import Link from 'next/link';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppTag } from '@/components/ui/AppTag';
import type { MachinePartsResponse } from '../types';

export function MachineProfileParts({
  result,
  loading,
  error,
  onRetry,
}: {
  result: MachinePartsResponse | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const criticalOut =
    result?.summary.filter(({ part }) => part.isCritical && part.inventory?.stockState === 'OUT') ??
    [];
  return (
    <AppPanel
      title="Refacciones"
      eyebrow="Consumo en esta máquina"
      extra={
        <Link
          className="text-xs font-black uppercase tracking-[0.1em] text-[#365441]"
          href="/maintenance-logs"
        >
          Ver historial
        </Link>
      }
    >
      <div className="px-5 pb-5 pt-1">
        {loading ? (
          <div className="h-24 animate-pulse rounded-xl bg-[#e8ece8]" />
        ) : error ? (
          <div
            className="flex items-center justify-between gap-3 rounded-xl border border-[#f3d7d2] bg-[#fff7f5] p-4 text-sm text-[#8e2f28]"
            role="alert"
          >
            <span>{error}</span>
            <button className="font-black" type="button" onClick={onRetry}>
              Reintentar
            </button>
          </div>
        ) : !result?.recent.length ? (
          <p className="m-0 text-sm text-[#68736f]">
            Todavía no hay piezas consumidas en mantenimientos de esta máquina.
          </p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            {criticalOut.length ? (
              <div className="rounded-xl border border-[#f3d7d2] bg-[#fff7f5] p-4 lg:col-span-2">
                <p className="m-0 text-xs font-black uppercase tracking-[0.12em] text-[#8e2f28]">
                  Atención de inventario
                </p>
                <p className="mb-0 mt-1 text-sm font-bold text-[#8e2f28]">
                  {criticalOut.length} refacción crítica sin existencia.
                </p>
              </div>
            ) : null}
            <div>
              <p className="eyebrow mb-3">Últimos consumos</p>
              <div className="divide-y divide-[#e7ebe7]">
                {result.recent.slice(0, 5).map((item) => (
                  <div
                    className="flex items-center justify-between gap-3 py-3 first:pt-0"
                    key={item.id}
                  >
                    <div>
                      <p className="m-0 text-sm font-bold">{item.part.name}</p>
                      <p className="m-0 mt-1 text-xs text-[#68736f]">
                        {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(
                          new Date(item.performedAt),
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-black tabular-nums">
                      {item.quantity} {item.part.unit.toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-3">Frecuencia de reemplazo</p>
              <div className="grid gap-2">
                {result.summary.slice(0, 4).map(({ part, usageCount, totalQuantity }) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-lg bg-[#f4f5f1] px-3 py-2"
                    key={part.id}
                  >
                    <span className="text-sm font-bold">{part.name}</span>
                    <span className="flex items-center gap-2 text-xs font-black">
                      <AppTag
                        tone={
                          part.inventory?.stockState === 'OUT'
                            ? 'critical'
                            : part.inventory?.stockState === 'LOW'
                              ? 'warning'
                              : 'success'
                        }
                      >
                        {usageCount} usos
                      </AppTag>
                      <span>
                        {totalQuantity} {part.unit.toLowerCase()}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppPanel>
  );
}
