"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Plus, User } from "lucide-react";

// Solo rutas que existen. (Antes había "Buscar" → /search, que daba 404: la búsqueda ahora vive en el feed.)
const ITEMS = [
  { href: "/feed", label: "Inicio", icon: House, also: ["/pet-details"] },
  { href: "/create", label: "Publicar", icon: Plus, primary: true },
  { href: "/profile", label: "Perfil", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal" className="pb-safe sticky bottom-0 z-40 border-t border-line bg-surface md:hidden">
      <ul className="flex h-16 items-center justify-around px-2">
        {ITEMS.map(({ href, label, icon: Icon, primary, also = [] }) => {
          const active = [href, ...also].some((p) => pathname === p || pathname.startsWith(`${p}/`));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-16 flex-col items-center gap-0.5 py-1 text-[11px] font-bold transition-colors ${
                  active ? "text-primary" : "text-muted hover:text-ink"
                }`}
              >
                {primary ? (
                  <span className="grid h-8 w-12 place-items-center rounded-full bg-primary text-white shadow-sm">
                    <Icon className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                ) : (
                  <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
                )}
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
