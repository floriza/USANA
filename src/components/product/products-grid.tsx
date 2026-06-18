import { productRepository } from "@/repositories/product.repository";
import { ProductCard } from "./product-card";
import { Pagination } from "@/components/ui/pagination";

interface ProductsGridProps {
  params: {
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sortBy?: string;
    page?: string;
    featured?: string;
    newArrival?: string;
    bestseller?: string;
  };
}

export async function ProductsGrid({ params }: ProductsGridProps) {
  const page = Number(params.page || 1);

  const { products, meta } = await productRepository.findMany({
    search: params.search,
    categorySlug: params.category,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    inStock: params.inStock === "true",
    sortBy: params.sortBy as never,
    isFeatured: params.featured === "true" ? true : undefined,
    isNewArrival: params.newArrival === "true" ? true : undefined,
    isBestseller: params.bestseller === "true" ? true : undefined,
    page,
    limit: 12,
  });

  if (!products.length) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🔍</p>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-500 text-sm">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Showing {(page - 1) * 12 + 1}-{Math.min(page * 12, meta.total)} of{" "}
          {meta.total} products
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              ...product,
              price: parseFloat(product.price.toString()),
              salePrice: product.salePrice ? parseFloat(product.salePrice.toString()) : null,
              averageRating: parseFloat(product.averageRating.toString()),
            }}
          />
        ))}
      </div>

      {meta.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
          />
        </div>
      )}
    </div>
  );
}
