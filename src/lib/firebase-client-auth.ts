"use client";

type StoredAuth = {
  email: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
};

const storageKey = "srgds_firebase_auth";

function getApiKey() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_WEB_API_KEY;
  if (!apiKey) throw new Error("Firebase Authentication is not configured for this deployment.");
  return apiKey;
}

function readAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) || "null") as StoredAuth | null;
  } catch {
    return null;
  }
}

function saveAuth(auth: StoredAuth) {
  window.localStorage.setItem(storageKey, JSON.stringify(auth));
}

export function getStoredAuth() {
  return readAuth();
}

export async function signInWithEmailPassword(email: string, password: string) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${getApiKey()}`, {
    body: JSON.stringify({ email: email.trim().toLowerCase(), password, returnSecureToken: true }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const result = await response.json().catch(() => null) as { idToken?: string; refreshToken?: string; expiresIn?: string; email?: string; error?: { message?: string } } | null;
  if (!response.ok || !result?.idToken || !result.refreshToken) throw new Error(result?.error?.message || "Please submit valid credentials.");
  saveAuth({ email: result.email || email.trim().toLowerCase(), idToken: result.idToken, refreshToken: result.refreshToken, expiresAt: Date.now() + Number(result.expiresIn || 3600) * 1000 });
}

export async function getFirebaseIdToken() {
  const auth = readAuth();
  if (!auth) return null;
  if (auth.expiresAt > Date.now() + 60_000) return auth.idToken;
  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${getApiKey()}`, {
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: auth.refreshToken }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });
  const result = await response.json().catch(() => null) as { id_token?: string; refresh_token?: string; expires_in?: string } | null;
  if (!response.ok || !result?.id_token || !result.refresh_token) {
    signOut();
    return null;
  }
  saveAuth({ ...auth, idToken: result.id_token, refreshToken: result.refresh_token, expiresAt: Date.now() + Number(result.expires_in || 3600) * 1000 });
  return result.id_token;
}

export function signOut() {
  if (typeof window !== "undefined") window.localStorage.removeItem(storageKey);
}

export async function requestPasswordReset(email: string) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${getApiKey()}`, {
    body: JSON.stringify({ requestType: "PASSWORD_RESET", email: email.trim().toLowerCase() }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok) throw new Error("Password reset is temporarily unavailable.");
}
