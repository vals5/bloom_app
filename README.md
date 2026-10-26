# Bloom 🌸

App para ayudar a mascotas perdidas, encontradas y en adopción en Mendoza.
Next.js 16 · React 19 · Tailwind 4 · Supabase.

## Puesta en marcha

1. `npm install`
2. Copiá `.env.example` a `.env.local` y completá las claves de Supabase.
3. En Supabase → **SQL Editor**, ejecutá `supabase/setup.sql` (tablas, seguridad RLS y bucket de fotos). Se puede correr más de una vez.
4. En Supabase → **Authentication → URL Configuration** agregá en *Redirect URLs*:
   - `http://localhost:3000/reset-password`
   - `https://TU-DOMINIO/reset-password` (y poné tu dominio como *Site URL*)

   Sin esto, el enlace del correo de "Olvidé mi contraseña" no funciona.
5. `npm run dev` → http://localhost:3000

## Estructura

```
src/
  app/            pantallas (splash, login, register, forgot-password, reset-password, feed, create, pet-details/[id], profile)
  components/     ui.js (botones, campos, chips…), petcard, feedheader, bottomnavbar, appshell…
  lib/            pets.js (estados, opciones, helpers), auth.js, favorites.js, photos.js, supabase.js
supabase/setup.sql
```

## App instalable (PWA)

Bloom se puede instalar desde el navegador y abre como app (sin barra del navegador).

- `src/app/manifest.js` → nombre, colores, íconos y atajos de la app.
- `public/icons/` y `src/app/icon.png`, `apple-icon.png` → íconos (192, 512, "maskable" para Android y 180 para iPhone).
- `public/sw.js` → service worker. Solo muestra `public/offline.html` si no hay internet; **no guarda datos**.
- `src/lib/pwa.js` + `components/installcard.js` → botón "Instalar" en el perfil (Android/Chrome) e instrucciones para iPhone.
- Requiere **HTTPS** en producción (Vercel y similares ya lo dan). El service worker solo se activa en producción (`npm run build && npm start`), no en `npm run dev`.

## Tipografía

Quicksand viene **incluida en el proyecto** (`src/app/fonts/Quicksand-Variable.woff2`, fuente variable 300–700, licencia OFL).
Se carga con `next/font/local` en `src/app/layout.js`: no se descarga de Google ni hace falta internet para compilar.

## Reglas del proyecto

- **Colores**: solo los tokens de `src/app/globals.css` (`bg-primary`, `text-ink`, `bg-lost`…). Nada de hex ni `gray-*` sueltos.
- **Estados / opciones** (perdido, razas, tamaños…): se definen una sola vez en `src/lib/pets.js`.
- **Botones, inputs, alertas, chips**: usar los de `src/components/ui.js`.
- Los filtros del feed viven en la URL (`?status=lost&type=perro&q=godoy`).

## Privacidad y datos

- El **WhatsApp** vive en la tabla `profiles`, no en `pets`. Solo lo puede leer una persona con sesión iniciada
  (y solo de quienes tienen publicaciones). Quien no inició sesión ve "Iniciá sesión para contactar".
- Los **favoritos** se guardan en la tabla `favorites` (por cuenta), no en el dispositivo.
- Todas las tablas tienen RLS: cada persona solo edita/borra lo suyo.

## Responsive

Celular: 1 columna + barra inferior · Tablet: 2 columnas + barra superior · Escritorio: 3 columnas.
El ancho se define en `components/appshell.js` (`size`), y las grillas en cada pantalla (`sm:grid-cols-2 lg:grid-cols-3`).
