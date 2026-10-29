import { LogoMark } from "./ui";

/* Marco común de login y registro (antes estaba duplicado en cada página). */
export default function AuthShell({ title, subtitle, footer, children }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <LogoMark size="lg" />
        <h1 className="mt-4 text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
      </div>

      <div className="rounded-3xl bg-surface p-6 shadow-sm ring-1 ring-line">{children}</div>

      {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
    </main>
  );
}
