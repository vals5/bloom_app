import "./globals.css";
import localFont from "next/font/local";

// Quicksand incluida en el proyecto (src/app/fonts): no depende de Google Fonts ni de internet al compilar.
// Es una fuente variable, así que un solo archivo cubre todos los pesos (300–700). Licencia OFL incluida.
const quicksand = localFont({
  src: "./fonts/Quicksand-Variable.woff2",
  weight: "300 700",
  style: "normal",
  variable: "--font-quicksand",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata = {
  title: { default: "Bloom", template: "%s · Bloom" },
  description: "Mascotas perdidas, encontradas y en adopción en Mendoza",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#185b63",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR" className={quicksand.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
