// Firebase Admin SDK — server-side only (API routes)
// Replaces Prisma as the database layer, connecting to Firestore
import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function normalizePrivateKey(raw: string): string {
  let value = raw.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return value
    .replace(/\\\\r\\\\n/g, "\n")
    .replace(/\\\\n/g, "\n")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n");
}

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  "";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY || "");

const hasFullServiceAccount = Boolean(projectId && clientEmail && privateKey);

// Prevent re-initializing in dev (hot-reload)
if (!getApps().length) {
  if (hasFullServiceAccount) {
    try {
      const serviceAccount: ServiceAccount = {
        projectId,
        clientEmail,
        privateKey,
      };
      initializeApp({ credential: cert(serviceAccount) });
    } catch (error) {
      if (projectId) {
        initializeApp({ projectId });
        console.warn(
          "Firebase Admin cert init failed; using project-only init. Check FIREBASE_PRIVATE_KEY format.",
          error,
        );
      } else {
        throw error;
      }
    }
  } else if (projectId) {
    // Fallback to ADC/project-only init to avoid hard-crashing when cert vars are incomplete.
    initializeApp({ projectId });
    console.warn(
      "Firebase Admin initialized without full service account credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY for full access.",
    );
  } else {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID) and service account credentials.",
    );
  }
}

export const db = getFirestore();

// ─── Serialization helper ──────────────────────────────
// Recursively converts Firestore Timestamp fields to ISO strings
// so JSON responses don't contain raw {_seconds, _nanoseconds} objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeDoc(obj: any): any {
  if (obj == null) return obj;
  if (obj.toDate && typeof obj.toDate === "function") return obj.toDate().toISOString();
  if (Array.isArray(obj)) return obj.map(serializeDoc);
  if (typeof obj === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = serializeDoc(obj[key]);
    }
    return result;
  }
  return obj;
}

// ─── Collection name constants ─────────────────────────
// Centralised so typos are caught at compile time
export const Collections = {
  perfumes: "perfumes",
  perfumeReviews: "perfumeReviews",
  notesLibrary: "notesLibrary",
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
  withdrawals: "withdrawals",
  pickupLocations: "pickupLocations",
  requests: "requests",
  fullBottleLeads: "fullBottleLeads",
  blogPosts: "blogPosts",
  ownerAccounts: "ownerAccounts",
  profitTransactions: "profitTransactions",
} as const;
