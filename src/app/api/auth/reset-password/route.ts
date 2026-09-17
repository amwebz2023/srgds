import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Enter your email address first." }, { status: 400 });
    }

    await requestPasswordReset(email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Password reset request failed", error);
    return NextResponse.json({ error: "Password reset is temporarily unavailable." }, { status: 500 });
  }
}