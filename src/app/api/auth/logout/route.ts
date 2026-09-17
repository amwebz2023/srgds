import { NextResponse } from "next/server";
import { getSessionCookieName } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getSessionCookieName(), "", {
    expires: new Date(0),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: new URL(request.url).protocol === "https:" || request.headers.get("x-forwarded-proto") === "https",
  });
  return response;
}