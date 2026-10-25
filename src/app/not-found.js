import { PawPrint } from "lucide-react";
import AppShell from "@/components/appshell";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <AppShell>
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <PawPrint className="mb-3 h-12 w-12 text-muted/60" aria-hidden="true" />
        <h1 className="text-xl font-bold text-ink">No encontramos esta página</h1>
        <p className="mt-1 text-sm text-ink-soft">Puede que la publicación ya no exista.</p>
        <Button href="/feed" className="mt-6">
          Volver al inicio
        </Button>
      </main>
    </AppShell>
  );
}
