import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    return NextResponse.json({ authenticated: await hasAdminSession() });
  } catch (error) {
    console.error("Could not check admin session", error);
    return NextResponse.json({ authenticated: false });
  }
}