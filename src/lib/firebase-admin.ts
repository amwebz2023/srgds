import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function readEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) return "";
  if (value.startsWith("\"") && value.endsWith("\"")) {
    return value.slice(1, -1);
  }
  return value;
}

export function getFirebaseEnvironment() {
  const projectId = readEnvironmentValue("FIREBASE_PROJECT_ID");
  const clientEmail = readEnvironmentValue("FIREBASE_CLIENT_EMAIL");
  const privateKey = readEnvironmentValue("FIREBASE_PRIVATE_KEY")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    .replace(/\r/g, "")
    .trim();

  if (!projectId) throw new Error("Missing FIREBASE_PROJECT_ID in the Vercel Production environment.");
  if (!clientEmail) throw new Error("Missing FIREBASE_CLIENT_EMAIL in the Vercel Production environment.");
  if (!privateKey) throw new Error("Missing FIREBASE_PRIVATE_KEY in the Vercel Production environment.");
  if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----") || !privateKey.includes("-----END PRIVATE KEY-----")) {
    throw new Error("FIREBASE_PRIVATE_KEY is not a valid PEM private key. Paste the complete key with \\n line breaks.");
  }

  return { projectId, clientEmail, privateKey };
}

function getFirebaseAdminApp() {
  const { projectId, clientEmail, privateKey } = getFirebaseEnvironment();

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
