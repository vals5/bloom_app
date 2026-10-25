"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase";

/** Sesión actual: { user, ready }. `ready` pasa a true cuando ya sabemos si hay sesión. */
export function useSession() {
  const [state, setState] = useState({ user: null, ready: false });

  useEffect(() => {
    let active = true;
    const set = (session) => active && setState({ user: session?.user ?? null, ready: true });

    supabase.auth.getSession().then(({ data }) => set(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => set(session));

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}

/** Igual que useSession, pero manda a /login si no hay sesión. */
export function useRequireUser() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.ready && !session.user) router.replace("/login");
  }, [session, router]);

  return session;
}

/** Traduce los errores de Supabase Auth a mensajes claros para la persona. */
export function authErrorMessage(error) {
  const msg = (error?.message ?? "").toLowerCase();
  if (msg.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (msg.includes("email not confirmed")) return "Todavía no confirmaste tu correo. Revisá tu bandeja de entrada.";
  if (msg.includes("already registered")) return "Ya existe una cuenta con ese correo. Probá iniciar sesión.";
  if (msg.includes("different from the old")) return "La nueva contraseña tiene que ser distinta a la anterior.";
  if (msg.includes("at least")) return "La contraseña debe tener al menos 6 caracteres.";
  if (msg.includes("rate limit") || msg.includes("too many")) return "Demasiados intentos. Esperá unos minutos y probá de nuevo.";
  if (msg.includes("fetch") || msg.includes("network")) return "No pudimos conectarnos. Revisá tu conexión a internet.";
  return "Algo salió mal. Probá de nuevo en un momento.";
}
