import { Suspense } from "react";
import type { Metadata } from "next";
import { HeroSection } from "@/components/store/hero-section";
import { FeaturedProducts } from "@/components/store/featured-products";
import { CategoryGrid } from "@/components/store/category-grid";
import { HealthDisclaimer } from "@/components/compliance/health-disclaimer";
import { TrustBadges } from "@/components/store/trust-badges";
import { NewsletterSection } from "@/components/store/newsletter-section";

export const metadata: Metadata = {
  title: "USANA Store Philippines | Premium Health Supplements",
  description:
    "Shop authentic USANA health supplements, nutritionals, weight management, and personal care products. Fast delivery across the Philippines.",
  openGraph: {
    title: "USANA Store Philippines",
    description:
      "Premium health supplements from an Independent USANA Distributor",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100" />}>
        <CategoryGrid />
      </Suspense>
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-50" />}>
        <FeaturedProducts />
      </Suspense>
      <HealthDisclaimer variant="banner" />
      <NewsletterSection />
    </>
  );
}
