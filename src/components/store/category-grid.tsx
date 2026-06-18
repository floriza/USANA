import Link from "next/link";
import prisma from "@/lib/db";

const CATEGORY_ICONS: Record<string, string> = {
  supplements: "💊",
  nutritionals: "🥗",
  "shakes-and-weight-management": "⚖️",
  "healthy-living": "🌿",
  "personal-care": "🧴",
  "skin-care": "✨",
};

export async function CategoryGrid() {
  const categories = await prisma.category.findMany({
    where: { parentId: null, isActive: true, deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { status: "ACTIVE", deletedAt: null } } } } },
  });

  if (!categories.length) return null;

  return (
    <section className="container mx-auto px-4 max-w-7xl py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-gray-500 text-sm mt-1">
            Find the right product for your health goals
          </p>
        </div>
        <Link href="/products" className="text-blue-600 text-sm font-medium hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl mb-3 group-hover:bg-blue-100 transition-colors">
              {CATEGORY_ICONS[cat.slug] || "🛒"}
            </div>
            <span className="text-sm font-medium text-gray-800 text-center group-hover:text-blue-600 transition-colors">
              {cat.name}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">
              {cat._count.products} products
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
