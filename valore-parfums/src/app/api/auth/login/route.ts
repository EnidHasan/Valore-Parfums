import { NextResponse } from "next/server";
// Updated: replaced Prisma with Firestore Admin SDK
import { db, Collections } from "@/lib/prisma";
import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "valore-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// POST /api/auth/login
// Updated: queries Firestore users collection by email instead of prisma.user.findUnique
export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  // Firestore: query users by email (replaces prisma.user.findUnique)
  const snap = await db.collection(Collections.users).where("email", "==", email).limit(1).get();
  if (snap.empty) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const userDoc = snap.docs[0];
  const user = { id: userDoc.id, ...userDoc.data() } as {
    id: string; name: string; email: string; role: string; passwordHash: string;
  };

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = uuid();
  const cookieStore = await cookies();
  cookieStore.set("vp-session", JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role, token }), {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
