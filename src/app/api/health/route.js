import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/* GET /api/health → dice en 1 segundo si la app está bien conectada y configurada.
   Solo informa sí/no por cada pieza; no devuelve datos de nadie. */
export const dynamic = "force-dynamic";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PET_COLUMNS = "id, created_at, user_id, name, status, type, breed, age, gender, size, location, description, image_url, vaccinated, neutered, good_with_kids, house_trained";
const MISSING = /does not exist|could not find the table|could not find the .* column/i;

// "existe" = respondió, o respondió "permiso denegado" (la tabla está, pero protegida: es lo esperado)
async function tableExists(table) {
  const { error } = await supabase.from(table).select("*", { head: true, count: "exact" }).limit(1);
  return !error || !MISSING.test(error.message ?? "");
}

export async function GET() {
  const checks = { auth: false, database: false, petsColumns: false, profiles: false, favorites: false, photoBucket: false };
  let reason = null;

  try {
    const auth = await fetch(`${url}/auth/v1/health`, { headers: { apikey: key }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    checks.auth = auth.ok;

    checks.database = await tableExists("pets");
    if (checks.database) {
      const cols = await supabase.from("pets").select(PET_COLUMNS, { head: true }).limit(1);
      checks.petsColumns = !cols.error;
      checks.profiles = await tableExists("profiles");
      checks.favorites = await tableExists("favorites");
    }

    // un archivo inexistente: si el bucket no existe, el mensaje lo dice
    const photo = await fetch(`${url}/storage/v1/object/public/pet-photos/.healthcheck`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    const body = await photo.text();
    checks.photoBucket = !/bucket not found/i.test(body);
  } catch {
    reason = "No se pudo conectar con Supabase. Si usás el plan gratis, puede estar pausado: entrá al panel y tocá «Restore project».";
  }

  const ok = Object.values(checks).every(Boolean);
  const hint = ok
    ? null
    : reason ?? "Falta configuración. Ejecutá supabase/setup.sql en el SQL Editor de Supabase y revisá las variables de entorno.";

  return NextResponse.json({ ok, checks, hint }, { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
