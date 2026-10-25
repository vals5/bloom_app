"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Button, LogoMark } from "./ui";

/* Navegación de tablet/escritorio (en celular se usa la barra de abajo). */
const LINKS = [
  { href: "/feed", label: "Inicio", also: ["/pet-details"] },
  { href: "/profile", label: "Perfil" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="hidden items-center justify-between px-6 pt-6 md:flex">
      <Link href="/feed" className="flex items-center gap-2" aria-label="Bloom, ir al inicio">
        <LogoMark />
        <span className="text-xl font-bold text-primary">Bloom</span>
      </Link>

      <nav aria-label="Principal" className="flex items-center gap-1">
        {LINKS.map(({ href, label, also = [] }) => {
          const active = [href, ...also].some((p) => pathname === p || pathname.startsWith(`${p}/`));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                active ? "bg-primary/10 text-primary" : "text-ink-soft hover:bg-surface"
              }`}
            >
              {label}
            </Link>
          );
        })}
        <Button href="/create" size="sm" className="ml-2">
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          Publicar
        </Button>
      </nav>
    </header>
  );
}
