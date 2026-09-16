import { ArrowUpRight, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata = { title: "Login", description: "Sign in to the SRGDS Alumni community." };

export default function Login() {
  return <SiteChrome active="login"><main className="inner-page login-page"><section className="login-layout section-shell"><div className="login-welcome"><span className="eyebrow">Welcome to your community</span><h1 className="serif display-title">Your people,<br /><em>always close.</em></h1><p>Reconnect with familiar faces, discover new opportunities, and keep your place in the SRGDS Alumni story.</p><div className="login-trust"><div><UsersRound size={20} /><span>One connected network</span></div><div><ShieldCheck size={20} /><span>A community built on trust</span></div></div><Link className="login-back-link" href="/about">Learn more about us <ArrowUpRight size={16} /></Link></div><LoginForm /></section></main></SiteChrome>;
}