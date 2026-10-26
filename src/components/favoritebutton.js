"use client";

import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toggleFavorite, useFavorite } from "@/lib/favorites";

export default function FavoriteButton({ id, className = "" }) {
  const router = useRouter();
  const pathname = usePathname();
  const isFavorite = useFavorite(id);

  const handleClick = async () => {
    const result = await toggleFavorite(id);
    // Guardar requiere cuenta: lo mandamos a iniciar sesión y vuelve a esta página
    if (result === "login") router.push(`/login?next=${encodeURIComponent(pathname)}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Quitar de guardados" : "Guardar"}
      className={`grid h-11 w-11 place-items-center rounded-full bg-surface/90 shadow-sm backdrop-blur transition active:scale-95 ${className}`}
    >
      <Heart className={`h-5 w-5 transition-colors ${isFavorite ? "fill-lost text-lost" : "text-ink"}`} />
    </button>
  );
}
