import { createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { getFirestoreDb } from "@/lib/firebase-admin";

const scrypt = promisify(scryptCallback);
const sessionCookie = "srgds_admin_session";
const sessionSecret = process.env.ADMIN_SESSION_SECRET || "srgds-development-session-secret";
const bootstrapMobile = (process.env.ADMIN_MOBILE || "9876543210").replace(/\D/g, "");
const bootstrapPassword = process.env.ADMIN_PASSWORD || "Test@123";

function hashMobile(mobile: string) {
  return createHash("sha256").update(mobile).digest("hex");
}

async function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return { hash: derivedKey.toString("hex"), salt };
}

async function passwordMatches(password: string, hash: string, salt: string) {
  const candidate = await hashPassword(password, salt);
  const expected = Buffer.from(hash, "hex");
  const actual = Buffer.from(candidate.hash, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function createSessionToken(mobile: string) {
  const payload = `${hashMobile(mobile)}.${Date.now()}`;
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

export async function authenticateAdmin(mobile: string, password: string) {
  const normalizedMobile = mobile.replace(/\D/g, "");
  const userRef = getFirestoreDb().collection("loginuser").doc(hashMobile(normalizedMobile));
  const userSnapshot = await userRef.get();

  if (!userSnapshot.exists) {
    if (normalizedMobile !== bootstrapMobile || password !== bootstrapPassword) return false;
    const passwordData = await hashPassword(password);
    await userRef.set({
      mobileHash: hashMobile(normalizedMobile),
      passwordHash: passwordData.hash,
      passwordSalt: passwordData.salt,
      createdAt: FieldValue.serverTimestamp(),
    });
  } else {
    const user = userSnapshot.data();
    if (!user?.passwordHash || !user.passwordSalt || !(await passwordMatches(password, user.passwordHash, user.passwordSalt))) return false;
  }

  return createSessionToken(normalizedMobile);
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(sessionCookie)?.value);
}

export function getSessionCookieName() {
  return sessionCookie;
}