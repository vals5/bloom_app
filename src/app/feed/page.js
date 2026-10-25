import Link from "next/link";
import { PawPrint, SearchX, TriangleAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { STATUS_KEYS, PET_TYPES } from "@/lib/pets";
import AppShell from "@/components/appshell";
import FeedHeader from "@/components/feedheader";
import PetCard from "@/components/petcard";
import { Button } from "@/components/ui";

export const metadata = { title: "Inicio" };

const TYPE_KEYS = PET_TYPES.map((t) => t.value);
const PAGE_SIZE = 60;

export default async function FeedPage({ searchParams }) {
  const sp = await searchParams;

  // Validamos todo lo que viene de la URL antes de usarlo en la consulta
  const status = STATUS_KEYS.includes(sp.status) ? sp.status : "all";
  const type = TYPE_KEYS.includes(sp.type) ? sp.type : "all";
  const q = (typeof sp.q === "string" ? sp.q : "").replace(/[%,()*\\]/g, " ").trim().slice(0, 60);

  let query = supabase.from("pets").select("*").order("created_at", { ascending: false }).limit(PAGE_SIZE);
  if (status === "adoption") query = query.in("status", ["adoption", "adopt"]);
  else if (status !== "all") query = query.eq("status", status);
  if (type !== "all") query = query.eq("type", type);
  if (q) query = query.or(`name.ilike.%${q}%,location.ilike.%${q}%,breed.ilike.%${q}%`);

  const { data: pets, error } = await query;
  if (error) console.error("Error al traer mascotas de Supabase:", error.message);

  const hasFilters = status !== "all" || type !== "all" || q !== "";

  return (
    <AppShell>
      <FeedHeader status={status} type={type} q={q} />

      <main className="grid flex-1 content-start gap-5 px-4 py-5 sm:grid-cols-2 md:px-6 lg:grid-cols-3">
        {error ? (
          <EmptyState icon={TriangleAlert} title="No pudimos cargar las publicaciones">
            Revisá tu conexión y volvé a intentar.
            <Button href="/feed" variant="outline" size="sm" className="mt-4">
              Reintentar
            </Button>
          </EmptyState>
        ) : pets.length > 0 ? (
          pets.map((pet) => <PetCard key={pet.id} pet={pet} />)
        ) : hasFilters ? (
          <EmptyState icon={SearchX} title="No encontramos resultados">
            Probá con otra zona o sacá algún filtro.
            <Button href="/feed" variant="outline" size="sm" className="mt-4">
              Limpiar filtros
            </Button>
          </EmptyState>
        ) : (
          <EmptyState icon={PawPrint} title="Todavía no hay publicaciones">
            Sé la primera persona en ayudar a una mascota.
            <Button href="/create" size="sm" className="mt-4">
              Publicar ahora
            </Button>
          </EmptyState>
        )}
      </main>
    </AppShell>
  );
}

function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="col-span-full flex flex-col items-center px-6 py-16 text-center text-sm text-ink-soft">
      <Icon className="mb-3 h-10 w-10 text-muted/60" aria-hidden="true" />
      <h2 className="mb-1 text-base font-bold text-ink">{title}</h2>
      {children}
    </div>
  );
}
