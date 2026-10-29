"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Check, ChevronLeft, ImagePlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRequireUser } from "@/lib/auth";
import { uploadPetPhoto, removePetPhoto, MAX_PHOTO_MB } from "@/lib/photos";
import { STATUS, STATUS_KEYS, PET_TYPES, BREEDS, GENDERS, SIZES, AGES, TRAITS, ZONES } from "@/lib/pets";
import AppShell from "@/components/appshell";
import { Alert, Button, Chip, Field, SelectField, TextArea } from "@/components/ui";

const STEP_TITLES = ["Tipo y foto", "Datos de la mascota", "Salud y carácter"];

const INITIAL = {
  status: "",
  type: "perro",
  name: "",
  breed: BREEDS.perro[0],
  age: "Adulto",
  gender: "Macho",
  size: "Mediano",
  location: "",
  description: "",
  vaccinated: false,
  neutered: false,
  good_with_kids: false,
  house_trained: false,
};

export default function CreatePage() {
  const router = useRouter();
  const { user, ready } = useRequireUser();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL);
  const [photo, setPhoto] = useState(null); // { file, preview }
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Liberar la vista previa cuando cambia o se desmonta
  const preview = photo?.preview;
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  // Las publicaciones de adopción tienen un paso extra (salud y carácter)
  const isAdoption = form.status === "adoption";
  const totalSteps = isAdoption ? 3 : 2;
  const meta = STATUS[form.status];

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const setType = (type) => setForm((f) => ({ ...f, type, breed: BREEDS[type][0] }));

  const onPickPhoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("El archivo tiene que ser una imagen.");
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) return setError(`La foto no puede pesar más de ${MAX_PHOTO_MB} MB.`);
    setError("");
    setPhoto({ file, preview: URL.createObjectURL(file) });
  };

  const validate = () => {
    if (step === 1) {
      if (!form.status) return "Elegí qué pasó con la mascota.";
      if (!photo) return "Subí una foto para poder continuar.";
    }
    if (step === 2 && !form.location.trim()) return "Indicá la zona para que puedan ubicarla.";
    return "";
  };

  const goBack = () => {
    setError("");
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const publish = async () => {
    setLoading(true);
    let photoUrl = null;
    try {
      photoUrl = await uploadPetPhoto(photo.file, user.id);

      const { data, error: insertError } = await supabase
        .from("pets")
        .insert({
          user_id: user.id,
          status: form.status,
          type: form.type,
          name: form.name.trim() || "Sin nombre",
          breed: form.breed,
          age: form.age,
          gender: form.gender,
          size: form.size,
          location: form.location.trim(),
          description: form.description.trim() || null,
          // los rasgos solo aplican a adopciones
          ...Object.fromEntries(TRAITS.map((t) => [t.id, isAdoption && form[t.id]])),
          image_url: photoUrl,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;
      router.replace(`/pet-details/${data.id}`);
    } catch (err) {
      if (photoUrl) removePetPhoto(photoUrl); // no dejar fotos huérfanas
      console.error("Error al publicar:", err);
      setError(
        err?.message === "daily_limit"
          ? "Llegaste al máximo de 10 publicaciones por día. Probá de nuevo mañana."
          : "No pudimos publicar. Revisá tu conexión y probá de nuevo."
      );
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);
    setError("");
    if (step < totalSteps) setStep(step + 1);
    else publish();
  };

  if (!ready || !user) return <AppShell size="form" bottomNav={false}><div className="flex-1" /></AppShell>;

  return (
    <AppShell size="form" bottomNav={false}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col">
        {/* Encabezado + progreso */}
        <header className="sticky top-0 z-30 space-y-3 border-b border-line bg-bg/95 px-4 pb-3 pt-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <button type="button" onClick={goBack} className="flex h-10 items-center gap-1 pr-3 text-sm font-bold text-ink-soft">
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              {step > 1 ? "Atrás" : "Cancelar"}
            </button>
            <p className="text-xs font-bold text-muted">
              Paso {step} de {totalSteps} · {STEP_TITLES[step - 1]}
            </p>
          </div>
          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-valuenow={step}
            className="h-1.5 w-full overflow-hidden rounded-full bg-line"
          >
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </header>

        <main className="flex-1 space-y-6 px-5 py-6">
          {error && <Alert>{error}</Alert>}

          {/* ───── Paso 1: qué pasó + foto ───── */}
          {step === 1 && (
            <>
              <section className="space-y-3">
                <h1 className="text-2xl font-bold text-ink">¿Qué querés publicar?</h1>
                <div className="space-y-2.5">
                  {STATUS_KEYS.map((key) => {
                    const s = STATUS[key];
                    const selected = form.status === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => set("status", key)}
                        className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                          selected ? `${s.border} ${s.soft}` : "border-line bg-surface hover:bg-field"
                        }`}
                      >
                        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${s.bg} text-white`}>
                          <s.icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-bold text-ink">{s.label}</span>
                          <span className="block text-xs text-ink-soft">{s.pick}</span>
                        </span>
                        {selected && <Check className={`h-5 w-5 ${s.fg}`} aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-2">
                <h2 className="text-sm font-bold text-ink">Foto</h2>
                <label
                  htmlFor="pet-photo"
                  className="relative flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border-2 border-dashed border-line bg-surface transition focus-within:ring-2 focus-within:ring-primary hover:bg-field"
                >
                  {photo ? (
                    <>
                      <Image src={photo.preview} alt="Vista previa de la foto" fill unoptimized className="object-cover" />
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-bold text-ink shadow-sm">
                        <ImagePlus className="h-4 w-4" aria-hidden="true" /> Cambiar foto
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                        <Camera className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-bold text-ink">Tocá para subir una foto</span>
                      <span className="px-6 text-center text-xs text-ink-soft">Una foto clara y de frente ayuda a reconocerla.</span>
                    </>
                  )}
                  <input id="pet-photo" type="file" accept="image/*" onChange={onPickPhoto} className="sr-only" />
                </label>
              </section>
            </>
          )}

          {/* ───── Paso 2: datos ───── */}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-ink">Contanos sobre la mascota</h1>

              <div className="space-y-4">
                <div>
                  <p className="mb-1.5 text-sm font-bold text-ink">¿Qué es?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {PET_TYPES.map((t) => (
                      <Chip key={t.value} icon={t.icon} active={form.type === t.value} onClick={() => setType(t.value)} className="justify-center">
                        {t.label}
                      </Chip>
                    ))}
                  </div>
                </div>

                <Field
                  label="Nombre"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Ej: Rocco"
                  hint="Dejalo vacío si no lo sabés."
                />

                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="Raza" options={BREEDS[form.type]} value={form.breed} onChange={(e) => set("breed", e.target.value)} />
                  <SelectField label="Edad" options={AGES} value={form.age} onChange={(e) => set("age", e.target.value)} />
                  <SelectField label="Sexo" options={GENDERS} value={form.gender} onChange={(e) => set("gender", e.target.value)} />
                  <SelectField label="Tamaño" options={SIZES} value={form.size} onChange={(e) => set("size", e.target.value)} />
                </div>

                <div>
                  <Field
                    label={meta.where}
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    list="zones"
                    placeholder="Ej: Barrio Bombal, Godoy Cruz"
                    autoComplete="off"
                  />
                  <datalist id="zones">
                    {ZONES.map((z) => (
                      <option key={z} value={z} />
                    ))}
                  </datalist>
                </div>

                <TextArea
                  label="Detalles (opcional)"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  maxLength={400}
                  placeholder={meta.descHint}
                />
              </div>
            </>
          )}

          {/* ───── Paso 3: salud (solo adopción) ───── */}
          {step === 3 && (
            <>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-ink">Salud y carácter</h1>
                <p className="text-sm text-ink-soft">Marcá lo que corresponda. Ayuda a encontrarle el hogar ideal.</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {TRAITS.map((t) => (
                  <Chip key={t.id} active={form[t.id]} icon={form[t.id] ? Check : undefined} onClick={() => set(t.id, !form[t.id])}>
                    {t.label}
                  </Chip>
                ))}
              </div>
            </>
          )}
        </main>

        <footer className="pb-safe sticky bottom-0 z-30 border-t border-line bg-surface p-4">
          <Button type="submit" loading={loading} className="w-full">
            {step < totalSteps ? "Siguiente" : loading ? "Publicando…" : "Publicar"}
          </Button>
        </footer>
      </form>
    </AppShell>
  );
}
