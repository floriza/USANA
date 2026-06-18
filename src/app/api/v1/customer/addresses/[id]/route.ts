import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addressSchema } from "@/lib/validations/order";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const data = addressSchema.parse(body);

    const address = await prisma.$transaction(async (tx) => {
      const existing = await tx.address.findFirst({
        where: { id, userId: session.user.id, deletedAt: null },
      });
      if (!existing) throw new Error("Address not found");

      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: session.user.id, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return tx.address.update({ where: { id }, data });
    });

    return NextResponse.json({ data: address });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.address.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  await prisma.address.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
