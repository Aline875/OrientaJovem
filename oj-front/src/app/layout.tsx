import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Exo_2 } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo2",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OrientaJovem",
  description: "",
  icons: {
    icon: "/OJ.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${exo2.variable} font-[var(--font-exo2)] antialiased bg-gradient-to-t from-[#1A5579] to-[#2A2570] min-h-screen`}
      >
        <link rel="manifest" href="/manifest.json"/>
        {children}
      </body>
    </html>
  );
}
