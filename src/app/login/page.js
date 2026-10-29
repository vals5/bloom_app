"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { authErrorMessage, getSafeNext, useSession } from "@/lib/auth";
import AuthShell from "@/components/authshell";
import { Alert, Button, Field, LogoMark } from "@/components/ui";
import PasswordField from "@/components/passwordfield";

/* Esta es la PRIMERA pantalla de la app: la ruta "/" muestra este mismo componente. */
export default function LoginPage() {
  const router = useRouter();
  const { user, ready } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Si ya hay una sesión abierta (por ejemplo al abrir la app instalada), no pedimos el login de nuevo
  useEffect(() => {
    if (ready && user) router.replace(getSafeNext() ?? "/feed");
  }, [ready, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (error) {
      setErrorMsg(authErrorMessage(error));
      setLoading(false);
      return;
    }
    // Si venía de una página que pedía iniciar sesión (?next=/pet-details/…), vuelve ahí
    router.replace(getSafeNext() ?? "/feed");
  };

  if (ready && user) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <span className="motion-safe:animate-pulse">
          <LogoMark size="lg" />
        </span>
      </main>
    );
  }

  return (
    <AuthShell
      title="Te damos la bienvenida"
      subtitle="Ingresá para publicar y contactar a otras personas."
      footer={
        <div className="space-y-3">
          <p>¿Primera vez en Bloom?</p>
          <Button href="/register" variant="outline" className="w-full">
            Crear cuenta
          </Button>
          <Link href="/feed" className="inline-block py-2 text-xs font-bold text-ink-soft underline-offset-2 hover:underline">
            Ver publicaciones sin cuenta
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && <Alert>{errorMsg}</Alert>}

        <Field
          label="Correo electrónico"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
        />
        <PasswordField
          label="Contraseña"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tu contraseña"
        />
        <div className="-mt-2 text-right">
          <Link href="/forgot-password" className="inline-block py-2 text-xs font-bold text-primary underline-offset-2 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          {loading ? "Ingresando…" : "Iniciar sesión"}
        </Button>
      </form>
    </AuthShell>
  );
}
