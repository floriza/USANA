import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/permissions";
import prisma from "@/lib/db";
import type { UserRole } from "@prisma/client";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(session.user.role as UserRole, "products:write")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, isFdaEvaluated } = body;

    if (!id || typeof isFdaEvaluated !== "boolean") {
      return NextResponse.json(
        { error: "id and isFdaEvaluated (boolean) are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: { isFdaEvaluated },
      select: { id: true, name: true, isFdaEvaluated: true },
    });

    return NextResponse.json({ data: product });
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
