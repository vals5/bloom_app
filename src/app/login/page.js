"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { authErrorMessage } from "@/lib/auth";
import AuthShell from "@/components/authshell";
import { Alert, Button, Field } from "@/components/ui";
import PasswordField from "@/components/passwordfield";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    // Si venía de una página que pedía iniciar sesión (?next=/pet-details/…), vuelve ahí. Solo rutas internas.
    const next = new URLSearchParams(window.location.search).get("next");
    router.replace(next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/feed");
  };

  return (
    <AuthShell
      title="Te damos la bienvenida"
      subtitle="Ingresá para publicar y contactar a otras personas."
      footer={
        <>
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="font-bold text-primary underline-offset-2 hover:underline">
            Crear cuenta
          </Link>
        </>
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
