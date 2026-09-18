"use client";

import { ArrowUpRight, BriefcaseBusiness, MapPin, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";
import { getIdToken } from "firebase/auth";

type Registration = { id: string; firstName: string; lastName: string; email: string; mobile: string; city: string; profession: string; workLocation: string; submittedAt: string };
type DashboardData = { total: number; recent: Registration[]; cities: number; professions: number };

export function DashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) { router.replace("/login"); return; }
      const token = await getIdToken(user);
      const response = await fetch("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 401) { router.replace("/login"); return; }
      if (!response.ok) { setLoading(false); return; }
      setData(await response.json() as DashboardData);
      setLoading(false);
    });
    return unsubscribe;
  }, [router]);

  if (loading || !data) return <section className="section-shell dashboard-content dashboard-loading"><p>{loading ? "Loading dashboard..." : "Dashboard data is unavailable."}</p></section>;
  const { total, recent, cities, professions } = data;
  return <section className="section-shell dashboard-content">
    <div className="dashboard-stats">
      <article className="dashboard-stat dashboard-stat-primary"><UsersRound size={25} /><span>Total registered</span><strong>{total}</strong><small>All records</small></article>
      <article className="dashboard-stat"><MapPin size={25} /><span>Cities represented</span><strong>{cities}</strong><small>Across recent registrations</small></article>
      <article className="dashboard-stat"><BriefcaseBusiness size={25} /><span>Professions</span><strong>{professions}</strong><small>Across recent registrations</small></article>
    </div>
    <div className="dashboard-heading"><div><span className="eyebrow">Registration details</span><h2 className="serif section-title">Recent members</h2></div><span className="dashboard-count">Showing {recent.length} latest</span></div>
    <div className="registration-table-wrap">{recent.length ? <table className="registration-table"><thead><tr><th>Name</th><th>Contact</th><th>Location</th><th>Profession</th><th>Registered</th></tr></thead><tbody>{recent.map((registration) => <tr key={registration.id}><td><strong>{registration.firstName} {registration.lastName}</strong></td><td><span>{registration.email}</span><small>{registration.mobile}</small></td><td><span>{registration.city || "Not specified"}</span><small>{registration.workLocation}</small></td><td>{registration.profession}</td><td>{registration.submittedAt}</td></tr>)}</tbody></table> : <div className="dashboard-empty"><UsersRound size={34} /><h3 className="serif">No registrations yet.</h3><p>New community registrations will appear here.</p></div>}</div>
    <a className="text-link" href="/registration">Add a new registration <ArrowUpRight size={16} /></a>
  </section>;
}
