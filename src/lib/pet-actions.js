import { supabase } from "./supabase";
import { uploadPetPhoto, removePetPhoto } from "./photos";
import { AGES, BREEDS, GENDERS, PET_TYPES, SIZES, TRAITS, normalizeStatus } from "./pets";

export const LIMITS = { name: 60, location: 120, description: 400 };

const NO_NAME = "Sin nombre";
const AGE_VALUES = AGES.map((a) => a.value);
const TYPE_VALUES = PET_TYPES.map((t) => t.value);

const fail = (code, error) => ({ ok: false, code, error });

export function validatePetFields(form) {
  if (!TYPE_VALUES.includes(form?.type)) return "Elegí si es perro o gato.";
  if (!BREEDS[form.type].includes(form.breed)) return "Elegí una raza de la lista.";
  if (!AGE_VALUES.includes(form.age)) return "Elegí una edad de la lista.";
  if (!GENDERS.includes(form.gender)) return "Elegí el sexo de la lista.";
  if (!SIZES.includes(form.size)) return "Elegí un tamaño de la lista.";
  if (String(form.name ?? "").trim().length > LIMITS.name) return `El nombre no puede pasar de ${LIMITS.name} letras.`;
  const location = String(form.location ?? "").trim();
  if (!location) return "Indicá la zona para que puedan ubicarla.";
  if (location.length > LIMITS.location) return `La zona no puede pasar de ${LIMITS.location} letras.`;
  if (String(form.description ?? "").trim().length > LIMITS.description)
    return `Los detalles no pueden pasar de ${LIMITS.description} letras.`;
  return "";
}

export function petToForm(pet) {
  const type = TYPE_VALUES.includes(pet.type) ? pet.type : TYPE_VALUES[0];
  const pick = (list, value) => (list.includes(value) ? value : list[0]);
  return {
    type,
    name: !pet.name || pet.name === NO_NAME ? "" : pet.name,
    breed: pick(BREEDS[type], pet.breed),
    age: pick(AGE_VALUES, pet.age),
    gender: pick(GENDERS, pet.gender),
    size: pick(SIZES, pet.size),
    location: pet.location ?? "",
    description: pet.description ?? "",
    ...Object.fromEntries(TRAITS.map((t) => [t.id, !!pet[t.id]])),
  };
}

/**
 * Trae UNA publicación para editarla, solo si es de la persona logueada.
 * (Todos pueden leer `pets`, por eso se filtra también por user_id.)
 *
 * @param {string} id      
 * @param {string} userId  
 * @returns {Promise<{ pet, form, error }>}
export async function getMyPetForEdit(id, userId) {
  const { data, error } = await supabase.from("pets").select("*").eq("id", id).eq("user_id", userId).maybeSingle();

  if (error) {
    // 22P02 = el id de la URL no tiene formato de uuid
    return { pet: null, form: null, error: error.code === "22P02" ? "not_found" : "load_failed" };
  }
  if (!data) return { pet: null, form: null, error: "not_found" };
  return { pet: data, form: petToForm(data), error: null };
}

/**
 * Guarda los cambios de una publicación propia.
 * No se puede cambiar el estado (perdido / encontrado / adopción): para eso hay que publicar de nuevo.
 *
 * @param {string} id       
 * @param {string} userId   
 * @param {object} form      
 *                           
 * @param {File|null} newPhotoFile  
 * @returns {Promise<{ ok: true } | { ok: false, code, error }>}
 *   code: "invalid" | "not_found" | "photo" | "network"; `error` ya viene en español para mostrar en <Alert>.
 */
export async function updatePet(id, userId, form, newPhotoFile = null) {
  const problem = validatePetFields(form);
  if (problem) return fail("invalid", problem);

  const { data: current, error: readError } = await supabase
    .from("pets")
    .select("status, image_url")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) return fail("network", "No pudimos guardar. Revisá tu conexión y probá de nuevo.");
  if (!current) return fail("not_found", "No encontramos esa publicación o no es tuya.");

  const isAdoption = normalizeStatus(current.status) === "adoption";

  let newUrl = null;
  try {
    if (newPhotoFile) {
      try {
        newUrl = await uploadPetPhoto(newPhotoFile, userId);
      } catch (err) {
        console.error("Error al subir la foto:", err);
        return fail("photo", "No pudimos subir la foto. Probá con otra o revisá tu conexión.");
      }
    }

    const patch = {
      type: form.type,
      name: String(form.name ?? "").trim() || NO_NAME,
      breed: form.breed,
      age: form.age,
      gender: form.gender,
      size: form.size,
      location: form.location.trim(),
      description: String(form.description ?? "").trim() || null,
      ...Object.fromEntries(TRAITS.map((t) => [t.id, isAdoption && !!form[t.id]])),
      ...(newUrl ? { image_url: newUrl } : {}),
    };

    const { data, error } = await supabase.from("pets").update(patch).eq("id", id).eq("user_id", userId).select("id");

    if (error) throw error;
    if (!data?.length) {
      if (newUrl) removePetPhoto(newUrl);
      return fail("not_found", "No encontramos esa publicación o no es tuya.");
    }
  } catch (err) {
    if (newUrl) removePetPhoto(newUrl);
    console.error("Error al editar:", err);
    return fail("network", "No pudimos guardar. Revisá tu conexión y probá de nuevo.");
  }

  if (newUrl && current.image_url && current.image_url !== newUrl) removePetPhoto(current.image_url);
  return { ok: true };
}

/**
 * Marca una publicación propia como resuelta (apareció / volvió con su dueño / adoptada),
 * o la reabre. La fecha la pone la base (trigger), no el celular.
 *
 * @param {string} id
 * @param {string} userId
 * @param {boolean} resolved
 * @returns {Promise<{ ok: true } | { ok: false, code, error }>}
 */
export async function setPetResolved(id, userId, resolved = true) {
  const { data, error } = await supabase
    .from("pets")
    .update({ resolved_at: resolved ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id");

  if (error) {
    console.error("Error al cambiar el estado de resuelto:", error);
    return fail("network", "No pudimos actualizar la publicación. Revisá tu conexión y probá de nuevo.");
  }
  if (!data?.length) return fail("not_found", "No encontramos esa publicación o no es tuya.");
  return { ok: true };
}
