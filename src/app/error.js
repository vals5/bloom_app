"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui";

/* Si algo falla inesperadamente, la persona ve esto en vez de una pantalla en blanco. */
export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <TriangleAlert className="mb-3 h-12 w-12 text-lost" aria-hidden="true" />
      <h1 className="text-xl font-bold text-ink">Algo salió mal</h1>
      <p className="mt-1 text-sm text-ink-soft">No pudimos cargar esta pantalla. Probá de nuevo.</p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Reintentar</Button>
        <Button href="/feed" variant="outline">
          Ir al inicio
        </Button>
      </div>
    </main>
  );
}
