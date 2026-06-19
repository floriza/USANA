import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { productRepository } from "@/repositories/product.repository";
import { AddToCartSection } from "@/components/product/add-to-cart-section";
import { ProductImages } from "@/components/product/product-images";
import { ProductAccordion } from "@/components/product/product-accordion";
import { HealthDisclaimer } from "@/components/compliance/health-disclaimer";
import { formatCurrency, calculateDiscountPercent } from "@/lib/utils";
import { Star, Package, Truck, ChevronRight } from "lucide-react";

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
  const salePrice = product.salePrice ? parseFloat(product.salePrice.toString()) : null;
  const discount = salePrice ? calculateDiscountPercent(price, salePrice) : 0;
  const rating = parseFloat(product.averageRating.toString());

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
        ? { "@type": "AggregateRating", ratingValue: rating, reviewCount: product.reviewCount }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 max-w-7xl pt-28 pb-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs mb-8" style={{ color: "var(--muted)" }}>
          <Link href="/" className="hover:underline">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <Link href="/products" className="hover:underline">Products</Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <Link
            href={`/products?category=${product.category.slug}`}
            className="hover:underline"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Images */}
          <ProductImages
            images={product.images}
            thumbnail={product.thumbnail}
            name={product.name}
          />

          {/* Sticky buy box */}
          <div className="lg:sticky lg:top-24">
            {/* Category + badges */}
            <div className="flex items-center flex-wrap gap-2 mb-3">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "#ECFDF5", color: "#2D6A4F" }}
              >
                {product.category.name}
              </span>
              {product.isBestseller && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "#FEFCE8", color: "#854D0E" }}
                >
                  Bestseller
                </span>
              )}
              {product.isNewArrival && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "#EFF6FF", color: "#1D4ED8" }}
                >
                  New Arrival
                </span>
              )}
            </div>

            <h1
              className="text-2xl md:text-3xl font-bold leading-snug mb-3"
              style={{ fontFamily: "var(--font-playfair,serif)", color: "var(--foreground)" }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4"
                      style={{
                        color: i < Math.round(rating) ? "#E9C46A" : "#EAE7DF",
                        fill: i < Math.round(rating) ? "#E9C46A" : "#EAE7DF",
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  {rating.toFixed(1)}
                </span>
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-4">
              <span
                className="text-3xl font-bold"
                style={{ color: "var(--foreground)", fontFamily: "var(--font-playfair,serif)" }}
              >
                {formatCurrency(salePrice || price)}
              </span>
              {salePrice && (
                <>
                  <span className="text-lg line-through" style={{ color: "var(--muted)" }}>
                    {formatCurrency(price)}
                  </span>
                  <span
                    className="text-sm font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: "#FFF5F5", color: "#C53030" }}
                  >
                    -{discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--muted)" }}>
                {product.shortDescription}
              </p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 text-sm mb-2">
              <Package className="w-4 h-4" style={{ color: "var(--muted)" }} />
              {product.stockQuantity > 0 ? (
                <span className="font-medium" style={{ color: "#2D6A4F" }}>
                  In Stock ({product.stockQuantity} available)
                </span>
              ) : (
                <span className="font-medium" style={{ color: "#C53030" }}>Out of Stock</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--muted)" }}>
              <Truck className="w-4 h-4" />
              <span>Free shipping on orders ₱2,000+</span>
            </div>

            {/* Add to cart */}
            <AddToCartSection
              product={{ id: product.id, stockQuantity: product.stockQuantity, slug: product.slug }}
            />

            {/* SKU / FDA */}
            <div
              className="mt-6 pt-5 border-t space-y-1 text-xs"
              style={{ borderColor: "#EAE7DF", color: "var(--muted)" }}
            >
              <p>SKU: <span style={{ color: "var(--foreground)" }}>{product.sku}</span></p>
              {product.fdaRegistrationNo && (
                <p>FDA Registration: <span style={{ color: "var(--foreground)" }}>{product.fdaRegistrationNo}</span></p>
              )}
              <p>Brand: <span style={{ color: "var(--foreground)" }}>{product.brand}</span></p>
            </div>
          </div>
        </div>

        {/* Accordion sections */}
        <div className="mt-12">
          <ProductAccordion
            description={product.description}
            supplementInfo={{
              servingSize: product.servingSize,
              servingsPerContainer: product.servingsPerContainer,
              ingredients: product.ingredients,
              directions: product.directions,
              warnings: product.warnings,
              storageInstructions: product.storageInstructions,
            }}
            reviews={product.reviews.map((r) => ({
              id: r.id,
              rating: r.rating,
              title: r.title,
              body: r.body,
              isVerified: r.isVerified,
              user: { name: r.user.name },
            }))}
          />
          <div className="mt-6">
            <HealthDisclaimer
              variant="inline"
              showDisclaimer={!product.isFdaEvaluated}
            />
          </div>
        </div>
      </div>
    </>
  );
}
