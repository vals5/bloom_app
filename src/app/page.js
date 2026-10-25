"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogoMark } from "@/components/ui";

/* Splash: muestra la marca ~1 s y manda a cada persona a donde corresponde
   (antes esperaba 3 s fijos y siempre iba a /login, aunque ya hubiera sesión). */
export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const minDelay = new Promise((resolve) => setTimeout(resolve, 1000));

    Promise.all([supabase.auth.getSession(), minDelay])
      .then(([{ data }]) => {
        if (!cancelled) router.replace(data.session ? "/feed" : "/login");
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="grid min-h-dvh place-items-center bg-bg">
      <div className="flex flex-col items-center motion-safe:animate-pulse">
        <LogoMark size="lg" />
        <h1 className="mt-4 text-3xl font-bold tracking-wide text-primary">Bloom</h1>
        <p className="mt-1 text-sm text-ink-soft">Mascotas en Mendoza</p>
      </div>
    </main>
  );
}
