import { NextResponse } from "next/server";
// Updated: replaced Prisma with Firestore Admin SDK
import { db, Collections } from "@/lib/prisma";
import { calculateSellingPrice, calculateProfit, getBrandTier, getTierProfitMargin, parseTierMargins, splitProfit } from "@/lib/utils";
import type { OwnerType } from "@/lib/utils";

// Get prices for a specific perfume across all enabled decant sizes
// Updated: all Prisma queries replaced with Firestore reads
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const perfumeId = searchParams.get("perfumeId");

  if (!perfumeId) return NextResponse.json({ error: "perfumeId required" }, { status: 400 });

  // Parallel Firestore reads — fetch all, filter/sort in memory to avoid composite index
  const [perfumeDoc, sizesSnap, bottlesSnap, settingsDoc, bulkSnap] = await Promise.all([
    db.collection(Collections.perfumes).doc(perfumeId).get(),
    db.collection(Collections.decantSizes).get(),
    db.collection(Collections.bottles).get(),
    db.collection(Collections.settings).doc("default").get(),
    db.collection(Collections.bulkPricingRules).get(),
  ]);

  if (!perfumeDoc.exists) return NextResponse.json({ error: "Perfume not found" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const perfume = { id: perfumeDoc.id, ...perfumeDoc.data() } as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sizes = sizesSnap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((s: any) => s.enabled === true).sort((a: any, b: any) => a.ml - b.ml) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bottles = bottlesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = settingsDoc.exists ? settingsDoc.data() as any : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bulkRules = bulkSnap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((r: any) => r.isActive === true).sort((a: any, b: any) => a.minQuantity - b.minQuantity) as any[];

  const packagingCost = settings?.packagingCost ?? 20;
  const margins = parseTierMargins(settings?.tierMargins);

  // Personal collection: market price = purchase price
  const effectiveMarketPricePerMl = perfume.isPersonalCollection
    ? perfume.purchasePricePerMl
    : perfume.marketPricePerMl;

  const fullBottlePrice = effectiveMarketPricePerMl * 100;
  const tier = getBrandTier(fullBottlePrice);
  const owner = (perfume.owner || "Store") as OwnerType;

  const prices = sizes.map((size) => {
    const bottle = bottles.find((b) => b.ml === size.ml);
    const bottleCost = bottle?.costPerBottle ?? 0;
    const profitMargin = getTierProfitMargin(tier, size.ml, margins);
    const sellingPrice = calculateSellingPrice(
      effectiveMarketPricePerMl,
      size.ml,
      bottleCost,
      packagingCost,
      profitMargin,
    );
    const profit = calculateProfit(sellingPrice, perfume.purchasePricePerMl, size.ml, bottleCost, packagingCost);
    const { ownerProfit, platformProfit } = splitProfit(profit, owner);
    const totalCost = perfume.purchasePricePerMl * size.ml + bottleCost + packagingCost;
    const inStock = perfume.totalStockMl >= size.ml;
    const bottleAvailable = bottle ? bottle.availableCount > 0 : false;

    return {
      ml: size.ml,
      sellingPrice,
      totalCost: Math.ceil(totalCost),
      profit,
      ownerProfit,
      platformProfit,
      ownerName: owner,
      bottleCost,
      packagingCost,
      profitMargin,
      tier,
      inStock,
      bottleAvailable,
      available: inStock && bottleAvailable,
    };
  });

  return NextResponse.json({
    perfumeId: perfume.id,
    perfumeName: perfume.name,
    tier,
    owner,
    isPersonalCollection: perfume.isPersonalCollection,
    prices,
    bulkRules: bulkRules.map((r) => ({ minQuantity: r.minQuantity, discountPercent: r.discountPercent })),
  });
}
