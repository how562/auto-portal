import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import { BRAND_NAME, BRAND_TITLE_SUFFIX } from "@/lib/brand";
import { fetchPortalNavigation } from "@/lib/navigation";
import { fetchPortalCtaSettings } from "@/lib/portalCtas";
import { fetchPortalTextSettings } from "@/lib/portalTextSettings";
import { fetchSmartMatchRules } from "@/lib/smartMatchRules";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/gopadel/Gopadel%20Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/gopadel/Gopadel%20Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/gopadel/Gopadel%20SemiBold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-[var(--cream)] font-sans text-[var(--ink)] antialiased">
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
