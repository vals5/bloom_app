import AppShell from "@/components/appshell";

/* Esqueleto que se ve mientras el feed carga o se cambia un filtro (en vez de quedar "colgado"). */
export default function FeedLoading() {
  return (
    <AppShell>
      <div className="h-36 border-b border-line md:h-32" aria-hidden="true" />
      <main className="grid flex-1 content-start gap-5 px-4 py-5 sm:grid-cols-2 md:px-6 lg:grid-cols-3" aria-busy="true" aria-label="Cargando publicaciones">
        {[0, 1, 2].map((i) => (
          <div key={i} className="overflow-hidden rounded-3xl bg-surface ring-1 ring-line motion-safe:animate-pulse">
            <div className="aspect-[4/3] bg-field" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-1/2 rounded bg-field" />
              <div className="h-4 w-2/3 rounded bg-field" />
              <div className="h-6 w-3/4 rounded-full bg-field" />
            </div>
          </div>
        ))}
      </main>
    </AppShell>
  );
}
