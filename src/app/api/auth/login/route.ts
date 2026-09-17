import { NextResponse } from "next/server";
import { authenticateAdmin, getSessionCookieName } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe } = await request.json();
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return NextResponse.json({ error: "Enter your email address and password." }, { status: 400 });
    }

    const token = await authenticateAdmin(email, password);
    if (!token) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      ...(rememberMe === true ? { maxAge: 8 * 60 * 60 } : {}),
      path: "/",
      sameSite: "lax",
      secure: new URL(request.url).protocol === "https:" || request.headers.get("x-forwarded-proto") === "https",
    });
    return response;
  } catch (error) {
    console.error("Admin login failed", error);
    const message = error instanceof Error && error.message.includes("ADMIN_SESSION_SECRET")
      ? "ADMIN_SESSION_SECRET is missing from the Vercel Production environment."
      : "Firebase login configuration is unavailable. Check the Vercel Production environment variables.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}