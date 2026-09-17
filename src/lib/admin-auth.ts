import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";

const sessionCookie = "srgds_admin_session";

function getSessionSecret() {
  const configuredSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (configuredSecret) return configuredSecret;
  if (process.env.NODE_ENV !== "production") return "srgds-development-session-secret";
  throw new Error("Missing ADMIN_SESSION_SECRET. Add a random secret to the Vercel Production environment.");
}

function createSessionToken(email: string) {
  const emailHash = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  const payload = `${emailHash}.${Date.now()}`;
  const signature = createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function isValidSessionToken(token: string | undefined) {
  if (!token) return false;
  const [mobileHash, timestamp, signature] = token.split(".");
  const issuedAt = Number(timestamp);
  if (!mobileHash || !timestamp || !signature || !Number.isFinite(issuedAt) || issuedAt > Date.now() || Date.now() - issuedAt > 8 * 60 * 60 * 1000) return false;
  const payload = `${mobileHash}.${timestamp}`;
  let expected: string;
  try {
    expected = createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
  } catch {
    return false;
  }
  return expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function authenticateAdmin(email: string, password: string) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY?.replace(/^"|"$/g, "").trim();
  if (!apiKey) throw new Error("Missing FIREBASE_WEB_API_KEY. Add the Firebase Web API key to Vercel environment variables.");

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    body: JSON.stringify({ email: email.trim().toLowerCase(), password, returnSecureToken: true }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    const firebaseMessage = errorResult?.error?.message;
    if (firebaseMessage === "INVALID_LOGIN_CREDENTIALS" || firebaseMessage === "EMAIL_NOT_FOUND" || firebaseMessage === "INVALID_PASSWORD") return false;
    if (firebaseMessage === "API_KEY_INVALID") throw new Error("FIREBASE_WEB_API_KEY is invalid or belongs to a different Firebase project.");
    throw new Error(`Firebase Authentication rejected the request: ${firebaseMessage || `HTTP ${response.status}`}.`);
  }

  const result = await response.json() as { idToken?: string; email?: string };
  if (!result.idToken) throw new Error("Firebase Authentication did not return an ID token.");
  const decodedToken = await getFirebaseAdminAuth().verifyIdToken(result.idToken);
  return createSessionToken(decodedToken.email || result.email || email);
}

export async function requestPasswordReset(email: string) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY?.replace(/^"|"$/g, "").trim();
  if (!apiKey) throw new Error("Missing FIREBASE_WEB_API_KEY. Add the Firebase Web API key to Vercel environment variables.");

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
    body: JSON.stringify({ requestType: "PASSWORD_RESET", email: email.trim().toLowerCase() }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    if (response.status === 400) return false;
    throw new Error(`Firebase password reset request failed with status ${response.status}.`);
  }

  return true;
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(sessionCookie)?.value);
}

export function getSessionCookieName() {
  return sessionCookie;
}