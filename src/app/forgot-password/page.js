"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { authErrorMessage } from "@/lib/auth";
import AuthShell from "@/components/authshell";
import { Alert, Button, Field } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // El enlace del correo lleva a /reset-password (hay que autorizar esa URL en Supabase)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) return setErrorMsg(authErrorMessage(error));
    setSent(true); // mismo mensaje exista o no la cuenta: no revelamos qué correos están registrados
  };

  const backToLogin = (
    <Link href="/login" className="font-bold text-primary underline-offset-2 hover:underline">
      Volver a iniciar sesión
    </Link>
  );

  if (sent) {
    return (
      <AuthShell title="Revisá tu correo" subtitle="Si hay una cuenta con ese correo, te enviamos un enlace." footer={backToLogin}>
        <div className="space-y-4 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-found/10 text-found">
            <MailCheck className="h-7 w-7" />
          </span>
          <p className="text-sm text-ink-soft">
            Tocá el enlace para elegir una contraseña nueva. Si no lo ves en unos minutos, mirá en spam.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Recuperá tu contraseña"
      subtitle="Te enviamos un enlace para crear una nueva."
      footer={backToLogin}
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
        <Button type="submit" loading={loading} className="w-full">
          {loading ? "Enviando…" : "Enviar enlace"}
        </Button>
      </form>
    </AuthShell>
  );
}
