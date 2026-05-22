import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { BRAND_NAME, BRAND_TITLE_SUFFIX } from "@/lib/brand";
import { fetchPortalNavigation } from "@/lib/navigation";
import { fetchPortalCtaSettings } from "@/lib/portalCtas";
import { fetchPortalTextSettings } from "@/lib/portalTextSettings";
import { fetchSmartMatchRules } from "@/lib/smartMatchRules";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND_TITLE_SUFFIX} | Guided vehicle discovery`,
  description: `Find your next vehicle by how you live. Guided discovery across real ${BRAND_NAME} inventory.`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navigation, ctas, portalTexts, smartMatchRules] = await Promise.all([
    fetchPortalNavigation(),
    fetchPortalCtaSettings(),
    fetchPortalTextSettings(),
    fetchSmartMatchRules(),
  ]);

  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-[var(--cream)] text-[var(--ink)] antialiased">
        <AppProviders
          navigation={navigation}
          ctas={ctas}
          portalTexts={portalTexts}
          smartMatchRules={smartMatchRules}
        >
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
