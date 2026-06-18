import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { productRepository } from "@/repositories/product.repository";
import { productSchema } from "@/lib/validations/product";
import { generateSlug, generateSKU } from "@/lib/utils";
import { hasPermission } from "@/lib/auth/permissions";
import { validateAndLog } from "@/lib/compliance/validator";
import prisma from "@/lib/db";
import type { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const result = await productRepository.findMany({
      search: searchParams.get("search") || undefined,
      categorySlug: searchParams.get("category") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      isFeatured:
        searchParams.get("featured") === "true" ? true : undefined,
      isNewArrival:
        searchParams.get("newArrival") === "true" ? true : undefined,
      isBestseller:
        searchParams.get("bestseller") === "true" ? true : undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      inStock: searchParams.get("inStock") === "true" ? true : undefined,
      sortBy: (searchParams.get("sortBy") as never) || undefined,
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 12),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(session.user.role as UserRole, "products:write")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const data = parsed.data;

    // Compliance check
    const contentToCheck = `${data.name} ${data.description} ${data.shortDescription || ""}`;
    const compliance = await validateAndLog(
      "Product",
      "new",
      contentToCheck,
      session.user.id
    );

    if (compliance.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          error: "Content blocked by compliance check",
          violations: compliance.violations,
        },
        { status: 422 }
      );
    }

    const slug = generateSlug(data.name);
    const sku =
      data.sku ||
      generateSKU(
        data.name,
        await prisma.category
          .findUnique({ where: { id: data.categoryId } })
          .then((c) => c?.name || "US")
      );

    const product = await productRepository.create({
      ...data,
      slug,
      sku,
      price: data.price,
      salePrice: data.salePrice ?? undefined,
      costPrice: data.costPrice ?? undefined,
      weight: data.weight ?? undefined,
      lengthCm: data.lengthCm ?? undefined,
      widthCm: data.widthCm ?? undefined,
      heightCm: data.heightCm ?? undefined,
      servingsPerContainer: data.servingsPerContainer ?? undefined,
      category: { connect: { id: data.categoryId } },
      createdBy: { connect: { id: session.user.id } },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entityType: "Product",
        entityId: product.id,
        description: `Created product ${product.name}`,
        newValues: data as object,
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
