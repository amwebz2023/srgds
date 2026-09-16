import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export function getFirestoreDb() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (
    !projectId ||
    !clientEmail ||
    !privateKey ||
    privateKey.includes("REPLACE_WITH")
  ) {
    throw new Error(
      "Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and a rotated FIREBASE_PRIVATE_KEY.",
    );
  }

  const firebaseAdmin =
    getApps()[0] ??
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });

  const databaseId = process.env.FIRESTORE_DATABASE_ID;
  return databaseId && databaseId !== "(default)"
    ? getFirestore(firebaseAdmin, databaseId)
    : getFirestore(firebaseAdmin);
}
