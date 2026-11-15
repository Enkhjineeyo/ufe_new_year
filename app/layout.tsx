import type { Metadata, Viewport } from "next";
import "@fontsource-variable/unbounded";
import "@fontsource-variable/manrope";
import "./globals.css";
import { siteConfig } from "@/site.config";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

const description =
  "СЭЗИС-ийн оюутнуудад зориулсан шинэ жилийн үдэшлэг — 2026.12.20, Corporate Convention Centre. Live performance, DJ set, finger foods, special surprises.";

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: `${siteConfig.title} — ${siteConfig.tagline}`,
  description,
  keywords: [
    "СЭЗИС",
    "UFE",
    "New Year 2027",
    "Шинэ жил",
    "University of Finance and Economics",
    "Ulaanbaatar",
  ],
  openGraph: {
    type: "website",
    locale: "mn_MN",
    title: `${siteConfig.title} — ${siteConfig.tagline}`,
    description,
    siteName: siteConfig.title,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.title} — ${siteConfig.tagline}`,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#08090D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn">
      <body className="font-sans">{children}</body>
    </html>
  );
}
