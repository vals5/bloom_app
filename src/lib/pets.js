import { CircleHelp, Eye, HeartHandshake, Dog, Cat } from "lucide-react";

/* ───────── Estados de una publicación ─────────
   Única fuente de verdad: la usan el feed, las cards, el detalle y el formulario.
   Las clases están completas (no armadas con template strings) para que Tailwind las detecte. */
export const STATUS = {
  lost: {
    label: "Perdido",
    tab: "Perdidos",
    icon: CircleHelp,
    bg: "bg-lost",
    fg: "text-lost",
    soft: "bg-lost/10",
    border: "border-lost",
    dot: "bg-lost",
    pick: "Perdí a mi mascota",
    where: "¿Dónde se perdió?",
    descHint: "Ej: collar rojo, mancha blanca en la pata, responde a su nombre…",
    cta: "Tengo información",
    waText: (name) => `¡Hola! Vi tu publicación de ${name} en Bloom y quiero ayudar.`,
  },
  found: {
    label: "Encontrado",
    tab: "Encontrados",
    icon: Eye,
    bg: "bg-found",
    fg: "text-found",
    soft: "bg-found/10",
    border: "border-found",
    dot: "bg-found",
    pick: "Encontré una mascota",
    where: "¿Dónde la encontraste?",
    descHint: "Ej: tiene collar azul, parece asustada, está con nosotros…",
    cta: "Es mi mascota",
    waText: () => "¡Hola! Vi tu publicación en Bloom y creo que es mi mascota.",
  },
  adoption: {
    label: "En adopción",
    tab: "Adopción",
    icon: HeartHandshake,
    bg: "bg-adopt",
    fg: "text-adopt",
    soft: "bg-adopt/10",
    border: "border-adopt",
    dot: "bg-adopt",
    pick: "Busca un hogar",
    where: "¿Dónde está?",
    descHint: "Ej: es muy cariñoso, convive con otros perros, necesita patio…",
    cta: "Quiero adoptar",
    waText: (name) => `¡Hola! Me interesa adoptar a ${name} (publicado en Bloom).`,
  },
};

export const STATUS_KEYS = Object.keys(STATUS);

/** Datos viejos pueden traer "adopt": lo tratamos igual que "adoption". */
export const normalizeStatus = (s) => (s === "adopt" ? "adoption" : s);
export const statusMeta = (s) => STATUS[normalizeStatus(s)] ?? null;

/* ───────── Opciones de formulario / filtros ───────── */
export const PET_TYPES = [
  { value: "perro", label: "Perro", plural: "Perros", icon: Dog },
  { value: "gato", label: "Gato", plural: "Gatos", icon: Cat },
];

const OTHER = "Otra / No sé";
export const BREEDS = {
  perro: ["Cruza / Mestizo", "Ovejero Alemán", "Pitbull", "Golden Retriever", "Caniche", "Bulldog Francés", "Labrador", OTHER],
  gato: ["Cruza / Mestizo", "Siamés", "Persa", "Bengala", "Común Europeo", "Angora", OTHER],
};

// Se guardan estos valores tal cual en la base: no los renombres sin migrar los datos.
export const GENDERS = ["Macho", "Hembra", "Desconocido"];
export const SIZES = ["Pequeño/a", "Mediano", "Grande"];
export const AGES = [
  { value: "Cachorro", label: "Cachorro (menos de 1 año)" },
  { value: "Joven", label: "Joven" },
  { value: "Adulto", label: "Adulto" },
  { value: "Senior", label: "Senior (más de 7 años)" },
];

// `id` = nombre de la columna en la tabla `pets`
export const TRAITS = [
  { id: "vaccinated", label: "Vacunado/a" },
  { id: "neutered", label: "Castrado/a" },
  { id: "good_with_kids", label: "Se lleva bien con niños" },
  { id: "house_trained", label: "Hace sus necesidades afuera" },
];

export const ZONES = [
  "Ciudad de Mendoza", "Godoy Cruz", "Guaymallén", "Las Heras", "Luján de Cuyo", "Maipú", "Lavalle",
  "San Martín", "Rivadavia", "Junín", "Tunuyán", "San Rafael",
];

/* ───────── Helpers ───────── */
const TZ = "America/Argentina/Mendoza"; // fija la zona para que servidor y navegador coincidan

/** Prefiere created_at (real); cae a la columna `date` vieja (texto) si no existe. */
export function formatPetDate(pet) {
  if (!pet?.created_at) return pet?.date ?? "";
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: TZ }).format(
    new Date(pet.created_at)
  );
}

/** "261 555-5555" → "2615555555" */
export const cleanPhone = (v) => String(v ?? "").replace(/\D/g, "");
/** 10 dígitos, código de área sin 0 y sin 15 (ej: 2615555555) */
export const isValidLocalPhone = (v) => /^\d{10}$/.test(cleanPhone(v));

/** Devuelve el número en formato internacional para wa.me (Argentina móvil = 549 + número). */
export function toWhatsappNumber(input) {
  let d = cleanPhone(input).replace(/^0+/, "");
  if (d.startsWith("549") && d.length === 13) return d;
  if (d.startsWith("54") && d.length === 12) return `549${d.slice(2)}`;
  if (d.length === 10) return `549${d}`;
  return null;
}

export function whatsappUrl(phone, text) {
  const n = toWhatsappNumber(phone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}
