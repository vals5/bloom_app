# Cómo subir Bloom y que la gente la pruebe

Orden recomendado: **Supabase → GitHub → Vercel → volver a Supabase → verificar**.
Todo lo de abajo se puede hacer gratis para la etapa de prueba (ver "Límites del plan gratis").

---

## 1. Supabase (la base de datos, el login y las fotos)

1. **SQL Editor** → New query → pegá todo `supabase/setup.sql` → **Run**. Debe decir "Success".
   (Se puede correr más de una vez. Completa las columnas que falten en `pets`, y crea el resto de tablas, la seguridad,
   el bucket de fotos y los límites anti-spam. No borra tus publicaciones existentes.)
   Si da un error en rojo, copiá el mensaje completo: casi siempre es una columna o tabla con otro nombre en tu proyecto.
2. **Authentication → Providers → Email → "Confirm email"**. Decidí una de las dos:
   - **Para la prueba con gente (recomendado): DESACTIVADO.** Quien se registra entra directo.
     Motivo: el servicio de mails gratis de Supabase manda solo **2 mails por hora en todo el proyecto**
     (registro, confirmación y recuperar contraseña comparten ese cupo). Con confirmación activada, a partir
     de la tercera persona nadie recibe el mail.
   - **Más adelante: ACTIVADO + SMTP propio** (*Authentication → SMTP Settings*, por ejemplo con Resend).
     Con SMTP propio el tope sube a 30/hora y se puede aumentar.
   - Con confirmación desactivada, el "Olvidé mi contraseña" sigue necesitando mail (2/hora). Para la prueba alcanza;
     para producción, configurá SMTP propio.
   **Cómo comprobar que quedó desactivado:** abrí la app, creá una cuenta de prueba y mirá qué pasa.
   Si entra directo al inicio, está desactivado. Si muestra "Revisá tu correo", sigue activado.
   También lo ves en *Authentication → Users*: una cuenta nueva debería tener la fecha de confirmación cargada
   desde el primer momento (columna "Confirmed at" / "Last sign in").
3. Anotá **Project URL** y **anon key** (*Project Settings → API*). Las necesitás en el paso 3.

## 2. GitHub

Si ya tenés el repositorio en GitHub, solo:

```
git add .
git commit -m "Bloom lista para publicar"
git push
```

Si todavía no: creá un repositorio **privado** vacío en github.com y seguí las 3 líneas que te muestra
(`git remote add origin …`, `git branch -M main`, `git push -u origin main`).
**Nunca subas `.env.local`** (ya está ignorado por `.gitignore`).

## 3. Vercel (el hosting)

1. vercel.com → **Add New… → Project** → importá el repositorio. Detecta Next.js solo.
2. **Environment Variables** (las mismas de tu `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Deploy**. Te da una URL tipo `https://bloom-xxxx.vercel.app`.
4. **Región** (hace la app más rápida): *Settings → Functions → Function Region* → elegí la más cercana a tu
   proyecto de Supabase (si el tuyo está en South America, **São Paulo / gru1**). Después hacé *Redeploy*.
   La región de tu Supabase la ves en *Project Settings → General*.

## 4. Volver a Supabase con tu URL

*Authentication → URL Configuration*:
- **Site URL**: `https://tu-app.vercel.app`
- **Redirect URLs**: agregá `https://tu-app.vercel.app/reset-password`
  (y `http://localhost:3000/reset-password` si seguís probando en tu PC).

Sin esto el enlace de "Olvidé mi contraseña" no funciona.

## 5. Verificar que todo guarda de verdad

Abrí `https://tu-app.vercel.app/api/health`. Tiene que mostrar `"ok": true` y todo en `true`.
Si algo está en `false`, el mensaje (`hint`) te dice qué falta (casi siempre: correr `setup.sql`).

Después, prueba de punta a punta (con dos cuentas, de preferencia desde dos celulares):

- [ ] Abrir el link → aparece **Iniciar sesión**.
- [ ] **Crear cuenta** con tu WhatsApp → entra al inicio.
- [ ] **Publicar** una mascota con foto → se abre su ficha.
- [ ] Cerrar y volver a abrir la app → la publicación **sigue ahí** (se guardó en la base).
- [ ] Con la **otra cuenta**: ver la publicación, tocar el corazón y **contactar por WhatsApp**.
- [ ] En *Supabase → Table Editor* ver la fila en `pets` y el perfil en `profiles`.
- [ ] Pegar el link de una publicación en WhatsApp → se ve la foto y el título.
- [ ] Instalar la app: Android → menú del navegador → *Instalar app*; iPhone → Safari → Compartir → *Agregar a inicio*.

## 6. Pasarle el link a la gente

Alcanza con la URL de Vercel. Si querés un nombre mejor, comprá un dominio y agregalo en
*Vercel → Settings → Domains* (y actualizá el paso 4 con el dominio nuevo).

---

## Límites del plan gratis (verificados en octubre de 2026; confirmalos antes de lanzar)

**Supabase gratis**
- El proyecto se **pausa tras 1 semana sin actividad** y hay que restaurarlo a mano desde el panel
  ("Restore project"). Mientras está pausado la app no funciona. Si la prueba puede quedar quieta una semana,
  entrá al panel de vez en cuando, o pasá a Pro.
- Incluye 500 MB de base de datos, 1 GB de archivos (fotos), 5 GB de transferencia y 50.000 usuarios activos al mes.
  Las fotos se comprimen antes de subir, así que 1 GB alcanza para miles.
- Pro cuesta unos USD 25 por mes.

**Vercel gratis (plan Hobby)**
- Es **solo para uso personal, no comercial**. Para una prueba sin ingresos está bien.
  **Si Bloom va a generar dinero** (publicidad, pagos, etc.), Vercel exige el plan Pro (unos USD 20 por mes por usuario).
- Alternativas si querés evitar eso: Netlify (su plan gratis permite uso comercial) o Cloudflare Pages.
  Next.js funciona mejor en Vercel; en otros hace falta algo más de configuración.

## Más adelante (no hace falta para empezar a probar)

- Dominio propio + SMTP propio (mails con tu marca, sin el límite de 2 por hora).
- Captcha en el registro (Cloudflare Turnstile / hCaptcha) si aparecen cuentas falsas.
- **Política de privacidad y términos de uso**: la app guarda correos y teléfonos (en Argentina rige la Ley 25.326
  de protección de datos personales). Conviene tenerlos publicados antes de abrirla a mucha gente.
- Política de contenido (CSP) en `next.config.mjs` y monitoreo de errores (por ejemplo Sentry).
- Backups automáticos (vienen en el plan Pro de Supabase).
