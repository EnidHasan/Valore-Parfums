/**
 * Validation script: confirms all records migrated from SQLite to Firestore
 *
 * Compares record counts between Prisma (SQLite) and Firestore,
 * then spot-checks individual documents to verify data integrity.
 *
 * Usage:
 *   npx tsx scripts/validate-migration.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const prisma = new PrismaClient();

async function countCollection(name: string): Promise<number> {
  const snap = await db.collection(name).count().get();
  return snap.data().count;
}

async function validate() {
  console.log("═══════════════════════════════════════════");
  console.log("  Migration Validation");
  console.log("═══════════════════════════════════════════\n");

  let passed = 0;
  let failed = 0;

  // Count comparisons
  const checks: { name: string; sqliteCount: Promise<number>; collection: string }[] = [
    { name: "Perfumes", sqliteCount: prisma.perfume.count(), collection: "perfumes" },
    { name: "DecantSizes", sqliteCount: prisma.decantSize.count(), collection: "decantSizes" },
    { name: "Bottles", sqliteCount: prisma.bottleInventory.count(), collection: "bottles" },
    { name: "BulkPricingRules", sqliteCount: prisma.bulkPricingRule.count(), collection: "bulkPricingRules" },
    { name: "Orders", sqliteCount: prisma.order.count(), collection: "orders" },
    { name: "Vouchers", sqliteCount: prisma.voucher.count(), collection: "vouchers" },
    { name: "StockRequests", sqliteCount: prisma.stockRequest.count(), collection: "stockRequests" },
    { name: "Users", sqliteCount: prisma.user.count(), collection: "users" },
    { name: "Wishlists", sqliteCount: prisma.wishlist.count(), collection: "wishlists" },
    { name: "Notifications", sqliteCount: prisma.notification.count(), collection: "notifications" },
  ];

  for (const check of checks) {
    const sqlite = await check.sqliteCount;
    const firestore = await countCollection(check.collection);
    const match = sqlite === firestore;
    const icon = match ? "✓" : "✗";
    console.log(`  ${icon} ${check.name}: SQLite=${sqlite}  Firestore=${firestore}`);
    if (match) passed++;
    else failed++;
  }

  // Settings (singleton)
  const sqliteSettings = await prisma.settings.findUnique({ where: { id: "default" } });
  const fsSettingsDoc = await db.collection("settings").doc("default").get();
  if (sqliteSettings && fsSettingsDoc.exists) {
    const fsSettings = fsSettingsDoc.data()!;
    const settingsMatch =
      fsSettings.packagingCost === sqliteSettings.packagingCost &&
      fsSettings.currency === sqliteSettings.currency &&
      fsSettings.tierMargins === sqliteSettings.tierMargins;
    console.log(`  ${settingsMatch ? "✓" : "✗"} Settings: data integrity ${settingsMatch ? "OK" : "MISMATCH"}`);
    if (settingsMatch) passed++;
    else failed++;
  }

  // OrderItems subcollection spot-check
  const firstOrder = await prisma.order.findFirst({ include: { items: true } });
  if (firstOrder) {
    const fsItems = await db.collection("orders").doc(firstOrder.id).collection("items").get();
    const itemMatch = fsItems.size === firstOrder.items.length;
    console.log(`  ${itemMatch ? "✓" : "✗"} OrderItems (order ${firstOrder.id.slice(0, 8)}): SQLite=${firstOrder.items.length}  Firestore=${fsItems.size}`);
    if (itemMatch) passed++;
    else failed++;
  }

  // Spot-check: verify a random perfume's data
  const randomPerfume = await prisma.perfume.findFirst();
  if (randomPerfume) {
    const fsDoc = await db.collection("perfumes").doc(randomPerfume.id).get();
    if (fsDoc.exists) {
      const fs = fsDoc.data()!;
      const dataMatch =
        fs.name === randomPerfume.name &&
        fs.brand === randomPerfume.brand &&
        fs.marketPricePerMl === randomPerfume.marketPricePerMl &&
        fs.owner === randomPerfume.owner;
      console.log(`  ${dataMatch ? "✓" : "✗"} Perfume spot-check "${randomPerfume.name}": ${dataMatch ? "OK" : "MISMATCH"}`);
      if (dataMatch) passed++;
      else failed++;
    } else {
      console.log(`  ✗ Perfume spot-check: doc not found in Firestore`);
      failed++;
    }
  }

  console.log(`\n  Results: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════\n");

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

validate().catch((err) => {
  console.error("Validation failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
