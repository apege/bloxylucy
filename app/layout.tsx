import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BloxyLucy - Top Up Robux Murah, Cepat & Aman Terpercaya",
  description: "Platform Top Up Robux Roblox & Voucher Game Termurah, Legal, Kilat 5-10 Menit Hanya Butuh Username. Garansi 200% Uang Kembali!",
  icons: {
    icon: "/images/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fff7fa] text-[#2d1822] selection:bg-pink-300 selection:text-pink-900">
        {children}
      </body>
    </html>
  );
}
