import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseAdminApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.replace(/^"|"$/g, "").trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.replace(/^"|"$/g, "").trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ?.replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "")
    .trim();

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

  return (
    getApps()[0] ??
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    })
  );
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirestoreDb() {
  const firebaseAdmin = getFirebaseAdminApp();

  const databaseId = process.env.FIRESTORE_DATABASE_ID;
  return databaseId && databaseId !== "(default)"
    ? getFirestore(firebaseAdmin, databaseId)
    : getFirestore(firebaseAdmin);
}
