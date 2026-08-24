import { AppPanel } from '@/components/ui/AppPanel';
import { AppTag } from '@/components/ui/AppTag';

export function UrgentLanePanel({ count }: { count: number }) {
  return (
    <AppPanel className="border-[#d95b4f]" title="Urgent lane" eyebrow="Requires attention">
      <div className="flex h-full min-h-[220px] flex-col justify-between bg-[#fff7f5] p-6">
        <div>
          <p className="m-0 text-5xl font-black tracking-[-0.08em] text-[#d95b4f]">{count}</p>
          <p className="mt-2 text-sm font-bold text-[#8e2f28]">open urgent alerts</p>
        </div>
        <div className="mt-8 flex items-center justify-between gap-3">
          <span className="text-xs leading-5 text-[#a65a52]">
            Critical issues stay visible until resolved.
          </span>
          <AppTag tone={count ? 'critical' : 'success'}>{count ? 'Action needed' : 'Clear'}</AppTag>
        </div>
      </div>
    </AppPanel>
  );
}
