"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FieldShell, inputClass } from "./ui";

/* Único campo que necesita ser componente de cliente (maneja mostrar/ocultar). */
export default function PasswordField({ label, hint, ...props }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <div className="relative">
        <input id={id} type={visible ? "text" : "password"} className={`${inputClass} h-12 pr-12`} {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-ink"
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </FieldShell>
  );
}
