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

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: { remotePatterns },
  async headers() {
    return [
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
