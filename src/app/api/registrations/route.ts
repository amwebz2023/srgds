import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getFirestoreDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid registration data." }, { status: 400 });
    }

    await getFirestoreDb().collection("registrations").add({
      ...data,
      submittedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Registration save failed", error);
    return NextResponse.json(
      { error: "We could not save your registration. Please try again." },
      { status: 500 },
    );
  }
}
