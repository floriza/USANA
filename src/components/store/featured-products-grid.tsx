"use client";

import { StaggerGrid, StaggerItem } from "@/components/motion/scroll-reveal";
import { ProductCard } from "@/components/product/product-card";

interface Product {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  averageRating: number;
  reviewCount: number;
  isBestseller: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  category?: { name: string; slug: string };
}

export function FeaturedProductsGrid({ products }: { products: Product[] }) {
  return (
    <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} />
        </StaggerItem>
      ))}
    </StaggerGrid>
  );
}
