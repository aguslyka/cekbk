import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CekDiriBK.id - Self-Assessment Bimbingan Konseling",
  description: "Kenali dirimu, Pahami masalahmu, dan temukan solusi terbaik bersama BK. DCM (Daftar Cek Masalah) untuk siswa SMP.",
  keywords: ["CekDiriBK", "Bimbingan Konseling", "DCM", "Self-Assessment", "SMP", "Masalah Siswa"],
  authors: [{ name: "Team 6" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
