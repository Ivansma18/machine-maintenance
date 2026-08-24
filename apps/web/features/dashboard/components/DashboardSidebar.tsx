export function DashboardSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#dfe4df] bg-[#eef1ec] px-6 py-7 lg:flex">
      <div className="mb-14 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#17211f] text-sm font-black text-[#f2b84b]">
          P
        </div>
        <div>
          <p className="m-0 text-sm font-black tracking-[0.18em] text-[#17211f]">PANTRY</p>
          <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#68736f]">
            Maintenance OS
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2" aria-label="Main navigation">
        <p className="eyebrow mb-2 px-3">Workspace</p>
        <a
          className="rounded-lg bg-[#17211f] px-3 py-2.5 text-sm font-bold text-white"
          href="#overview"
        >
          Overview
        </a>
        <a
          className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#68736f] transition-colors hover:bg-white hover:text-[#17211f]"
          href="#machines"
        >
          Machines
        </a>
        <a
          className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#68736f] transition-colors hover:bg-white hover:text-[#17211f]"
          href="#schedule"
        >
          Maintenance plan
        </a>
        <a
          className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#68736f] transition-colors hover:bg-white hover:text-[#17211f]"
          href="#alerts"
        >
          Alerts
        </a>
      </nav>

      <div className="rounded-xl border border-[#dfe4df] bg-white p-4">
        <p className="eyebrow">System pulse</p>
        <p className="mb-3 mt-2 text-sm font-bold text-[#17211f]">Operations connected</p>
        <div className="flex items-center gap-2 text-xs text-[#68736f]">
          <span className="h-2 w-2 rounded-full bg-[#668875]" /> Live API summary
        </div>
      </div>
    </aside>
  );
}
