import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Libre_Bodoni } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const heroSerif = Libre_Bodoni({
  variable: "--font-hero-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const displaySerif = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Majlis",
  description: "Discover gatherings. Keep a journal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${heroSerif.variable} ${displaySerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
