import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Settings ─────────────────────────────────────────
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      profitMargin: 20,
      packagingCost: 20,
      currency: "BDT",
      lowStockAlertMl: 20,
    },
  });
  console.log("  ✓ Settings");

  // ─── Decant Sizes ────────────────────────────────────
  const sizes = [3, 5, 10, 15, 30];
  for (const ml of sizes) {
    await prisma.decantSize.upsert({
      where: { ml },
      update: {},
      create: { ml, enabled: true },
    });
  }
  console.log("  ✓ Decant sizes (3, 5, 10, 15, 30 ml)");

  // ─── Bottle Inventory ────────────────────────────────
  const bottles = [
    { ml: 3, costPerBottle: 15, availableCount: 100, lowStockThreshold: 20 },
    { ml: 5, costPerBottle: 20, availableCount: 80, lowStockThreshold: 20 },
    { ml: 10, costPerBottle: 30, availableCount: 60, lowStockThreshold: 15 },
    { ml: 15, costPerBottle: 40, availableCount: 40, lowStockThreshold: 10 },
    { ml: 30, costPerBottle: 60, availableCount: 30, lowStockThreshold: 10 },
  ];
  for (const b of bottles) {
    await prisma.bottleInventory.upsert({
      where: { ml: b.ml },
      update: {},
      create: b,
    });
  }
  console.log("  ✓ Bottle inventory");

  // ─── Perfumes ────────────────────────────────────────
  const perfumes = [
    {
      name: "Midnight Oud",
      brand: "Valore Parfums",
      inspiredBy: "Tom Ford Oud Wood",
      category: "Unisex",
      description: "A luxurious blend of rare oud wood, sandalwood, and vetiver. This captivating fragrance opens with a burst of cardamom and Sichuan pepper, settling into warm notes of tonka bean and amber.",
      marketPricePerMl: 45,
      totalStockMl: 200,
      isActive: true,
    },
    {
      name: "Velvet Rose",
      brand: "Valore Parfums",
      inspiredBy: "MFK Baccarat Rouge 540",
      category: "Women",
      description: "An opulent floral masterpiece featuring Bulgarian rose, jasmine sambac, and saffron. The dry-down reveals creamy sandalwood and amber, creating an unforgettable trail.",
      marketPricePerMl: 55,
      totalStockMl: 150,
      isActive: true,
    },
    {
      name: "Royal Amber",
      brand: "Valore Parfums",
      inspiredBy: "Creed Aventus",
      category: "Men",
      description: "A bold and sophisticated composition of bergamot, blackcurrant, and pineapple over a heart of birch, patchouli, and Moroccan jasmine. An icon of modern masculine luxury.",
      marketPricePerMl: 50,
      totalStockMl: 180,
      isActive: true,
    },
    {
      name: "Silk Musk",
      brand: "Valore Parfums",
      inspiredBy: "Byredo Gypsy Water",
      category: "Unisex",
      description: "A dreamy, bohemian fragrance with fresh bergamot, lemon, and juniper berries leading into pine needles, incense, and vanilla. Soft and free-spirited.",
      marketPricePerMl: 40,
      totalStockMl: 120,
      isActive: true,
    },
    {
      name: "Noir Leather",
      brand: "Valore Parfums",
      inspiredBy: "PDM Layton",
      category: "Men",
      description: "An intense leather fragrance blending Italian bergamot, lavender, and geranium with a deep base of vanilla, cardamom, and smooth leather accord.",
      marketPricePerMl: 48,
      totalStockMl: 160,
      isActive: true,
    },
    {
      name: "Golden Iris",
      brand: "Valore Parfums",
      inspiredBy: "Dior Privée Oud Ispahan",
      category: "Women",
      description: "A mesmerising iris and rose combination, enriched with saffron and labdanum. Powdery elegance meets oriental warmth in a luxurious composition.",
      marketPricePerMl: 52,
      totalStockMl: 90,
      isActive: true,
    },
    {
      name: "Cedar & Spice",
      brand: "Valore Parfums",
      inspiredBy: "Le Labo Santal 33",
      category: "Unisex",
      description: "Warm cedarwood, cardamom, and iris form the heart of this distinctive fragrance. Australian sandalwood and papyrus create a creamy, earthy dry-down.",
      marketPricePerMl: 42,
      totalStockMl: 140,
      isActive: true,
    },
    {
      name: "Jasmine Noir",
      brand: "Valore Parfums",
      inspiredBy: "Chanel Coco Mademoiselle",
      category: "Women",
      description: "A vibrant and sophisticated blend of fresh orange, jasmine, and rose with a sensual base of patchouli, vetiver, and white musk. Timeless femininity.",
      marketPricePerMl: 38,
      totalStockMl: 0,
      isActive: true,
    },
  ];

  for (const p of perfumes) {
    const exists = await prisma.perfume.findFirst({ where: { name: p.name } });
    if (!exists) {
      await prisma.perfume.create({ data: p });
    }
  }
  console.log("  ✓ Perfumes (8 sample entries)");

  // ─── Vouchers ────────────────────────────────────────
  const voucherExists = await prisma.voucher.findUnique({ where: { code: "WELCOME10" } });
  if (!voucherExists) {
    await prisma.voucher.create({
      data: {
        code: "WELCOME10",
        discountType: "percentage",
        discountValue: 10,
        minOrderValue: 200,
        usageLimit: 50,
        firstOrderOnly: true,
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    });
  }
  const voucherExists2 = await prisma.voucher.findUnique({ where: { code: "FLAT50" } });
  if (!voucherExists2) {
    await prisma.voucher.create({
      data: {
        code: "FLAT50",
        discountType: "fixed",
        discountValue: 50,
        minOrderValue: 500,
        usageLimit: 100,
        isActive: true,
      },
    });
  }
  console.log("  ✓ Vouchers (WELCOME10, FLAT50)");

  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
