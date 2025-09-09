import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common";

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
  title: "Agente Virtual | n8n + Next.js",
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
      <body
        className={`${ubuntuSans.variable} ${ubuntuMono.variable} antialiased`}
      >
        <SidebarProvider>
          <div className="flex min-h-screen">
            <AppSidebar />
            <main className="flex-1">
              <SidebarTrigger />
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
