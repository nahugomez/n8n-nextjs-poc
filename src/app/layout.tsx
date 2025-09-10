import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/common/sidebar";

const ubuntuSans = Ubuntu({
  variable: "--font-ubuntu-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const ubuntuMono = Ubuntu_Mono({
  variable: "--font-ubuntu-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Civix | Agente de Trámites del Gobierno de San Juan",
  description: "Poc de integración de N8N con Next.js",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
    <body className="bg-zinc-950 text-zinc-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </body>
  </html>
  );
}
