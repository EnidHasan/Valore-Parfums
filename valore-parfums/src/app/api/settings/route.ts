import { NextResponse } from "next/server";
// Updated: replaced Prisma with Firestore Admin SDK
import { db, Collections } from "@/lib/prisma";

// Default settings values (used if doc doesn't exist yet)
const DEFAULTS = {
  profitMargin: 20,
  packagingCost: 20,
  platformFees: 0,
  tierMargins: '{"Budget":{"3":37,"5":37,"6":37,"10":27,"15":22,"30":17},"Premium":{"3":32,"5":32,"6":32,"10":22,"15":17,"30":12},"Luxury":{"3":45,"5":45,"6":45,"10":35,"15":27,"30":27}}',
  currency: "BDT",
  lowStockAlertMl: 20,
  owner1Name: "Tayeb",
  owner2Name: "Enid",
  owner1Share: 60,
  owner2Share: 40,
};

// GET settings — Firestore doc get with defaults (replaces prisma.settings.upsert)
export async function GET() {
  const doc = await db.collection(Collections.settings).doc("default").get();
  if (!doc.exists) {
    // Create defaults if no settings doc exists
    await db.collection(Collections.settings).doc("default").set(DEFAULTS);
    return NextResponse.json({ id: "default", ...DEFAULTS });
  }
  return NextResponse.json({ id: doc.id, ...doc.data() });
}

// PUT settings — Firestore doc set with merge (replaces prisma.settings.upsert)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    await db.collection(Collections.settings).doc("default").set(data, { merge: true });
    const doc = await db.collection(Collections.settings).doc("default").get();
    return NextResponse.json({ id: "default", ...doc.data() });
  } catch (e) {
    console.error("Settings PUT error:", e);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
