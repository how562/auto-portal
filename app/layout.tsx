import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BRAND_NAME, BRAND_TITLE_SUFFIX } from "@/lib/brand";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND_TITLE_SUFFIX} | Guided vehicle discovery`,
  description: `Find your next vehicle by how you live. Guided discovery across real ${BRAND_NAME} inventory.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-[var(--cream)] text-[var(--ink)] antialiased">
        {children}
      </body>
    </html>
  );
}
