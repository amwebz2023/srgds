import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getFirestoreDb } from "@/lib/firebase-admin";

const sessionCookie = "srgds_admin_session";
const sessionSecret = process.env.ADMIN_SESSION_SECRET || "srgds-development-session-secret";

function createSessionToken(email: string) {
  const emailHash = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  const payload = `${emailHash}.${Date.now()}`;
  const signature = createHmac("sha256", sessionSecret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function isValidSessionToken(token: string | undefined) {
  if (!token) return false;
  const [mobileHash, timestamp, signature] = token.split(".");
  if (!mobileHash || !timestamp || !signature || Date.now() - Number(timestamp) > 8 * 60 * 60 * 1000) return false;
  const payload = `${mobileHash}.${timestamp}`;
  const expected = createHmac("sha256", sessionSecret).update(payload).digest("hex");
  return expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function authenticateAdmin(email: string, password: string) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) throw new Error("Missing FIREBASE_WEB_API_KEY. Add the Firebase Web API key to Vercel environment variables.");

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    body: JSON.stringify({ email: email.trim().toLowerCase(), password, returnSecureToken: true }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    if (response.status === 400) return false;
    throw new Error(`Firebase Authentication request failed with status ${response.status}.`);
  }

  const result = await response.json() as { idToken?: string; email?: string };
  if (!result.idToken) throw new Error("Firebase Authentication did not return an ID token.");
  getFirestoreDb();
  const { getAuth } = await import("firebase-admin/auth");
  const decodedToken = await getAuth().verifyIdToken(result.idToken);
  return createSessionToken(decodedToken.email || result.email || email);
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(sessionCookie)?.value);
}

export function getSessionCookieName() {
  return sessionCookie;
}