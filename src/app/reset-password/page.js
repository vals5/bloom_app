"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheck, LinkIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { authErrorMessage } from "@/lib/auth";
import AuthShell from "@/components/authshell";
import { Alert, Button } from "@/components/ui";
import PasswordField from "@/components/passwordfield";

/* A esta página llega la persona desde el enlace del correo.
   supabase-js lee el token de la URL y abre una sesión de recuperación (evento PASSWORD_RECOVERY). */
export default function ResetPasswordPage() {
  const [phase, setPhase] = useState("checking"); // checking | ready | invalid | done
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (active && event === "PASSWORD_RECOVERY") setPhase("ready");
    });

    // Si en un momento no llegó ninguna sesión, el enlace está vencido o ya se usó
    const timer = setTimeout(async () => {
      const { data: s } = await supabase.auth.getSession();
      if (active) setPhase((p) => (p === "checking" ? (s.session ? "ready" : "invalid") : p));
    }, 1500);

    return () => {
      active = false;
      clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (password.length < 6) return setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirm) return setErrorMsg("Las contraseñas no coinciden.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) return setErrorMsg(authErrorMessage(error));
    setPhase("done");
  };

  if (phase === "checking") {
    return (
      <AuthShell title="Un momento…" subtitle="Estamos validando tu enlace.">
        <p className="py-4 text-center text-sm text-ink-soft motion-safe:animate-pulse">Cargando…</p>
      </AuthShell>
    );
  }

  if (phase === "invalid") {
    return (
      <AuthShell title="El enlace no es válido" subtitle="Venció o ya fue usado.">
        <div className="space-y-5 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-lost/10 text-lost">
            <LinkIcon className="h-7 w-7" />
          </span>
          <Button href="/forgot-password" className="w-full">
            Pedir un enlace nuevo
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (phase === "done") {
    return (
      <AuthShell title="¡Listo!" subtitle="Ya cambiaste tu contraseña.">
        <div className="space-y-5 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-found/10 text-found">
            <CircleCheck className="h-7 w-7" />
          </span>
          <Button href="/feed" className="w-full">
            Ir al inicio
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Elegí tu nueva contraseña"
      subtitle="Mínimo 6 caracteres."
      footer={
        <Link href="/login" className="font-bold text-primary underline-offset-2 hover:underline">
          Cancelar
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && <Alert>{errorMsg}</Alert>}
        <PasswordField
          label="Contraseña nueva"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordField
          label="Repetí la contraseña"
          required
          minLength={6}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Button type="submit" loading={loading} className="w-full">
          {loading ? "Guardando…" : "Guardar contraseña"}
        </Button>
      </form>
    </AuthShell>
  );
}
