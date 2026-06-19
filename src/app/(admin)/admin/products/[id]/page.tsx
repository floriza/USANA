import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import prisma from "@/lib/db";
import { productRepository } from "@/repositories/product.repository";
import { ProductEditForm } from "@/components/admin/product-edit-form";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await productRepository.findById(id);
  return { title: product ? `Edit: ${product.name} | Admin` : "Product Not Found | Admin" };
}

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    productRepository.findById(id),
    prisma.category.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs mb-6" style={{ color: "var(--muted)" }}>
        <Link href="/admin/products" className="hover:underline">Products</Link>
        <ChevronRight className="w-3 h-3 opacity-50" />
        <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{product.name}</span>
      </nav>

      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-playfair,serif)", color: "var(--foreground)" }}
        >
          Edit Product
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          SKU: {product.sku} · Last updated: {new Date(product.updatedAt).toLocaleDateString("en-PH", { dateStyle: "medium" })}
        </p>
      </div>

      <ProductEditForm
        product={{
          id: product.id,
          name: product.name,
          sku: product.sku,
          description: product.description,
          shortDescription: product.shortDescription,
          brand: product.brand,
          categoryId: product.categoryId,
          price: product.price.toString(),
          salePrice: product.salePrice?.toString() ?? null,
          costPrice: product.costPrice?.toString() ?? null,
          stockQuantity: product.stockQuantity,
          weight: product.weight?.toString() ?? null,
          lengthCm: product.lengthCm?.toString() ?? null,
          widthCm: product.widthCm?.toString() ?? null,
          heightCm: product.heightCm?.toString() ?? null,
          status: product.status,
          isFeatured: product.isFeatured,
          isNewArrival: product.isNewArrival,
          isBestseller: product.isBestseller,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          metaKeywords: product.metaKeywords,
          lowStockThreshold: product.lowStockThreshold,
          criticalThreshold: product.criticalThreshold,
          fdaRegistrationNo: product.fdaRegistrationNo,
          isFdaEvaluated: product.isFdaEvaluated,
          ingredients: product.ingredients,
          directions: product.directions,
          warnings: product.warnings,
          storageInstructions: product.storageInstructions,
          servingSize: product.servingSize,
          servingsPerContainer: product.servingsPerContainer,
        }}
        categories={categories}
      />
    </div>
  );
}
