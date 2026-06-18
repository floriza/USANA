import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { paginate, buildPaginationMeta } from "@/lib/utils";

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
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
      isActive = true,
      isFeatured,
      isNewArrival,
      isBestseller,
      minPrice,
      maxPrice,
      inStock,
      sortBy = "newest",
      page = 1,
      limit = 12,
    } = filters;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      status: isActive ? "ACTIVE" : undefined,
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
          where: { isApproved: true },
          include: { user: { select: { name: true, image: true } } },
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
    orderId?: string
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
        data: { stockQuantity: newQuantity },
      });

      await tx.inventoryLog.create({
        data: {
          productId,
          orderId,
          type: type as never,
          quantityBefore: product.stockQuantity,
          quantityChange,
          quantityAfter: newQuantity,
          reason,
        },
      });

      return updated;
    });
  },

  async getFeatured(limit = 8) {
    return prisma.product.findMany({
      where: { isFeatured: true, status: "ACTIVE", deletedAt: null },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      take: limit,
      orderBy: { totalSold: "desc" },
    });
  },

  async getLowStockProducts() {
    return prisma.product.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        lowStockThreshold: true,
        criticalThreshold: true,
      },
      orderBy: { stockQuantity: "asc" },
      take: 20,
    });
  },
};
