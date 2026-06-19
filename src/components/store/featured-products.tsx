import { productRepository } from "@/repositories/product.repository";
import { ProductCard } from "@/components/product/product-card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export async function FeaturedProducts() {
  const products = await productRepository.getFeatured(8);
  if (!products.length) return null;

  return (
    <section className="py-16" style={{ background: "#F2EFE8" }}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#2D6A4F" }}>
              Editor's Pick
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold leading-tight"
              style={{ fontFamily: "var(--font-playfair,serif)", color: "var(--foreground)" }}
            >
              Featured Products
            </h2>
          </div>
          <Link
            href="/products?featured=true"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-200 hover:gap-2.5"
            style={{ color: "#2D6A4F" }}
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                thumbnail: product.thumbnail,
                price: parseFloat(product.price.toString()),
                salePrice: product.salePrice ? parseFloat(product.salePrice.toString()) : null,
                stockQuantity: product.stockQuantity,
                averageRating: parseFloat(product.averageRating.toString()),
                reviewCount: product.reviewCount,
                isBestseller: product.isBestseller,
                isNewArrival: product.isNewArrival,
                isFeatured: product.isFeatured,
                category: product.category ?? undefined,
              }}
            />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products?featured=true"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-2xl transition-colors"
            style={{ background: "#2D6A4F", color: "#fff" }}
          >
            View All Featured <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
