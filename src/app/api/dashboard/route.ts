import { NextResponse } from "next/server";
import { getFirestoreDb } from "@/lib/firebase-admin";
import { verifyAdminToken } from "@/lib/admin-auth";

export const runtime = "nodejs";

type Registration = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  city: string;
  profession: string;
  workLocation: string;
  submittedAt: string;
};

export async function GET(request: Request) {
  try {
    if (!(await verifyAdminToken(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const registrations = getFirestoreDb().collection("registrations");
    const [totalSnapshot, recentSnapshot] = await Promise.all([
      registrations.count().get(),
      registrations.orderBy("submittedAt", "desc").limit(50).get().catch(() => registrations.limit(50).get()),
    ]);
    const recent: Registration[] = recentSnapshot.docs.map((document) => {
      const data = document.data();
      const submittedAt = data.submittedAt?.toDate?.();
      return { id: document.id, firstName: data.firstName || "", lastName: data.lastName || "", email: data.email || "", mobile: data.mobile || "", city: data.city || "", profession: data.profession || data.otherProfession || "Not specified", workLocation: data.workLocation || "Not specified", submittedAt: submittedAt ? submittedAt.toLocaleDateString("en-IN") : "Pending" };
    });
    return NextResponse.json({ total: totalSnapshot.data().count, recent, cities: new Set(recent.map((item) => item.city).filter(Boolean)).size, professions: new Set(recent.map((item) => item.profession).filter(Boolean)).size });
  } catch (error) {
    console.error("Dashboard data request failed", error);
    return NextResponse.json({ error: "Dashboard data is unavailable." }, { status: 500 });
  }
}
