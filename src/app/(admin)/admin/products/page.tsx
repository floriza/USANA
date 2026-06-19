import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { formatCurrency, buildPaginationMeta } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { Plus, Search } from "lucide-react";
import { FdaToggle } from "@/components/admin/fda-toggle";

export const metadata: Metadata = { title: "Products | Admin" };

interface Props {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page || 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null as null,
    ...(params.status && { status: params.status as never }),
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: "insensitive" as const } },
        { sku: { contains: params.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        _count: { select: { orderItems: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const meta = buildPaginationMeta(total, page, limit);

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    DRAFT: "bg-gray-100 text-gray-700",
    ARCHIVED: "bg-red-100 text-red-700",
    OUT_OF_STOCK: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">{total} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <form>
            <input
              name="search"
              defaultValue={params.search}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>
        <form>
          <select
            name="status"
            defaultValue={params.status}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Product
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Category
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Price
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Stock
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Sold
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                FDA
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">{product.sku}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {product.category.name}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div>
                    {product.salePrice && (
                      <p className="font-medium text-gray-900">
                        {formatCurrency(parseFloat(product.salePrice.toString()))}
                      </p>
                    )}
                    <p
                      className={
                        product.salePrice
                          ? "text-xs text-gray-400 line-through"
                          : "font-medium text-gray-900"
                      }
                    >
                      {formatCurrency(parseFloat(product.price.toString()))}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={
                      product.stockQuantity <= product.criticalThreshold
                        ? "text-red-600 font-semibold"
                        : product.stockQuantity <= product.lowStockThreshold
                          ? "text-yellow-600 font-medium"
                          : "text-gray-700"
                    }
                  >
                    {product.stockQuantity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      STATUS_COLORS[product.status] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {product._count.orderItems}
                </td>
                <td className="px-4 py-3">
                  <FdaToggle
                    productId={product.id}
                    productName={product.name}
                    initialValue={product.isFdaEvaluated}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {!products.length && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta.totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
        </div>
      )}
    </div>
  );
}
