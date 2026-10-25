import Link from "next/link";
import { Search, User } from "lucide-react";
import { STATUS, STATUS_KEYS, PET_TYPES } from "@/lib/pets";
import { Chip, LogoMark } from "./ui";

/* Header del feed. Los filtros viven en la URL (?status=lost&type=perro&q=godoy), así:
   - el servidor filtra de verdad (antes los botones eran decorativos),
   - se puede compartir/guardar un filtro y el botón "atrás" funciona.
   No necesita estado ni JS: son links y un form GET. */

function href(current, patch) {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();
  if (next.status !== "all") params.set("status", next.status);
  if (next.type !== "all") params.set("type", next.type);
  if (next.q) params.set("q", next.q);
  const qs = params.toString();
  return qs ? `/feed?${qs}` : "/feed";
}

export default function FeedHeader({ status, type, q }) {
  const current = { status, type, q };
  const tabs = [{ key: "all", label: "Todos" }, ...STATUS_KEYS.map((k) => ({ key: k, label: STATUS[k].tab, dot: STATUS[k].dot }))];

  return (
    <header className="sticky top-0 z-30 space-y-2.5 border-b border-line bg-bg/95 px-4 pb-2.5 pt-3 backdrop-blur md:space-y-3 md:px-6 md:pb-3 md:pt-4">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="flex shrink-0 items-center gap-2 md:hidden" aria-label="Bloom, ir al inicio">
          <LogoMark />
          <span className="text-xl font-bold text-primary">Bloom</span>
        </Link>

        <form action="/feed" role="search" className="relative min-w-0 flex-1 md:max-w-md">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          {type !== "all" && <input type="hidden" name="type" value={type} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            key={q}
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Buscar"
            aria-label="Buscar publicaciones"
            className="h-10 w-full rounded-full border border-line bg-surface pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </form>

        <Link href="/profile" aria-label="Mi perfil" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface text-primary ring-1 ring-line md:hidden">
          <User className="h-5 w-5" />
        </Link>
      </div>

      <div className="space-y-3 md:flex md:items-center md:gap-4 md:space-y-0">
      {/* Estado */}
      <nav aria-label="Tipo de publicación" className="flex rounded-2xl bg-surface p-1 ring-1 ring-line md:min-w-[26rem]">
        {tabs.map((t) => {
          const active = status === t.key;
          return (
            <Link
              key={t.key}
              href={href(current, { status: t.key })}
              scroll={false}
              aria-current={active ? "true" : undefined}
              className={`flex min-w-0 flex-1 basis-0 items-center justify-center gap-1 rounded-xl px-0.5 py-2.5 text-xs font-bold transition-colors max-[379px]:text-[11px] ${
                active ? "bg-primary text-white" : "text-ink-soft hover:bg-field"
              }`}
            >
              {t.dot && <span className={`hidden h-2 w-2 shrink-0 rounded-full min-[380px]:block ${active ? "bg-white" : t.dot}`} aria-hidden="true" />}
              {t.label}
            </Link>
          );
        })}
      </nav>

      {/* Especie */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <Chip href={href(current, { type: "all" })} active={type === "all"}>
          Perros y gatos
        </Chip>
        {PET_TYPES.map((t) => (
          <Chip key={t.value} href={href(current, { type: t.value })} active={type === t.value} icon={t.icon}>
            {t.plural}
          </Chip>
        ))}
      </div>
      </div>
    </header>
  );
}
