// Firebase Admin SDK — server-side only (API routes)
// Replaces Prisma as the database layer, connecting to Firestore
import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  // The private key comes from .env with escaped newlines
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Prevent re-initializing in dev (hot-reload)
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

export const db = getFirestore();

// ─── Collection name constants ─────────────────────────
// Centralised so typos are caught at compile time
export const Collections = {
  perfumes: "perfumes",
  decantSizes: "decantSizes",
  bottles: "bottles",
  settings: "settings",
  bulkPricingRules: "bulkPricingRules",
  orders: "orders",
  orderItems: "orderItems",
  vouchers: "vouchers",
  stockRequests: "stockRequests",
  users: "users",
  wishlists: "wishlists",
  notifications: "notifications",
} as const;
