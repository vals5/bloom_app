import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { statusMeta, formatPetDate, TRAITS } from "@/lib/pets";
import AppShell from "@/components/appshell";
import ContactButton from "@/components/contactbutton";
import FavoriteButton from "@/components/favoritebutton";
import { BackButton, ShareButton } from "@/components/detailactions";
import { StatusBadge, Tag, PhotoPlaceholder, typeLabel } from "@/components/petparts";

export default async function PetDetailsPage({ params }) {
  const { id } = await params;
  const { data: pet, error } = await supabase.from("pets").select("*").eq("id", id).maybeSingle();

  // id inválido o publicación borrada → 404 amable
  if (error || !pet) notFound();

  const meta = statusMeta(pet.status);
  const traits = TRAITS.filter((t) => pet[t.id]);
  const tags = [typeLabel(pet.type), pet.breed, pet.age, pet.gender, pet.size].filter(Boolean);

  return (
    <AppShell size="detail" bottomNav={false}>
      {/* Celular: foto arriba e info debajo. Tablet/escritorio: dos columnas. */}
      <div className="flex flex-1 flex-col md:grid md:flex-none md:grid-cols-2 md:items-start md:gap-8 md:px-6 md:py-6">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-field md:sticky md:top-6 md:aspect-[4/5] md:rounded-3xl">
          {pet.image_url ? (
            <Image src={pet.image_url} alt={`Foto de ${pet.name}`} fill priority sizes="(min-width: 768px) 448px, 100vw" className="object-cover" />
          ) : (
            <PhotoPlaceholder status={pet.status} />
          )}
          <BackButton className="absolute left-4 top-4" />
          <div className="absolute right-4 top-4 flex gap-2">
            <ShareButton title={`${pet.name} · Bloom`} text={`${meta?.label ?? ""}: ${pet.name} en ${pet.location}`} />
            <FavoriteButton id={pet.id} />
          </div>
        </div>

        <div className="flex flex-1 flex-col md:flex-none">
          <main className="flex-1 space-y-5 px-5 py-6 md:px-0 md:pt-0">
            <div className="space-y-2">
              <StatusBadge status={pet.status} />
              <div className="flex items-baseline justify-between gap-3">
                <h1 className="text-2xl font-bold text-ink">{pet.name}</h1>
                <span className="shrink-0 text-xs font-semibold text-muted">{formatPetDate(pet)}</span>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-ink-soft">
                <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {pet.location}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>

            {pet.description && (
              <section className="space-y-1.5">
                <h2 className="text-sm font-bold text-ink">Detalles</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{pet.description}</p>
              </section>
            )}

            {traits.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-sm font-bold text-ink">Salud y carácter</h2>
                <ul className="flex flex-wrap gap-2">
                  {traits.map((t) => (
                    <li key={t.id} className="inline-flex items-center gap-1.5 rounded-full bg-found/10 px-3 py-1 text-xs font-bold text-found">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      {t.label}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </main>

          {/* Celular: barra fija abajo. Tablet/escritorio: queda dentro de la columna. */}
          <footer className="pb-safe sticky bottom-0 z-30 border-t border-line bg-surface p-4 md:static md:border-0 md:bg-transparent md:p-0">
            <ContactButton
              ownerId={pet.user_id}
              cta={meta?.cta ?? "Contactar"}
              message={meta ? meta.waText(pet.name) : "¡Hola! Vi tu publicación en Bloom."}
              nextPath={`/pet-details/${pet.id}`}
            />
          </footer>
        </div>
      </div>
    </AppShell>
  );
}
