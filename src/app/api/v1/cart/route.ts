import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (userId) {
    return prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                price: true,
                salePrice: true,
                stockQuantity: true,
                reservedQuantity: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  if (sessionId) {
    return prisma.cart.upsert({
      where: { sessionId },
      create: { sessionId },
      update: {},
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                price: true,
                salePrice: true,
                stockQuantity: true,
                reservedQuantity: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  throw new Error("User or session required");
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const sessionId = req.cookies.get("cart_session")?.value;

    const cart = await getOrCreateCart(
      session?.user?.id,
      session?.user ? undefined : sessionId
    );

    const subtotal = cart.items.reduce((sum, item) => {
      const price = parseFloat(
        (item.product.salePrice || item.product.price).toString()
      );
      return sum + price * item.quantity;
    }, 0);

    return NextResponse.json({
      success: true,
      data: { ...cart, subtotal },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const sessionId = req.cookies.get("cart_session")?.value;
    const body = await req.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, status: "ACTIVE", deletedAt: null },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const available =
      product.stockQuantity - product.reservedQuantity;
    if (available < quantity) {
      return NextResponse.json(
        { error: `Only ${available} units available` },
        { status: 400 }
      );
    }

    const cart = await getOrCreateCart(
      session?.user?.id,
      session?.user ? undefined : sessionId
    );

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    const newQuantity = (existingItem?.quantity || 0) + quantity;
    if (newQuantity > available) {
      return NextResponse.json(
        { error: `Only ${available} units available` },
        { status: 400 }
      );
    }

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: {
        cartId: cart.id,
        productId,
        quantity,
        price: product.salePrice || product.price,
      },
      update: { quantity: newQuantity },
    });

    const updatedCart = await getOrCreateCart(
      session?.user?.id,
      session?.user ? undefined : sessionId
    );

    const response = NextResponse.json({
      success: true,
      data: updatedCart,
    });

    if (!session?.user && !sessionId) {
      const { nanoid } = await import("nanoid");
      response.cookies.set("cart_session", nanoid(), {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const sessionId = req.cookies.get("cart_session")?.value;
    const { searchParams } = req.nextUrl;
    const itemId = searchParams.get("itemId");

    const cart = await getOrCreateCart(
      session?.user?.id,
      session?.user ? undefined : sessionId
    );

    if (itemId) {
      await prisma.cartItem.delete({
        where: { id: itemId, cartId: cart.id },
      });
    } else {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return NextResponse.json({ success: true, message: "Item removed" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
