import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { authenticateAdmin, getSessionCookieName } = await import("@/lib/admin-auth");
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
    const errorMessage = error instanceof Error ? error.message : "";
    const normalizedError = errorMessage.toLowerCase();
    const message = errorMessage.includes("ADMIN_SESSION_SECRET")
      ? "ADMIN_SESSION_SECRET is missing from the Vercel Production environment."
      : errorMessage.includes("FIREBASE_WEB_API_KEY")
        ? errorMessage
        : errorMessage.includes("Firebase credentials") || normalizedError.includes("private key") || normalizedError.includes("client email")
          ? "FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL is invalid in Vercel. Copy them from the same Firebase service-account JSON and redeploy."
          : normalizedError.includes("project") || normalizedError.includes("credential") || normalizedError.includes("certificate")
            ? "Firebase Admin credentials do not match FIREBASE_PROJECT_ID in Vercel. Use one service-account JSON from project srgdsdb and redeploy."
            : "Firebase login configuration is unavailable. Check the Vercel Production environment variables.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}