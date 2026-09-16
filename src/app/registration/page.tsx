import { SiteChrome } from "@/components/SiteChrome";
import { RegistrationForm } from "@/components/RegistrationForm";

export const metadata = { title: "Registration", description: "Register with the SRGDS Alumni community." };
export default function Registration() { return <SiteChrome active="registration"><main className="inner-page registration-page"><section className="page-hero section-shell"><span className="eyebrow">Become part of the network</span><h1 className="serif display-title">Your story<br /><em>belongs here.</em></h1><p>Tell us a little about yourself. It takes just a few minutes to join the SRGDS Alumni community.</p></section><div className="section-shell form-shell"><RegistrationForm /></div></main></SiteChrome>; }
