import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { validateContent } from "@/lib/compliance/validator";
import prisma from "@/lib/db";
import type { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(session.user.role as UserRole, "compliance:read")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const type = searchParams.get("type");

    if (type === "violations") {
      const violations = await prisma.complianceCheck.findMany({
        where: { isBlocked: true },
        orderBy: { checkedAt: "desc" },
        take: 50,
        include: { product: { select: { name: true, slug: true } } },
      });
      return NextResponse.json({ success: true, data: violations });
    }

    if (type === "phrases") {
      const phrases = await prisma.complianceBannedPhrase.findMany({
        where: { isActive: true },
        orderBy: { severity: "asc" },
      });
      return NextResponse.json({ success: true, data: phrases });
    }

    if (type === "disclaimers") {
      const disclaimers = await prisma.complianceDisclaimer.findMany();
      return NextResponse.json({ success: true, data: disclaimers });
    }

    // Dashboard summary
    const [blocked, critical, warnings, pendingReviews] = await Promise.all([
      prisma.complianceCheck.count({ where: { isBlocked: true } }),
      prisma.complianceCheck.count({ where: { severity: "CRITICAL" } }),
      prisma.complianceCheck.count({ where: { severity: "WARNING" } }),
      prisma.review.count({ where: { status: "PENDING_REVIEW" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { blocked, critical, warnings, pendingReviews },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(session.user.role as UserRole, "compliance:read")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const result = await validateContent(content);
    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
