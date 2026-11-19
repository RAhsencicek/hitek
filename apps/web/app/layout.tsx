import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HiServis AI — Tasarım Sistemi & UI-Kit Vitrini",
  description: "Oto Servis & Filo Yönetimi için Dokunmatik Odaklı Tasarım Sistemi",
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
        {children}
      </body>
    </html>
  );
}
