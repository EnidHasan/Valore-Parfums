/**
 * Migration script: SQLite (Prisma) → Firestore
 *
 * Reads every table from the existing SQLite database via Prisma
 * and writes it into the matching Firestore collection, preserving
 * all original IDs and timestamps.
 *
 * Usage:
 *   npx tsx scripts/migrate-to-firebase.ts
 *
 * Prerequisites:
 *   - .env must have FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *   - SQLite dev.db must still be in place (DATABASE_URL="file:./dev.db")
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// ─── Firebase init ─────────────────────────────────────
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ─── Prisma (source) ──────────────────────────────────
const prisma = new PrismaClient();

// Helper: convert JS Date → Firestore Timestamp
function toTs(d: Date | null | undefined): Timestamp | null {
  return d ? Timestamp.fromDate(new Date(d)) : null;
}

// Batch-write helper (Firestore max 500 ops per batch)
async function batchWrite(
  collection: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  docs: { id: string; data: Record<string, any> }[],
) {
  const BATCH_SIZE = 400; // leave some headroom
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = docs.slice(i, i + BATCH_SIZE);
    for (const doc of chunk) {
      batch.set(db.collection(collection).doc(doc.id), doc.data);
    }
    await batch.commit();
    console.log(`  → ${collection}: wrote ${Math.min(i + BATCH_SIZE, docs.length)}/${docs.length}`);
  }
}

async function migrate() {
  console.log("═══════════════════════════════════════════");
  console.log("  SQLite → Firestore Migration");
  console.log("═══════════════════════════════════════════\n");

  // ─── 1. Perfumes ─────────────────────────────────────
  console.log("[1/11] Migrating Perfumes...");
  const perfumes = await prisma.perfume.findMany();
  await batchWrite(
    "perfumes",
    perfumes.map((p) => ({
      id: p.id,
      data: {
        name: p.name,
        brand: p.brand,
        inspiredBy: p.inspiredBy,
        description: p.description,
        category: p.category,
        season: p.season,
        images: p.images,
        marketPricePerMl: p.marketPricePerMl,
        purchasePricePerMl: p.purchasePricePerMl,
        totalStockMl: p.totalStockMl,
        lowStockThreshold: p.lowStockThreshold,
        isActive: p.isActive,
        isBestSeller: p.isBestSeller,
        owner: p.owner,
        isPersonalCollection: p.isPersonalCollection,
        createdAt: toTs(p.createdAt),
        updatedAt: toTs(p.updatedAt),
      },
    })),
  );
  console.log(`  ✓ ${perfumes.length} perfumes migrated\n`);

  // ─── 2. Decant Sizes ────────────────────────────────
  console.log("[2/11] Migrating Decant Sizes...");
  const sizes = await prisma.decantSize.findMany();
  await batchWrite(
    "decantSizes",
    sizes.map((s) => ({
      id: s.id,
      data: {
        ml: s.ml,
        enabled: s.enabled,
        createdAt: toTs(s.createdAt),
      },
    })),
  );
  console.log(`  ✓ ${sizes.length} decant sizes migrated\n`);

  // ─── 3. Bottle Inventory ────────────────────────────
  console.log("[3/11] Migrating Bottle Inventory...");
  const bottles = await prisma.bottleInventory.findMany();
  await batchWrite(
    "bottles",
    bottles.map((b) => ({
      id: b.id,
      data: {
        ml: b.ml,
        costPerBottle: b.costPerBottle,
        availableCount: b.availableCount,
        lowStockThreshold: b.lowStockThreshold,
        createdAt: toTs(b.createdAt),
        updatedAt: toTs(b.updatedAt),
      },
    })),
  );
  console.log(`  ✓ ${bottles.length} bottles migrated\n`);

  // ─── 4. Settings ────────────────────────────────────
  console.log("[4/11] Migrating Settings...");
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  if (settings) {
    await db.collection("settings").doc("default").set({
      profitMargin: settings.profitMargin,
      packagingCost: settings.packagingCost,
      platformFees: settings.platformFees,
      tierMargins: settings.tierMargins,
      currency: settings.currency,
      lowStockAlertMl: settings.lowStockAlertMl,
      owner1Name: settings.owner1Name,
      owner2Name: settings.owner2Name,
      owner1Share: settings.owner1Share,
      owner2Share: settings.owner2Share,
    });
    console.log("  ✓ Settings migrated\n");
  } else {
    console.log("  ⚠ No settings found, skipping\n");
  }

  // ─── 5. Bulk Pricing Rules ──────────────────────────
  console.log("[5/11] Migrating Bulk Pricing Rules...");
  const rules = await prisma.bulkPricingRule.findMany();
  await batchWrite(
    "bulkPricingRules",
    rules.map((r) => ({
      id: r.id,
      data: {
        minQuantity: r.minQuantity,
        discountPercent: r.discountPercent,
        isActive: r.isActive,
        createdAt: toTs(r.createdAt),
      },
    })),
  );
  console.log(`  ✓ ${rules.length} bulk pricing rules migrated\n`);

  // ─── 6. Orders + OrderItems ─────────────────────────
  console.log("[6/11] Migrating Orders + OrderItems...");
  const orders = await prisma.order.findMany({ include: { items: true } });
  // Orders as top-level docs, items as subcollection
  for (const o of orders) {
    await db.collection("orders").doc(o.id).set({
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerEmail: o.customerEmail,
      pickupMethod: o.pickupMethod,
      status: o.status,
      voucherCode: o.voucherCode,
      discount: o.discount,
      subtotal: o.subtotal,
      total: o.total,
      profit: o.profit,
      createdAt: toTs(o.createdAt),
      updatedAt: toTs(o.updatedAt),
    });
    // OrderItems as subcollection under the order
    for (const item of o.items) {
      await db.collection("orders").doc(o.id).collection("items").doc(item.id).set({
        perfumeId: item.perfumeId,
        perfumeName: item.perfumeName,
        ml: item.ml,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        costPrice: item.costPrice,
        ownerName: item.ownerName,
        ownerProfit: item.ownerProfit,
        platformProfit: item.platformProfit,
      });
    }
  }
  const totalItems = orders.reduce((s, o) => s + o.items.length, 0);
  console.log(`  ✓ ${orders.length} orders + ${totalItems} items migrated\n`);

  // ─── 7. Vouchers ────────────────────────────────────
  console.log("[7/11] Migrating Vouchers...");
  const vouchers = await prisma.voucher.findMany();
  await batchWrite(
    "vouchers",
    vouchers.map((v) => ({
      id: v.id,
      data: {
        code: v.code,
        discountType: v.discountType,
        discountValue: v.discountValue,
        minOrderValue: v.minOrderValue,
        usageLimit: v.usageLimit,
        usedCount: v.usedCount,
        firstOrderOnly: v.firstOrderOnly,
        expiresAt: toTs(v.expiresAt),
        isActive: v.isActive,
        createdAt: toTs(v.createdAt),
      },
    })),
  );
  console.log(`  ✓ ${vouchers.length} vouchers migrated\n`);

  // ─── 8. Stock Requests ──────────────────────────────
  console.log("[8/11] Migrating Stock Requests...");
  const requests = await prisma.stockRequest.findMany();
  await batchWrite(
    "stockRequests",
    requests.map((r) => ({
      id: r.id,
      data: {
        perfumeId: r.perfumeId,
        perfumeName: r.perfumeName,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        desiredMl: r.desiredMl,
        quantity: r.quantity,
        status: r.status,
        createdAt: toTs(r.createdAt),
      },
    })),
  );
  console.log(`  ✓ ${requests.length} stock requests migrated\n`);

  // ─── 9. Users ───────────────────────────────────────
  console.log("[9/11] Migrating Users...");
  const users = await prisma.user.findMany();
  await batchWrite(
    "users",
    users.map((u) => ({
      id: u.id,
      data: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash: u.passwordHash,
        role: u.role,
        createdAt: toTs(u.createdAt),
        updatedAt: toTs(u.updatedAt),
      },
    })),
  );
  console.log(`  ✓ ${users.length} users migrated\n`);

  // ─── 10. Wishlists ──────────────────────────────────
  console.log("[10/11] Migrating Wishlists...");
  const wishlists = await prisma.wishlist.findMany();
  await batchWrite(
    "wishlists",
    wishlists.map((w) => ({
      id: w.id,
      data: {
        userId: w.userId,
        perfumeId: w.perfumeId,
        createdAt: toTs(w.createdAt),
      },
    })),
  );
  console.log(`  ✓ ${wishlists.length} wishlists migrated\n`);

  // ─── 11. Notifications ─────────────────────────────
  console.log("[11/11] Migrating Notifications...");
  const notifications = await prisma.notification.findMany();
  await batchWrite(
    "notifications",
    notifications.map((n) => ({
      id: n.id,
      data: {
        message: n.message,
        isActive: n.isActive,
        sortOrder: n.sortOrder,
        createdAt: toTs(n.createdAt),
      },
    })),
  );
  console.log(`  ✓ ${notifications.length} notifications migrated\n`);

  // ─── Summary ────────────────────────────────────────
  console.log("═══════════════════════════════════════════");
  console.log("  Migration Complete!");
  console.log("═══════════════════════════════════════════");
  console.log(`  Perfumes:       ${perfumes.length}`);
  console.log(`  Decant Sizes:   ${sizes.length}`);
  console.log(`  Bottles:        ${bottles.length}`);
  console.log(`  Settings:       ${settings ? 1 : 0}`);
  console.log(`  Bulk Rules:     ${rules.length}`);
  console.log(`  Orders:         ${orders.length}`);
  console.log(`  Order Items:    ${totalItems}`);
  console.log(`  Vouchers:       ${vouchers.length}`);
  console.log(`  Stock Requests: ${requests.length}`);
  console.log(`  Users:          ${users.length}`);
  console.log(`  Wishlists:      ${wishlists.length}`);
  console.log(`  Notifications:  ${notifications.length}`);
  console.log("═══════════════════════════════════════════\n");

  await prisma.$disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
