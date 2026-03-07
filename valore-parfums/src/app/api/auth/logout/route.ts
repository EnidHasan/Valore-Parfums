import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/auth/logout
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("vp-session");
  return NextResponse.json({ ok: true });
}
