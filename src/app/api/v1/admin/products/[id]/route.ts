import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { productRepository } from "@/repositories/product.repository";
import { productSchema } from "@/lib/validations/product";
import type { UserRole } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(session.user.role as UserRole, "products:write")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const product = await productRepository.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(session.user.role as UserRole, "products:write")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await productRepository.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      price,
      salePrice,
      costPrice,
      weight,
      lengthCm,
      widthCm,
      heightCm,
      servingsPerContainer,
      ...rest
    } = parsed.data;

    const product = await productRepository.update(id, {
      ...rest,
      price,
      salePrice: salePrice ?? null,
      costPrice: costPrice ?? null,
      weight: weight ?? null,
      lengthCm: lengthCm ?? null,
      widthCm: widthCm ?? null,
      heightCm: heightCm ?? null,
      servingsPerContainer: servingsPerContainer ?? null,
      updatedBy: { connect: { id: session.user.id } },
    });

    return NextResponse.json({ data: product });
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
