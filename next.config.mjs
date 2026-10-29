// Next.js solo deja mostrar con <Image> imágenes de dominios declarados.
// Autorizamos las fotos públicas de TU proyecto de Supabase Storage.
const remotePatterns = [];
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { protocol, hostname } = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    remotePatterns.push({
      protocol: protocol.replace(":", ""),
      hostname,
      pathname: "/storage/v1/object/public/**",
    });
  }
} catch {
  // URL inválida: lib/supabase.js ya avisa con un error claro
}

// Cabeceras de seguridad para todas las páginas. (No se incluye CSP todavía: ver DEPLOY.md, "Más adelante".)
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" }, // que nadie pueda incrustar Bloom en otro sitio (clickjacking)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  images: { remotePatterns },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
