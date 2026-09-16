import { ArrowUpRight, BriefcaseBusiness, MapPin, UsersRound } from "lucide-react";
import type { CollectionReference } from "firebase-admin/firestore";
import { getFirestoreDb } from "@/lib/firebase-admin";
import { hasAdminSession } from "@/lib/admin-auth";
import { SiteChrome } from "@/components/SiteChrome";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard", description: "SRGDS Alumni registration dashboard." };

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

async function getRecentRegistrations(registrations: CollectionReference) {
  try {
    return await registrations.orderBy("submittedAt", "desc").limit(50).get();
  } catch (error) {
    console.error("Could not order registrations by submittedAt; using fallback query", error);
    return registrations.limit(50).get();
  }
}

async function getDashboardData() {
  const registrations = getFirestoreDb().collection("registrations");
  const [totalSnapshot, recentSnapshot] = await Promise.all([
    registrations.count().get(),
    getRecentRegistrations(registrations),
  ]);

  const recent: Registration[] = recentSnapshot.docs.map((document) => {
    const data = document.data();
    const submittedAt = data.submittedAt?.toDate?.();
    return {
      id: document.id,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      mobile: data.mobile || "",
      city: data.city || "",
      profession: data.profession || data.otherProfession || "Not specified",
      workLocation: data.workLocation || "Not specified",
      submittedAt: submittedAt ? submittedAt.toLocaleDateString("en-IN") : "Pending",
    };
  });

  const cities = new Set(recent.map((registration) => registration.city).filter(Boolean)).size;
  const professions = new Set(recent.map((registration) => registration.profession).filter(Boolean)).size;

  return { total: totalSnapshot.data().count, recent, cities, professions };
}

export default async function Dashboard() {
  if (!(await hasAdminSession())) redirect("/login");
  const { total, recent, cities, professions } = await getDashboardData();

  return (
    <SiteChrome active="dashboard">
      <main className="inner-page dashboard-page">
        <section className="dashboard-hero">
          <div className="section-shell dashboard-hero-inner">
            <div>
              <span className="eyebrow">SRGDS community records</span>
              <h1 className="serif display-title">A clearer view<br /><em>of our people.</em></h1>
            </div>
            <UsersRound size={92} strokeWidth={1.2} aria-hidden="true" />
          </div>
        </section>
        <section className="section-shell dashboard-content">
          <div className="dashboard-stats">
            <article className="dashboard-stat dashboard-stat-primary"><UsersRound size={25} /><span>Total registered</span><strong>{total}</strong><small>All records</small></article>
            <article className="dashboard-stat"><MapPin size={25} /><span>Cities represented</span><strong>{cities}</strong><small>Across recent registrations</small></article>
            <article className="dashboard-stat"><BriefcaseBusiness size={25} /><span>Professions</span><strong>{professions}</strong><small>Across recent registrations</small></article>
          </div>
          <div className="dashboard-heading"><div><span className="eyebrow">Registration details</span><h2 className="serif section-title">Recent members</h2></div><span className="dashboard-count">Showing {recent.length} latest</span></div>
          <div className="registration-table-wrap">
            {recent.length ? <table className="registration-table"><thead><tr><th>Name</th><th>Contact</th><th>Location</th><th>Profession</th><th>Registered</th></tr></thead><tbody>{recent.map((registration) => <tr key={registration.id}><td><strong>{registration.firstName} {registration.lastName}</strong></td><td><span>{registration.email}</span><small>{registration.mobile}</small></td><td><span>{registration.city || "Not specified"}</span><small>{registration.workLocation}</small></td><td>{registration.profession}</td><td>{registration.submittedAt}</td></tr>)}</tbody></table> : <div className="dashboard-empty"><UsersRound size={34} /><h3 className="serif">No registrations yet.</h3><p>New community registrations will appear here.</p></div>}
          </div>
          <a className="text-link" href="/registration">Add a new registration <ArrowUpRight size={16} /></a>
        </section>
      </main>
    </SiteChrome>
  );
}