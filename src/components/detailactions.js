"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Share2 } from "lucide-react";

const roundBtn =
  "grid h-11 w-11 place-items-center rounded-full bg-surface/90 shadow-sm backdrop-blur transition active:scale-95";

/** Vuelve a la pantalla anterior (conserva filtros del feed); si no hay historial, va al feed. */
export function BackButton({ className = "" }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Volver"
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/feed"))}
      className={`${roundBtn} ${className}`}
    >
      <ChevronLeft className="h-5 w-5 text-ink" />
    </button>
  );
}

/** Compartir es clave para una mascota perdida: usa el menú nativo del celular. */
export function ShareButton({ title, text, className = "" }) {
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, text, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* la persona canceló el menú de compartir */
    }
  };
  return (
    <button type="button" aria-label="Compartir" onClick={share} className={`${roundBtn} ${className}`}>
      <Share2 className="h-5 w-5 text-ink" />
    </button>
  );
}
