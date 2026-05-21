import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Auto Group | Guided vehicle discovery",
  description:
    "Find your next vehicle by how you live. Guided discovery across real group inventory.",
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
