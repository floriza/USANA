import prisma from "@/lib/db";
import type { OrderStatus, Prisma } from "@prisma/client";
import { paginate, buildPaginationMeta } from "@/lib/utils";

export const orderRepository = {
  async findByUser(userId: string, page = 1, limit = 10) {
    const { skip, take } = paginate(page, limit);
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: { select: { slug: true, thumbnail: true } },
            },
          },
          payment: { select: { status: true, paymentMethod: true } },
          shipment: { select: { status: true, trackingNumber: true, courier: true } },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);
    return { orders, meta: buildPaginationMeta(total, page, limit) };
  },

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        address: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                sku: true,
              },
            },
          },
        },
        payment: true,
        shipment: true,
        refunds: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
        coupon: { select: { code: true, type: true, value: true } },
      },
    });
  },

  async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: { user: true, items: true, payment: true, shipment: true },
    });
  },

  async findAll(filters: {
    status?: OrderStatus;
    search?: string;
    page?: number;
    limit?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const { status, search, page = 1, limit = 20, dateFrom, dateTo } = filters;
    const { skip, take } = paginate(page, limit);

    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          payment: { select: { status: true, paymentMethod: true } },
          shipment: { select: { status: true, courier: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, meta: buildPaginationMeta(total, page, limit) };
  },

  async updateStatus(
    id: string,
    status: OrderStatus,
    comment?: string,
    updatedBy?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: {
          status,
          ...(status === "PAID" && { confirmedAt: new Date() }),
          ...(status === "PROCESSING" && { processedAt: new Date() }),
          ...(status === "SHIPPED" && { shippedAt: new Date() }),
          ...(status === "DELIVERED" && { deliveredAt: new Date() }),
          ...(status === "CANCELLED" && { cancelledAt: new Date() }),
        },
      });

      await tx.orderStatusHistory.create({
        data: { orderId: id, status, comment, createdBy: updatedBy },
      });

      return order;
    });
  },

  async getRevenueStats(dateFrom?: Date, dateTo?: Date) {
    const where: Prisma.OrderWhereInput = {
      status: { in: ["PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED"] },
    };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const result = await prisma.order.aggregate({
      where: {
        status: { in: ["PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED"] },
        ...(dateFrom || dateTo
          ? {
              createdAt: {
                ...(dateFrom && { gte: dateFrom }),
                ...(dateTo && { lte: dateTo }),
              },
            }
          : {}),
      },
      _sum: { total: true },
      _count: true,
      _avg: { total: true },
    });

    return {
      total: parseFloat((result._sum.total || 0).toString()),
      count: result._count,
      avg: parseFloat((result._avg.total || 0).toString()),
    };
  },
};
