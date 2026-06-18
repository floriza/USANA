import Link from "next/link";
import { ArrowRight, Shield, Star, Truck } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-32 -translate-x-32" />
      </div>

      <div className="relative container mx-auto px-4 max-w-7xl py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              Trusted by thousands of Filipino families
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Premium Health{" "}
              <span className="text-yellow-300">Supplements</span> for Your
              Wellness Journey
            </h1>

            <p className="text-blue-100 text-lg mb-8 leading-relaxed max-w-md">
              Authentic USANA products delivered to your door. Science-based
              nutrition for a healthier, more vibrant life.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products?featured=true"
                className="inline-flex items-center gap-2 border border-white/40 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Best Sellers
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-10 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                100% Authentic
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Nationwide Delivery
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Earn Rewards
              </div>
            </div>
          </div>

          <div className="hidden lg:flex justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 bg-white/10 rounded-3xl" />
              <div className="absolute inset-4 bg-white/10 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💊</div>
                  <div className="text-white font-bold text-xl">
                    USANA Products
                  </div>
                  <div className="text-blue-200 text-sm mt-1">
                    Science. Trust. Health.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
