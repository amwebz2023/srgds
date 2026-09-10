"use client";

import Link from "next/link";
import { ArrowUp, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export function SiteChrome({ children, active }: { children: React.ReactNode; active: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  useEffect(() => { const onScroll = () => setShowTop(window.scrollY > 340); window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll); }, []);
  const links = [{ href: "/", label: "Home", id: "home" }, { href: "/about", label: "About", id: "about" }];
  return <>
    <header className="site-header"><div className="nav-shell"><Link className="brand" href="/" onClick={() => setMenuOpen(false)}><span className="brand-mark">S</span><span>SRGDS <span className="brand-accent">sonthangal</span></span></Link><button className="menu-toggle" aria-expanded={menuOpen} aria-controls="site-navigation" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button><nav id="site-navigation" className={menuOpen ? "main-nav open" : "main-nav"}>{links.map((link) => <Link className={active === link.id ? "active" : ""} href={link.href} key={link.id} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}<Link className="button button-primary nav-cta" href="/registration" onClick={() => setMenuOpen(false)}>Register now <span aria-hidden="true">↗</span></Link></nav></div></header>
    {children}
    <footer className="site-footer"><div className="section-shell footer-grid"><div><Link className="brand footer-brand" href="/"><span className="brand-mark">S</span><span>SRGDS <span className="brand-accent">sonthangal</span></span></Link><p>A connected community, growing with purpose.</p></div><div className="footer-links"><span>Explore</span>{links.map(link => <Link href={link.href} key={link.id}>{link.label}</Link>)}</div><div className="footer-register"><span>Ready to connect?</span><Link href="/registration">Join our community ↗</Link></div></div><div className="section-shell footer-bottom"><span>© 2026 SRGDS sonthangal. All rights reserved.</span><span>Made for our community</span></div></footer>
    <button className={showTop ? "back-top visible" : "back-top"} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><ArrowUp size={18} /></button>
  </>;
}
