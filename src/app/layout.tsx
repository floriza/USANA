import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "USANA Store Philippines | Premium Health Supplements",
    template: "%s | USANA Store Philippines",
  },
  description:
    "Shop premium USANA health supplements, nutritionals, and personal care products. Official Independent USANA Distributor in the Philippines.",
  keywords: [
    "USANA",
    "supplements",
    "health",
    "nutrition",
    "Philippines",
    "vitamins",
    "minerals",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_PH",
    siteName: "USANA Store Philippines",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-PH" className={inter.variable}>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
