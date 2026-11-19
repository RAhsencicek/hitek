import type { Metadata } from "next";
import "./globals.css";
import { SectorProvider } from "@/lib/SectorContext";

export const metadata: Metadata = {
  title: "HiServis AI — Çok Sektörlü Akıllı Servis Yönetim Sistemi",
  description: "Oto Servis, Asansör, Kombi, Jeneratör & Genel Sanayi için Saha ve Atölye Yönetim Sistemi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* MANDATORY per modern-web-guidance dark-mode: declare both color schemes to prevent FOUC */}
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC]">
        <SectorProvider>{children}</SectorProvider>
      </body>
    </html>
  );
}
