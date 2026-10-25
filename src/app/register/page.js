"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { authErrorMessage } from "@/lib/auth";
import { cleanPhone, isValidLocalPhone } from "@/lib/pets";
import AuthShell from "@/components/authshell";
import { Alert, Button, Field } from "@/components/ui";
import PasswordField from "@/components/passwordfield";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isValidLocalPhone(form.whatsapp)) {
      setErrorMsg("El teléfono debe tener 10 dígitos: código de área sin 0 + número sin 15. Ej: 2615555555.");
      return;
    }
    if (form.password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { full_name: form.name.trim(), whatsapp: cleanPhone(form.whatsapp) } },
    });
    setLoading(false);

    if (error) {
      setErrorMsg(authErrorMessage(error));
      return;
    }
    // Con "Confirm email" activado Supabase no devuelve sesión hasta que se confirma el correo.
    if (data.session) router.replace("/feed");
    else setNeedsConfirmation(true);
  };

  if (needsConfirmation) {
    return (
      <AuthShell title="Revisá tu correo" subtitle={`Te enviamos un enlace a ${form.email.trim()}`}>
        <div className="space-y-5 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-found/10 text-found">
            <MailCheck className="h-7 w-7" />
          </span>
          <p className="text-sm text-ink-soft">Tocá el enlace para confirmar tu cuenta y después iniciá sesión.</p>
          <Button href="/login" className="w-full">
            Ir a iniciar sesión
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Creá tu cuenta"
      subtitle="Es gratis y toma menos de un minuto."
      footer={
        <>
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-bold text-primary underline-offset-2 hover:underline">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && <Alert>{errorMsg}</Alert>}

        <Field label="Nombre completo" required autoComplete="name" value={form.name} onChange={set("name")} placeholder="Juan Pérez" />
        <Field
          label="WhatsApp"
          type="tel"
          required
          autoComplete="tel-national"
          inputMode="numeric"
          value={form.whatsapp}
          onChange={set("whatsapp")}
          placeholder="2615555555"
          hint="Código de área sin 0 y número sin 15. Es el que verán quienes quieran contactarte por tus publicaciones."
        />
        <Field
          label="Correo electrónico"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={form.email}
          onChange={set("email")}
          placeholder="tu@correo.com"
        />
        <PasswordField
          label="Contraseña"
          required
          minLength={6}
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          placeholder="Mínimo 6 caracteres"
        />

        <Button type="submit" loading={loading} className="w-full">
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>
    </AuthShell>
  );
}
