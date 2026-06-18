import { productRepository } from "@/repositories/product.repository";
import { ProductCard } from "@/components/product/product-card";
import Link from "next/link";

export async function FeaturedProducts() {
  const products = await productRepository.getFeatured(8);

  if (!products.length) return null;

  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Products
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Our most popular health and wellness picks
            </p>
          </div>
          <Link
            href="/products?featured=true"
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            View All Featured
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
