/* Manifiesto PWA: es lo que permite "Instalar Bloom" / "Agregar a inicio" y que abra como app. */
export default function manifest() {
  return {
    id: "/",
    name: "Bloom · Mascotas en Mendoza",
    short_name: "Bloom",
    description: "Mascotas perdidas, encontradas y en adopción en Mendoza",
    lang: "es-AR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#eddddd",
    theme_color: "#185b63",
    categories: ["lifestyle", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // atajos al mantener apretado el ícono de la app (Android)
    shortcuts: [
      { name: "Publicar una mascota", short_name: "Publicar", url: "/create", icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }] },
      { name: "Ver publicaciones", short_name: "Inicio", url: "/feed", icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }] },
    ],
  };
}
