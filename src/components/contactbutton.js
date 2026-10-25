"use client";

import { useEffect, useState } from "react";
import { Lock, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth";
import { whatsappUrl } from "@/lib/pets";
import { Button } from "./ui";

/* El WhatsApp NO viaja en la publicación (que es pública): se pide aparte a la tabla `profiles`,
   que Supabase (RLS) solo responde a personas con sesión iniciada. */
export default function ContactButton({ ownerId, cta, message, nextPath }) {
  const { user, ready } = useSession();
  const userId = user?.id;
  const [contact, setContact] = useState({ phone: null, loading: true });

  useEffect(() => {
    if (!userId || !ownerId || userId === ownerId) return;
    let active = true;
    (async () => {
      const { data } = await supabase.from("profiles").select("whatsapp").eq("id", ownerId).maybeSingle();
      if (active) setContact({ phone: data?.whatsapp ?? null, loading: false });
    })();
    return () => {
      active = false;
    };
  }, [userId, ownerId]);

  if (!ready) return <Button disabled className="w-full">Cargando…</Button>;

  if (!user) {
    return (
      <div className="space-y-2">
        <Button href={`/login?next=${encodeURIComponent(nextPath)}`} className="w-full">
          <Lock className="h-4 w-4" aria-hidden="true" />
          Iniciá sesión para contactar
        </Button>
        <p className="text-center text-xs text-ink-soft">Por seguridad, el contacto solo lo ven personas con cuenta.</p>
      </div>
    );
  }

  if (!ownerId) return <Note>Esta publicación no tiene datos de contacto.</Note>;
  if (userId === ownerId) return <Note>Esta es tu publicación.</Note>;
  if (contact.loading) return <Button disabled className="w-full">Cargando contacto…</Button>;

  const url = contact.phone ? whatsappUrl(contact.phone, message) : null;
  if (!url) return <Note>Esta persona no dejó un número de contacto.</Note>;

  return (
    <Button href={url} target="_blank" rel="noopener noreferrer" className="w-full">
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      {cta} · WhatsApp
    </Button>
  );
}

function Note({ children }) {
  return <p className="py-2 text-center text-sm text-ink-soft">{children}</p>;
}
