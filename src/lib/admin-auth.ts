import { getAuth } from "firebase-admin/auth";
import { getFirestoreDb } from "@/lib/firebase-admin";

export async function verifyAdminToken(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return null;
  getFirestoreDb();
  const decodedToken = await getAuth().verifyIdToken(token);
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || decodedToken.email?.toLowerCase() !== adminEmail) return null;
  return decodedToken;
}
