export function DashboardSkeleton() {
  return (
    <div className="grid animate-pulse gap-5">
      <div className="h-64 rounded-2xl bg-[#e8ece8]" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div className="h-32 rounded-2xl bg-[#e8ece8]" key={item} />
        ))}
      </div>
    </div>
  );
}

export function EmptyDashboard() {
  return (
    <div className="rounded-2xl border border-dashed border-[#bfc9c1] bg-white p-10 text-center">
      <p className="m-0 text-lg font-black text-[#17211f]">Aun no hay datos operativos</p>
      <p className="mx-auto mb-0 mt-2 max-w-md text-sm leading-6 text-[#68736f]">
        Agrega maquinas y planes de mantenimiento para convertir este espacio en una vista viva de
        la planta de produccion.
      </p>
    </div>
  );
}
