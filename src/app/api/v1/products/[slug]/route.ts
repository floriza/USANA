import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { productRepository } from "@/repositories/product.repository";
import { productSchema } from "@/lib/validations/product";
import { hasPermission } from "@/lib/auth/permissions";
import { validateAndLog } from "@/lib/compliance/validator";
import prisma from "@/lib/db";
import type { UserRole } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await productRepository.findBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Increment view count (fire and forget)
    prisma.product
      .update({ where: { id: product.id }, data: { totalViews: { increment: 1 } } })
      .catch(() => {});

    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(session.user.role as UserRole, "products:write")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const data = parsed.data;

    if (data.name || data.description) {
      const contentToCheck = `${data.name || product.name} ${data.description || product.description}`;
      const compliance = await validateAndLog(
        "Product",
        product.id,
        contentToCheck,
        session.user.id,
        product.id
      );

      if (compliance.isBlocked) {
        return NextResponse.json(
          {
            error: "Content blocked by compliance check",
            violations: compliance.violations,
          },
          { status: 422 }
        );
      }
    }

    const updated = await productRepository.update(product.id, {
      ...data,
      updatedBy: { connect: { id: session.user.id } },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entityType: "Product",
        entityId: product.id,
        description: `Updated product ${product.name}`,
        oldValues: product as object,
        newValues: data as object,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(session.user.role as UserRole, "products:delete")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await productRepository.softDelete(product.id);

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entityType: "Product",
        entityId: product.id,
        description: `Deleted product ${product.name}`,
      },
    });

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
