import { PawPrint } from "lucide-react";
import { statusMeta, PET_TYPES } from "@/lib/pets";

/* Piezas visuales de una mascota, usadas en la card y en el detalle. */

export function StatusBadge({ status, className = "" }) {
  const meta = statusMeta(status);
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm ${meta.bg} ${className}`}>
      {meta.label}
    </span>
  );
}

export function Tag({ children }) {
  return <span className="rounded-full bg-field px-3 py-1 text-xs font-semibold text-ink-soft">{children}</span>;
}

/** Sin foto: fondo del color del estado + huella */
export function PhotoPlaceholder({ status }) {
  const tint = statusMeta(status)?.soft ?? "bg-field";
  return (
    <div className={`grid h-full w-full place-items-center ${tint}`}>
      <PawPrint className="h-14 w-14 text-muted/50" aria-hidden="true" />
    </div>
  );
}

export const typeLabel = (value) => PET_TYPES.find((t) => t.value === value)?.label;
