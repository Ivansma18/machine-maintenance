type OperationsSidebarProps = { activeHref: string };

const navigation = [
  { href: '/', label: 'Resumen' },
  { href: '/machines', label: 'Maquinas' },
  { href: '/maintenance-plans', label: 'Planes preventivos' },
  { href: '/work-orders', label: 'Ordenes de trabajo' },
  { href: '/maintenance-calendar', label: 'Agenda' },
  { href: '/maintenance-metrics', label: 'Reincidencia' },
  { href: '/audit', label: 'Auditoría' },
  { href: '/users', label: 'Usuarios' },
  { href: '/maintenance-logs', label: 'Historial' },
  { href: '/notifications', label: 'Alertas' },
];

export function OperationsSidebar({ activeHref }: OperationsSidebarProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#dfe4df] bg-[#eef1ec] px-6 py-7 lg:flex">
        <div className="mb-14 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#17211f] text-sm font-black text-[#f2b84b]">
            P
          </div>
          <div>
            <p className="m-0 text-sm font-black tracking-[0.18em] text-[#17211f]">PANTRY</p>
            <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#68736f]">
              Sistema de mantenimiento
            </p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2" aria-label="Navegacion principal">
          <p className="eyebrow mb-2 px-3">Espacio de trabajo</p>
          {navigation.map((item) => (
            <NavigationLink activeHref={activeHref} item={item} key={item.href} />
          ))}
        </nav>
        <div className="rounded-xl border border-[#dfe4df] bg-white p-4">
          <p className="eyebrow">Estado del sistema</p>
          <p className="mb-3 mt-2 text-sm font-bold text-[#17211f]">Operaciones conectadas</p>
          <div className="flex items-center gap-2 text-xs text-[#68736f]">
            <span className="h-2 w-2 rounded-full bg-[#668875]" /> API en vivo
          </div>
        </div>
      </aside>
      <nav
        className="flex w-full gap-2 overflow-x-auto border-b border-[#dfe4df] bg-[#eef1ec] px-4 py-3 lg:hidden"
        aria-label="Navegacion principal mobile"
      >
        {navigation.map((item) => (
          <NavigationLink activeHref={activeHref} item={item} key={item.href} />
        ))}
      </nav>
    </>
  );
}

function NavigationLink({
  activeHref,
  item,
}: {
  activeHref: string;
  item: { href: string; label: string };
}) {
  return (
    <a
      className={
        item.href === activeHref
          ? 'shrink-0 rounded-lg bg-[#17211f] px-3 py-2.5 text-sm font-bold text-white'
          : 'shrink-0 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#68736f] transition-colors hover:bg-white hover:text-[#17211f]'
      }
      href={item.href}
    >
      {item.label}
    </a>
  );
}
