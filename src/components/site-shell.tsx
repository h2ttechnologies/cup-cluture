"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, CupSoda, Instagram, Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import { useStore } from "@/lib/store";

const links = [{ href: "/", label: "Home" }, { href: "/menu", label: "Menu" }, { href: "/#new", label: "New arrivals" }, { href: "/about", label: "Our story" }, { href: "/contact", label: "Contact" }];
export function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`brand ${light ? "brand-light" : ""}`} aria-label="Cup Culture home"><span className="brand-mark"><CupSoda size={21} strokeWidth={1.7}/></span><span className="brand-copy"><strong>CUP CULTURE</strong><small>JUST WHAT YOU NEEDED.</small></span></Link>;
}
export function Header() {
  const [open, setOpen] = useState(false); const pathname = usePathname(); const { cart } = useStore();
  const count = cart.reduce((n, line) => n + line.quantity, 0);
  return <>
    <div className="topline"><span>Good things, one cup at a time.</span><span>Thoughtfully made for your everyday <span aria-hidden="true">✳</span></span></div>
    <header className="site-header"><div className="nav-wrap"><Brand/><nav className={`main-nav ${open ? "nav-open" : ""}`} aria-label="Main navigation">
      {links.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={pathname === item.href ? "active" : ""}>{item.label}</Link>)}
      <Link href="/reservations" className="nav-book-mobile" onClick={() => setOpen(false)}>Book a table <ArrowUpRight size={15}/></Link>
    </nav><div className="nav-actions"><Link className="nav-book" href="/reservations">Book a table <ArrowUpRight size={15}/></Link><Link className="icon-button cart-button" href="/cart" aria-label={`Shopping bag, ${count} items`}><ShoppingBag size={19}/>{count > 0 && <span className="cart-count">{count}</span>}</Link><Link href="/profile" className="profile-link">Account</Link><button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X/> : <MenuIcon/>}</button></div>
    </div></header>
  </>;
}
export function Footer() {
  return <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><Brand light/><p>Good food, refreshing sips and little moments that make your day better.</p><a className="social-link" href="https://www.instagram.com/cupcultureindia/" target="_blank" rel="noreferrer"><Instagram size={17}/> @cupcultureindia <ArrowUpRight size={14}/></a></div><div className="footer-col"><span className="eyebrow">EXPLORE</span><Link href="/menu">Our menu</Link><Link href="/#new">New arrivals</Link><Link href="/about">Our story</Link><Link href="/reservations">Book a table</Link></div><div className="footer-col"><span className="eyebrow">HERE TO HELP</span><Link href="/contact">Contact us</Link><Link href="/profile">Your account</Link><Link href="/privacy">Privacy policy</Link></div><div className="footer-col footer-hours"><span className="eyebrow">COME ON IN</span><p>Opening hours<br/><span>Set your café hours in settings.</span></p><p>Find us<br/><span>Address details coming soon.</span></p><Link href="/contact" className="text-link">Get in touch <ArrowUpRight size={14}/></Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Cup Culture</span><span>Just what you needed.</span><Link href="/terms">Terms & conditions</Link></div></footer>;
}
export function PageShell({ children }: { children: React.ReactNode }) { return <><Header/><main>{children}</main><Footer/></>; }
