import { useId } from "react";
import Link from "next/link";
import { Flower2, LoaderCircle, TriangleAlert, Check } from "lucide-react";

/* Piezas de UI compartidas. Antes cada pantalla tenía su propia copia de esto. */

/* ───────── Logo ───────── */
export function LogoMark({ size = "md" }) {
  const box = size === "lg" ? "h-16 w-16" : "h-9 w-9";
  const icon = size === "lg" ? "h-8 w-8" : "h-5 w-5";
  return (
    <span className={`grid ${box} place-items-center rounded-full bg-primary text-white shadow-sm`}>
      <Flower2 className={icon} aria-hidden="true" />
    </span>
  );
}

/* ───────── Botón (o link con aspecto de botón) ───────── */
const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";
const BUTTON_VARIANTS = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-secondary text-ink hover:brightness-95",
  outline: "border border-line bg-surface text-ink hover:bg-field",
  danger: "bg-lost text-white hover:brightness-90",
};
const BUTTON_SIZES = { md: "h-12 px-5 text-sm", sm: "h-10 px-4 text-xs" };

export function Button({
  variant = "primary",
  size = "md",
  href,
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  children,
  ...props
}) {
  const cls = `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} disabled={disabled || loading} className={cls} {...props}>
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

/* ───────── Campos de formulario ───────── */
export const inputClass =
  "w-full rounded-xl border border-line bg-field px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20";

export function FieldShell({ id, label, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Field({ label, hint, ...props }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <input id={id} className={`${inputClass} h-12`} {...props} />
    </FieldShell>
  );
}

export function TextArea({ label, hint, ...props }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <textarea id={id} className={`${inputClass} min-h-24 resize-none py-3`} {...props} />
    </FieldShell>
  );
}

/** options: ["Macho", "Hembra"] o [{ value, label }] */
export function SelectField({ label, hint, options, ...props }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <select id={id} className={`${inputClass} h-12`} {...props}>
        {options.map((o) => {
          const { value, label: text } = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </FieldShell>
  );
}

/* ───────── Mensajes ───────── */
export function Alert({ variant = "error", children }) {
  const isError = variant === "error";
  const Icon = isError ? TriangleAlert : Check;
  const tone = isError ? "border-lost/30 bg-lost/10 text-lost" : "border-found/30 bg-found/10 text-found";
  return (
    <div role={isError ? "alert" : "status"} className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${tone}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

/* ───────── Chip (filtro / opción seleccionable). Con `href` es un link. ───────── */
export function Chip({ active = false, icon: Icon, href, children, className = "", ...props }) {
  const cls = `inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-xs font-bold transition ${
    active ? "border-primary bg-primary/10 text-primary" : "border-line bg-surface text-ink-soft hover:bg-field"
  } ${className}`;
  const content = (
    <>
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </>
  );
  if (href) {
    return (
      <Link href={href} scroll={false} aria-current={active ? "true" : undefined} className={cls} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" aria-pressed={active} className={cls} {...props}>
      {content}
    </button>
  );
}
