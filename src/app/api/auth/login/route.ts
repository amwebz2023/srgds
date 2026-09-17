import { NextResponse } from "next/server";
import { authenticateAdmin, getSessionCookieName } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Enter your email address and password." }, { status: 400 });
    }

    const token = await authenticateAdmin(email, password);
    if (!token) return NextResponse.json({ error: "Invalid mobile number or password." }, { status: 401 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      maxAge: 8 * 60 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    console.error("Admin login failed", error);
    return NextResponse.json({ error: "Login is temporarily unavailable." }, { status: 500 });
  }
}