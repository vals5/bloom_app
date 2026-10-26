"use client";

import { useSyncExternalStore } from "react";

/* Todo lo de "app instalable" en un solo lugar:
   registro del service worker + captura del aviso de instalación del navegador. */

let deferredPrompt = null; // evento beforeinstallprompt guardado para mostrarlo cuando la persona toque "Instalar"
let started = false;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

/** Se llama una sola vez al abrir la app (desde PwaRegister, en el layout). */
export function initPwa() {
  if (started || typeof window === "undefined") return;
  started = true;

  // Chrome/Edge/Android avisan una sola vez y temprano: lo guardamos para usarlo después
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    emit();
  });

  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
}

export function useCanInstall() {
  return useSyncExternalStore(subscribe, () => deferredPrompt !== null, () => false);
}

export async function promptInstall() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  emit();
}

/** true si la app ya está abierta como app instalada (sin barra del navegador) */
export function useIsStandalone() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(display-mode: standalone)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true,
    () => false
  );
}

/** iPhone/iPad no tienen botón "Instalar": hay que explicar el paso manual */
export function useIsIOS() {
  return useSyncExternalStore(
    () => () => {},
    () => /iphone|ipad|ipod/i.test(window.navigator.userAgent),
    () => false
  );
}
