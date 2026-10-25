import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { formatPetDate } from "@/lib/pets";
import FavoriteButton from "./favoritebutton";
import { StatusBadge, Tag, PhotoPlaceholder, typeLabel } from "./petparts";

/* La card entera es un link al detalle. El corazón va como "hermano" del link
   (un botón dentro de un <a> es HTML inválido y rompe el teclado/lectores de pantalla). */
export default function PetCard({ pet, footer }) {
  return (
    <article className="relative flex flex-col overflow-hidden rounded-3xl bg-surface shadow-sm ring-1 ring-line">
      <Link href={`/pet-details/${pet.id}`} className="block">
        <div className="relative aspect-[4/3] w-full bg-field">
          {pet.image_url ? (
            <Image
              src={pet.image_url}
              alt={`Foto de ${pet.name}`}
              fill
              sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <PhotoPlaceholder status={pet.status} />
          )}
          <StatusBadge status={pet.status} className="absolute left-3 top-3" />
        </div>

        <div className="space-y-2.5 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="truncate text-lg font-bold text-ink">{pet.name}</h3>
            <span className="shrink-0 text-xs font-semibold text-muted">{formatPetDate(pet)}</span>
          </div>

          <p className="flex items-center gap-1.5 text-sm text-ink-soft">
            <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{pet.location}</span>
          </p>

          <div className="flex flex-wrap gap-2">
            {[typeLabel(pet.type), pet.gender, pet.size].filter(Boolean).map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
      </Link>

      <FavoriteButton id={pet.id} className="absolute right-3 top-3" />
      {footer && <div className="border-t border-line p-3">{footer}</div>}
    </article>
  );
}
