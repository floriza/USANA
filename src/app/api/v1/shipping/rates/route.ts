import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") || "";
  const weight = parseFloat(searchParams.get("weight") || "0.3");

  const zone =
    region.toLowerCase().includes("metro manila") || region.toLowerCase().includes("ncr")
      ? "METRO_MANILA"
      : region.toLowerCase().includes("cebu") ||
        region.toLowerCase().includes("iloilo") ||
        region.toLowerCase().includes("visayas")
      ? "VISAYAS"
      : region.toLowerCase().includes("davao") ||
        region.toLowerCase().includes("cagayan") ||
        region.toLowerCase().includes("mindanao")
      ? "MINDANAO"
      : "LUZON";

  try {
    const rates = await prisma.shippingRate.findMany({
      where: { zone: zone as never, isActive: true },
      orderBy: { baseRate: "asc" },
    });

    const ratesWithFee = rates.map((rate) => ({
      ...rate,
      baseRate: rate.baseRate.toString(),
      ratePerKg: rate.ratePerKg.toString(),
      fee: (
        parseFloat(rate.baseRate.toString()) +
        parseFloat(rate.ratePerKg.toString()) * weight
      ).toFixed(2),
    }));

    return NextResponse.json({ data: ratesWithFee });
  } catch {
    return NextResponse.json({ error: "Failed to fetch shipping rates" }, { status: 500 });
  }
}
