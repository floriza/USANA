import Link from "next/link";
import prisma from "@/lib/db";
import { CategoryCards } from "./category-cards";

export async function CategoryGrid() {
  const categories = await prisma.category.findMany({
    where: { parentId: null, isActive: true, deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { products: { where: { status: "ACTIVE", deletedAt: null } } },
      },
    },
  });

  if (!categories.length) return null;

  return (
    <section className="container mx-auto px-4 max-w-7xl py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#2D6A4F" }}>
            Collections
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-playfair,serif)", color: "var(--foreground)" }}
          >
            Shop by Category
          </h2>
        </div>
        <Link
          href="/products"
          className="text-sm font-medium hidden sm:inline-flex items-center gap-1 transition-colors"
          style={{ color: "#2D6A4F" }}
        >
          View All &rarr;
        </Link>
      </div>

      <CategoryCards
        categories={categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          productCount: cat._count.products,
        }))}
      />
    </section>
  );
}
