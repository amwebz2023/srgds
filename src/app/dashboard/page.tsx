import { UsersRound } from "lucide-react";
import { SiteChrome } from "@/components/SiteChrome";
import { DashboardClient } from "@/components/DashboardClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard", description: "SRGDS Alumni registration dashboard." };

export default function Dashboard() {
  return (
    <SiteChrome active="dashboard">
      <main className="inner-page dashboard-page">
        <section className="dashboard-hero">
          <div className="section-shell dashboard-hero-inner">
            <div><span className="eyebrow">SRGDS community records</span><h1 className="serif display-title">A clearer view<br /><em>of our people.</em></h1></div>
            <UsersRound size={92} strokeWidth={1.2} aria-hidden="true" />
          </div>
        </section>
        <DashboardClient />
      </main>
    </SiteChrome>
  );
}
