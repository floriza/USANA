import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { productRepository } from "@/repositories/product.repository";
import { AddToCartSection } from "@/components/product/add-to-cart-section";
import { ProductImages } from "@/components/product/product-images";
import { HealthDisclaimer } from "@/components/compliance/health-disclaimer";
import { formatCurrency, calculateDiscountPercent } from "@/lib/utils";
import { Star, Package, Truck } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await productRepository.findBySlug(slug);

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.seoTitle || product.name,
    description:
      product.seoDescription || product.shortDescription || product.description.slice(0, 160),
    keywords: product.metaKeywords || undefined,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description.slice(0, 160),
      images: product.thumbnail ? [{ url: product.thumbnail }] : [],
      type: "website",
    },
    other: {
      "product:price:amount": product.salePrice?.toString() || product.price.toString(),
      "product:price:currency": "PHP",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await productRepository.findBySlug(slug);

  if (!product) notFound();

  const price = parseFloat(product.price.toString());
  const salePrice = product.salePrice
    ? parseFloat(product.salePrice.toString())
    : null;
  const discount = salePrice ? calculateDiscountPercent(price, salePrice) : 0;
  const rating = parseFloat(product.averageRating.toString());

  // Structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    image: product.thumbnail,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      price: salePrice || price,
      priceCurrency: "PHP",
      availability:
        product.stockQuantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "USANA Store Philippines" },
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span>{product.category.name}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <ProductImages
            images={product.images}
            thumbnail={product.thumbnail}
            name={product.name}
          />

          {/* Product info */}
          <div>
            <div className="mb-2">
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {product.category.name}
              </span>
              {product.isBestseller && (
                <span className="ml-2 text-xs font-medium text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">
                  Bestseller
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-200 fill-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(salePrice || price)}
              </span>
              {salePrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatCurrency(price)}
                  </span>
                  <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                    -{discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {product.shortDescription}
              </p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 text-sm mb-6">
              <Package className="w-4 h-4 text-gray-400" />
              {product.stockQuantity > 0 ? (
                <span className="text-green-600 font-medium">
                  In Stock ({product.stockQuantity} available)
                </span>
              ) : (
                <span className="text-red-500 font-medium">Out of Stock</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Truck className="w-4 h-4" />
              <span>Free shipping on orders ₱2,000+</span>
            </div>

            {/* Add to cart */}
            <AddToCartSection product={{ id: product.id, stockQuantity: product.stockQuantity, slug: product.slug }} />

            {/* FDA / SKU info */}
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-1 text-xs text-gray-500">
              <p>SKU: {product.sku}</p>
              {product.fdaRegistrationNo && (
                <p>FDA Registration: {product.fdaRegistrationNo}</p>
              )}
              <p>Brand: {product.brand}</p>
            </div>
          </div>
        </div>

        {/* Product details tabs */}
        <div className="mt-12 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">
              Product Description
            </h2>
            <div
              className="prose prose-sm text-gray-600 max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>

          {/* Supplement facts */}
          {(product.ingredients ||
            product.directions ||
            product.warnings ||
            product.servingSize) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">
                Supplement Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.servingSize && (
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm mb-2">
                      Serving Information
                    </h3>
                    <p className="text-sm text-gray-600">
                      Serving Size: {product.servingSize}
                    </p>
                    {product.servingsPerContainer && (
                      <p className="text-sm text-gray-600">
                        Servings per container: {product.servingsPerContainer}
                      </p>
                    )}
                  </div>
                )}
                {product.ingredients && (
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm mb-2">
                      Ingredients
                    </h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {product.ingredients}
                    </p>
                  </div>
                )}
                {product.directions && (
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm mb-2">
                      Directions for Use
                    </h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {product.directions}
                    </p>
                  </div>
                )}
                {product.warnings && (
                  <div>
                    <h3 className="font-semibold text-red-700 text-sm mb-2">
                      Warnings
                    </h3>
                    <p className="text-sm text-red-700 whitespace-pre-wrap">
                      {product.warnings}
                    </p>
                  </div>
                )}
                {product.storageInstructions && (
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm mb-2">
                      Storage Instructions
                    </h3>
                    <p className="text-sm text-gray-600">
                      {product.storageInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Health Disclaimer */}
          <HealthDisclaimer variant="inline" />

          {/* Reviews */}
          {product.reviews.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">
                Customer Reviews
              </h2>
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-200 fill-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {review.user.name || "Customer"}
                      </span>
                      {review.isVerified && (
                        <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    {review.title && (
                      <p className="font-medium text-gray-900 text-sm mb-1">
                        {review.title}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">{review.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
