import { supabase } from "./supabase";

const BUCKET = "pet-photos";
export const MAX_PHOTO_MB = 15;

/** Achica la foto (los celulares sacan fotos de 5–10 MB) antes de subirla. */
async function compress(file, maxSide = 1280, quality = 0.82) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    return blob ?? file;
  } catch {
    return file; // si el navegador no puede procesarla, subimos la original
  }
}

/** Sube la foto a Storage y devuelve su URL pública. Ruta: <userId>/<uuid>.jpg */
export async function uploadPetPhoto(file, userId) {
  const body = await compress(file);
  const ext = body.type === "image/jpeg" ? "jpg" : file.name.split(".").pop() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: body.type || file.type,
    cacheControl: "31536000",
  });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Borra una foto a partir de su URL pública. Si falla, no molesta (best effort). */
export async function removePetPhoto(url) {
  const marker = `/${BUCKET}/`;
  const i = url ? url.indexOf(marker) : -1;
  if (i < 0) return;
  try {
    await supabase.storage.from(BUCKET).remove([decodeURIComponent(url.slice(i + marker.length))]);
  } catch {
    /* ignorar */
  }
}
