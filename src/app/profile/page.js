"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, PawPrint, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRequireUser } from "@/lib/auth";
import { cleanPhone, isValidLocalPhone } from "@/lib/pets";
import { removePetPhoto } from "@/lib/photos";
import AppShell from "@/components/appshell";
import InstallCard from "@/components/installcard";
import PetCard from "@/components/petcard";
import { Alert, Button, Chip, Field } from "@/components/ui";

export default function ProfilePage() {
  const router = useRouter();
  const { user, ready } = useRequireUser();
  const userId = user?.id;

  const [profile, setProfile] = useState({ full_name: "", whatsapp: "" });
  const [editing, setEditing] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  const [tab, setTab] = useState("mine");
  const [mine, setMine] = useState({ items: [], error: false });
  const [saved, setSaved] = useState({ items: [], error: false });
  const [loadingPets, setLoadingPets] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      const [p, m, s] = await Promise.all([
        supabase.from("profiles").select("full_name, whatsapp").eq("id", userId).maybeSingle(),
        supabase.from("pets").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        // guardados de la cuenta, con los datos de cada mascota
        supabase.from("favorites").select("created_at, pet:pets(*)").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      if (p.data) setProfile({ full_name: p.data.full_name ?? "", whatsapp: p.data.whatsapp ?? "" });
      setMine({ items: m.data ?? [], error: !!m.error });
      setSaved({ items: (s.data ?? []).map((r) => r.pet).filter(Boolean), error: !!s.error });
      setLoadingPets(false);
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const startEditPhone = () => {
    setPhoneDraft(profile.whatsapp);
    setPhoneError("");
    setEditing(true);
  };

  const savePhone = async (e) => {
    e.preventDefault();
    if (!isValidLocalPhone(phoneDraft)) {
      return setPhoneError("Tiene que tener 10 dígitos: código de área sin 0 + número sin 15. Ej: 2615555555.");
    }
    setSavingPhone(true);
    setPhoneError("");
    const whatsapp = cleanPhone(phoneDraft);
    const { error } = await supabase.from("profiles").upsert({ id: userId, whatsapp });
    setSavingPhone(false);

    if (error) return setPhoneError("No pudimos guardar el número. Probá de nuevo.");
    setProfile((p) => ({ ...p, whatsapp }));
    setEditing(false);
  };

  const handleDelete = async (pet) => {
    setDeleting(true);
    setActionError("");
    // .select() devuelve las filas borradas: si viene vacío, la base (RLS) no lo permitió
    const { data, error } = await supabase.from("pets").delete().eq("id", pet.id).select("id");
    setDeleting(false);

    if (error || !data?.length) {
      setActionError("No pudimos eliminar la publicación. Probá de nuevo.");
      return;
    }
    removePetPhoto(pet.image_url);
    setMine((m) => ({ ...m, items: m.items.filter((p) => p.id !== pet.id) }));
    setConfirmId(null);
  };

  if (!ready || !user) return <AppShell><div className="flex-1" /></AppShell>;

  const name = profile.full_name || user.user_metadata?.full_name || "Mi cuenta";
  const current = tab === "mine" ? mine : saved;

  return (
    <AppShell>
      <header className="space-y-4 border-b border-line px-5 pb-5 pt-8 md:px-6 md:pt-6">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-2xl font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-ink">{name}</h1>
            <p className="truncate text-sm text-ink-soft">{user.email}</p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={savePhone} className="max-w-sm space-y-3">
            {phoneError && <Alert>{phoneError}</Alert>}
            <Field
              label="WhatsApp"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value)}
              placeholder="2615555555"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={savingPhone}>
                Guardar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-ink-soft">
              WhatsApp: <span className="font-bold text-ink">{profile.whatsapp || "sin cargar"}</span>
            </p>
            <Button variant="outline" size="sm" onClick={startEditPhone}>
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Editar
            </Button>
          </div>
        )}

        <InstallCard />

        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" aria-hidden="true" /> Cerrar sesión
        </Button>
      </header>

      <main className="grid flex-1 content-start gap-5 px-4 py-5 sm:grid-cols-2 md:px-6 lg:grid-cols-3">
        <div className="col-span-full flex gap-2">
          <Chip active={tab === "mine"} onClick={() => setTab("mine")}>
            Mis publicaciones
          </Chip>
          <Chip active={tab === "saved"} onClick={() => setTab("saved")}>
            Guardadas
          </Chip>
        </div>

        {actionError && (
          <div className="col-span-full">
            <Alert>{actionError}</Alert>
          </div>
        )}

        {loadingPets ? (
          <p className="col-span-full py-12 text-center text-sm text-ink-soft">Cargando…</p>
        ) : current.error ? (
          <div className="col-span-full">
            <Alert>No pudimos cargar esta lista. Probá de nuevo más tarde.</Alert>
          </div>
        ) : current.items.length === 0 ? (
          <div className="col-span-full flex flex-col items-center px-6 py-14 text-center text-sm text-ink-soft">
            <PawPrint className="mb-3 h-10 w-10 text-muted/60" aria-hidden="true" />
            {tab === "mine" ? (
              <>
                <p className="mb-4">Todavía no publicaste nada.</p>
                <Button href="/create" size="sm">
                  Publicar una mascota
                </Button>
              </>
            ) : (
              <p>Tocá el corazón en una publicación para guardarla. Se guarda en tu cuenta.</p>
            )}
          </div>
        ) : (
          current.items.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              footer={
                tab === "mine" &&
                (confirmId === pet.id ? (
                  <div className="flex items-center gap-2">
                    <Button variant="danger" size="sm" loading={deleting} onClick={() => handleDelete(pet)}>
                      Sí, eliminar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setConfirmId(null)}>
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setConfirmId(pet.id)}>
                    Eliminar publicación
                  </Button>
                ))
              }
            />
          ))
        )}
      </main>
    </AppShell>
  );
}
