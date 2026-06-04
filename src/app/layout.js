import "./globals.css";
import { Quicksand } from "next/font/google"; 

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand", 
});

export const metadata = {
  title: "Bloom",
  description: "Mascotas en Mendoza",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${quicksand.variable}`}> 
      <body>{children}</body>
    </html>
  );
}