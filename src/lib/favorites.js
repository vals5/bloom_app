"use client";

import { useSyncExternalStore } from "react";
import { supabase } from "./supabase";

/* Favoritos guardados en la CUENTA (tabla `favorites`), así aparecen en cualquier dispositivo.
   Se cargan una sola vez por sesión y se comparten entre todos los corazones de la pantalla.
   Al tocar el corazón se actualiza al instante y se sincroniza con Supabase; si falla, se revierte. */

let ids = new Set(); // ids de mascotas guardadas (como texto, sirva uuid o número)
let currentUser = null;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

async function load(userId) {
  const { data, error } = await supabase.from("favorites").select("pet_id").eq("user_id", userId);
  if (currentUser !== userId || error) return; // cambió la sesión mientras cargaba
  ids = new Set((data ?? []).map((r) => String(r.pet_id)));
  emit();
}

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((_event, session) => {
    const uid = session?.user?.id ?? null;
    if (uid === currentUser) return;
    currentUser = uid;
    ids = new Set();
    emit();
    // fuera del callback: supabase-js recomienda no hacer llamadas a la API dentro de él
    if (uid) setTimeout(() => load(uid), 0);
  });
}

function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function useFavorite(id) {
  return useSyncExternalStore(
    subscribe,
    () => ids.has(String(id)),
    () => false
  );
}

/** Devuelve "ok", "login" (no hay sesión) o "error". */
export async function toggleFavorite(id) {
  if (!currentUser) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return "login";
    currentUser = data.session.user.id;
  }

  const key = String(id);
  const previous = ids;
  const had = ids.has(key);

  ids = new Set(ids);
  if (had) ids.delete(key);
  else ids.add(key);
  emit(); // actualización optimista

  const { error } = had
    ? await supabase.from("favorites").delete().eq("user_id", currentUser).eq("pet_id", id)
    : await supabase.from("favorites").insert({ user_id: currentUser, pet_id: id });

  if (error) {
    ids = previous;
    emit();
    return "error";
  }
  return "ok";
}
