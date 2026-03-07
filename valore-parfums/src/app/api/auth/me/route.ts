import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// GET /api/auth/me — returns current user from session cookie
export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("vp-session");

  if (!session?.value) {
    return NextResponse.json(null);
  }

  try {
    const user = JSON.parse(session.value);
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch {
    return NextResponse.json(null);
  }
}
