"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Heart, MapPin } from "lucide-react";
import { useRef } from "react";
import { SWIGGY_URL, ZOMATO_URL } from "@/lib/links";
import { categories } from "@/lib/menu";
import { GOOGLE_REVIEW_COUNT, guestReviews } from "@/lib/reviews";

// Entrance animations are pure CSS (classes "cc-hx-in" + --d delay) so the hero
// appears as soon as the page paints, even before JavaScript has loaded.
// Framer Motion only drives the gentle scroll parallax.
const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as React.CSSProperties;

export function HeroSection({ onCategory }: { onCategory: (categoryId: string) => void }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const artY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const floatY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 40]);
  const avatars = guestReviews.slice(0, 4).map((review) => review.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase());
  const ribbon = categories.slice(0, 12);

  return <section className="cc-hero cc-hx" ref={ref} aria-labelledby="cc-hx-title">
    <span className="cc-hx-blob a" aria-hidden="true"/><span className="cc-hx-blob b" aria-hidden="true"/>

    <div className="cc-hx-inner">
      <motion.div className="cc-hx-copy" style={{ y: copyY }}>
        <span className="cc-hx-kicker cc-hx-in" style={delay(.1)}><i/> Open for a little pause · Coimbatore</span>

        <h1 id="cc-hx-title" className="cc-hx-title">
          <span className="cc-hx-line"><span className="cc-hx-rise" style={delay(.15)}>Just what</span></span>
          <span className="cc-hx-line accent"><span className="cc-hx-rise" style={delay(.28)}>you <span className="cc-hx-needed">needed.<svg viewBox="0 0 220 24" aria-hidden="true"><path pathLength={1} d="M4 16 C 50 4, 110 4, 150 12 S 205 20, 216 8"/></svg></span></span></span>
        </h1>

        <p className="cc-hx-in" style={delay(.5)}>Good food, refreshing sips and little moments that make your day better. Pull up a chair — your favourite is waiting.</p>

        <div className="cc-hx-actions cc-hx-in" style={delay(.62)}>
          <a className="cc-hx-btn primary" href="#menu">Explore the menu <span><ArrowDown size={16}/></span></a>
          <a className="cc-hx-btn" href="#contact"><MapPin size={16}/> Find us</a>
        </div>

        <div className="cc-hx-trust cc-hx-in" style={delay(.78)}>
          <a href="#reviews" className="cc-hx-proof">
            <span className="cc-hx-avatars" aria-hidden="true">{avatars.map((initials, index) => <b key={index} className={`t${index}`}>{initials}</b>)}</span>
            <span><span className="cc-hx-stars"><Heart size={12} fill="currentColor"/> Loved by our guests</span><small>{GOOGLE_REVIEW_COUNT} Google reviews</small></span>
          </a>
          <span className="cc-hx-divider" aria-hidden="true"/>
          <span className="cc-hx-apps"><small>Also on</small><a className="cc-hx-app swiggy" href={SWIGGY_URL} target="_blank" rel="noreferrer" aria-label="Order Cup Culture on Swiggy (opens in a new tab)"><b>S</b>Swiggy</a><a className="cc-hx-app zomato" href={ZOMATO_URL} target="_blank" rel="noreferrer" aria-label="Order Cup Culture on Zomato (opens in a new tab)">zomato</a></span>
        </div>
      </motion.div>

      <div className="cc-hx-art" aria-label="A taste of Cup Culture">
        <motion.div className="cc-hx-arch-wrap" style={{ y: artY }}>
          <div className="cc-hx-arch cc-hx-in" style={delay(.2)}>
            <img src="/images/tea.webp" alt="A glass of warm milky chai on a wooden table"/>
            <span className="cc-hx-steam" aria-hidden="true"><i/><i/><i/></span>
          </div>
        </motion.div>

        <motion.div className="cc-hx-float burger" style={{ y: floatY }}>
          <div className="cc-hx-pop left" style={delay(.5)}><div className="cc-hx-bob"><img src="/images/burger.webp" alt="A golden chicken burger"/></div></div>
        </motion.div>
        <motion.div className="cc-hx-float shake" style={{ y: floatY }}>
          <div className="cc-hx-pop right" style={delay(.65)}><div className="cc-hx-bob slow"><img src="/images/biscoff.webp" alt="A Lotus Biscoff milkshake"/></div></div>
        </motion.div>

        <a href="#menu" className="cc-hx-chip cc-hx-in" style={delay(.95)}>
          <span className="cc-hx-chip-dot"/><span><small>Guest favourite</small><strong>Hot Chocolate</strong></span><b>₹60</b>
        </a>

        <div className="cc-hx-seal cc-hx-zoom" style={delay(.85)} aria-hidden="true">
          <svg viewBox="0 0 100 100"><defs><path id="cc-hx-seal-path" d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0"/></defs><text textLength="226" lengthAdjust="spacing"><textPath href="#cc-hx-seal-path" textLength="226" lengthAdjust="spacing">GOOD FOOD ✳ GOOD MOOD ✳</textPath></text></svg>
          <span>☕</span>
        </div>
      </div>
    </div>

    <div className="cc-hx-ribbon cc-hx-in" style={delay(1)}>
      <div className="cc-hx-ribbon-track">{[...ribbon, ...ribbon].map((category, index) => <a key={index} href="#menu" onClick={() => onCategory(category.id)} tabIndex={index >= ribbon.length ? -1 : undefined} aria-hidden={index >= ribbon.length || undefined}>{category.name.toLowerCase()}<i>✳</i></a>)}</div>
    </div>
  </section>;
}
