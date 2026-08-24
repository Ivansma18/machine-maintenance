export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b border-[#dfe4df] px-5 py-5 sm:px-8 lg:px-10">
      <div>
        <p className="eyebrow">Production floor / all locations</p>
        <h1 className="mb-0 mt-2 text-2xl font-black tracking-[-0.04em] text-[#17211f] sm:text-3xl">
          Control room
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="m-0 text-sm font-bold text-[#17211f]">Operations</p>
          <p className="m-0 text-xs text-[#68736f]">Live maintenance view</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e7db] text-xs font-black text-[#365441]">
          OP
        </div>
      </div>
    </header>
  );
}
