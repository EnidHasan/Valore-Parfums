import { NextResponse } from "next/server";
// Updated: replaced Prisma with Firestore Admin SDK
import { db, Collections } from "@/lib/prisma";
import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";
import { Timestamp } from "firebase-admin/firestore";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "valore-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// POST /api/auth/signup
// Updated: creates user in Firestore instead of prisma.user.create
export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, phone, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
  }

  // Firestore: check for existing user by email (replaces prisma.user.findUnique)
  const existingSnap = await db.collection(Collections.users).where("email", "==", email).limit(1).get();
  if (!existingSnap.empty) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const id = uuid();
  const now = Timestamp.now();
  const role = "customer";

  // Firestore: create user document (replaces prisma.user.create)
  await db.collection(Collections.users).doc(id).set({
    name,
    email,
    phone: phone || "",
    passwordHash,
    role,
    createdAt: now,
    updatedAt: now,
  });

  const token = uuid();
  const cookieStore = await cookies();
  cookieStore.set("vp-session", JSON.stringify({ id, name, email, role, token }), {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return NextResponse.json({ id, name, email, role });
}
