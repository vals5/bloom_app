"use client";

import { Download, Share } from "lucide-react";
import { promptInstall, useCanInstall, useIsIOS, useIsStandalone } from "@/lib/pwa";
import { Button } from "./ui";

/* Invitación a instalar Bloom. No aparece si ya está instalada ni si el navegador no permite instalar. */
export default function InstallCard() {
  const canInstall = useCanInstall();
  const isIOS = useIsIOS();
  const standalone = useIsStandalone();

  if (standalone || (!canInstall && !isIOS)) return null;

  return (
    <section className="max-w-md rounded-2xl bg-surface p-4 ring-1 ring-line">
      <h2 className="text-sm font-bold text-ink">Instalá Bloom en tu celular</h2>
      {canInstall ? (
        <>
          <p className="mt-1 text-sm text-ink-soft">Abrila desde tu pantalla de inicio, como cualquier app.</p>
          <Button size="sm" className="mt-3" onClick={promptInstall}>
            <Download className="h-4 w-4" aria-hidden="true" /> Instalar
          </Button>
        </>
      ) : (
        <p className="mt-1 text-sm text-ink-soft">
          Tocá <Share className="inline h-4 w-4 align-text-bottom text-primary" aria-label="Compartir" /> en Safari y elegí{" "}
          <strong>“Agregar a inicio”</strong>.
        </p>
      )}
    </section>
  );
}
