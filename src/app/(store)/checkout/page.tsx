import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Checkout | USANA Supplements Store",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const [cart, addresses, pointsAccount, rewardSettings] = await Promise.all([
    prisma.cart.findUnique({
      where: { userId: session.user.id },
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
                weight: true,
                sku: true,
              },
            },
          },
        },
      },
    }),
    prisma.address.findMany({
      where: { userId: session.user.id, deletedAt: null },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
    prisma.rewardPointsAccount.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.rewardSettings.findFirst(),
  ]);

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const serializedCart = {
    ...cart,
    items: cart.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        price: item.product.price.toString(),
        salePrice: item.product.salePrice?.toString() ?? null,
        weight: item.product.weight?.toString() ?? null,
      },
    })),
  };

  return (
    <CheckoutFlow
      cart={serializedCart}
      addresses={addresses}
      pointsBalance={pointsAccount?.balance ?? 0}
      pointsPerPeso={rewardSettings ? parseFloat(rewardSettings.pesoPerPoint.toString()) : 0}
    />
  );
}
