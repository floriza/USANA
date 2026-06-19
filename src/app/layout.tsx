import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "sonner";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
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
    <html
      lang="en-PH"
      className={`${playfair.variable} ${dmSans.variable}`}
      style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      <body className="min-h-dvh bg-[--background] antialiased" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
        <Providers>
          {children}
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                borderRadius: "1rem",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
