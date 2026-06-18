import prisma from "@/lib/db";
import type { ProductStatus, Prisma } from "@prisma/client";
import { paginate, buildPaginationMeta } from "@/lib/utils";

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  status?: ProductStatus;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  brand?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "popular" | "rating";
  page?: number;
  limit?: number;
}

export const productRepository = {
  async findMany(filters: ProductFilters = {}) {
    const {
      search,
      categoryId,
      categorySlug,
      status = "ACTIVE",
      isFeatured,
      isNewArrival,
      isBestseller,
      minPrice,
      maxPrice,
      inStock,
      brand,
      sortBy = "newest",
      page = 1,
      limit = 12,
    } = filters;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      status,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (categorySlug) where.category = { slug: categorySlug };
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isNewArrival !== undefined) where.isNewArrival = isNewArrival;
    if (isBestseller !== undefined) where.isBestseller = isBestseller;
    if (brand) where.brand = brand;
    if (inStock) where.stockQuantity = { gt: 0 };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sortBy === "price_asc"
        ? { price: "asc" }
        : sortBy === "price_desc"
          ? { price: "desc" }
          : sortBy === "popular"
            ? { totalSold: "desc" }
            : sortBy === "rating"
              ? { averageRating: "desc" }
              : { createdAt: "desc" };

    const { skip, take } = paginate(page, limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, meta: buildPaginationMeta(total, page, limit) };
  },

  async findBySlug(slug: string) {
    return prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        reviews: {
          where: { status: "PUBLISHED", deletedAt: null },
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });
  },

  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data, include: { category: true } });
  },

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), status: "ARCHIVED" },
    });
  },

  async adjustStock(
    productId: string,
    quantityChange: number,
    type: string,
    reason?: string,
    orderId?: string,
    userId?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { stockQuantity: true },
      });

      if (!product) throw new Error("Product not found");

      const newQuantity = product.stockQuantity + quantityChange;
      if (newQuantity < 0) throw new Error("Insufficient stock");

      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          stockQuantity: newQuantity,
          status: newQuantity === 0 ? "OUT_OF_STOCK" : undefined,
        },
      });

      await tx.inventoryLog.create({
        data: {
          productId,
          orderId,
          userId,
          type,
          quantityBefore: product.stockQuantity,
          quantityChange,
          quantityAfter: newQuantity,
          reason,
          reference: orderId,
        },
      });

      return updated;
    });
  },

  async getFeatured(limit = 8) {
    return prisma.product.findMany({
      where: { isFeatured: true, status: "ACTIVE", deletedAt: null },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      take: limit,
      orderBy: { sortOrder: "asc" },
    });
  },

  async getLowStockProducts() {
    return prisma.$queryRaw<
      Array<{ id: string; name: string; sku: string; stockQuantity: number; lowStockThreshold: number; criticalThreshold: number }>
    >`
      SELECT id, name, sku, "stockQuantity", "lowStockThreshold", "criticalThreshold"
      FROM "Product"
      WHERE "deletedAt" IS NULL
        AND status = 'ACTIVE'
        AND "stockQuantity" <= "lowStockThreshold"
      ORDER BY "stockQuantity" ASC
    `;
  },
};
