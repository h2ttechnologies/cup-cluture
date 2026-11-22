"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SWIGGY_URL, ZOMATO_URL } from "@/lib/links";
import { ArrowRight, ArrowUp, ArrowUpRight, Clock3, Coffee, Instagram, MapPin, Navigation } from "lucide-react";

type FooterProps = { locationName: string; locationUrl: string; openingHours?: string; onPrivacy: () => void; onTerms: () => void };

const ribbon = ["Freshly brewed", "Made to order", "Good food", "Good mood", "Just what you needed"];
const wordmark = "Cup Culture";
const column = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: .6, ease: [.22, 1, .36, 1] as const } } };

export function SiteFooter({ locationName, locationUrl, openingHours, onPrivacy, onTerms }: FooterProps) {
  const reduce = useReducedMotion();
  const year = new Date().getFullYear();
  const toTop = () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });

  return <footer className="cc-ft">
    <div className="cc-ft-wave" aria-hidden="true">
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none"><path className="cc-ft-wave-back" d="M0 50 C180 10 360 90 540 55 S900 10 1080 50 S1320 80 1440 40 V90 H0Z"/><path className="cc-ft-wave-front" d="M0 62 C200 30 380 96 600 64 S960 26 1160 60 S1360 84 1440 58 V90 H0Z"/></svg>
    </div>

    <div className="cc-ft-inner">
      <motion.div className="cc-ft-cta" initial="hidden" whileInView="show" viewport={{ once: true, amount: .4 }} variants={{ hidden: {}, show: { transition: { staggerChildren: .12 } } }}>
        <motion.div className="cc-ft-cup" variants={column} aria-hidden="true">
          <span className="cc-ft-steam s1"/><span className="cc-ft-steam s2"/><span className="cc-ft-steam s3"/>
          <Coffee size={30}/>
        </motion.div>
        <motion.h2 variants={column}>Hungry already?<br/><em>Your table’s waiting.</em></motion.h2>
        <motion.div className="cc-ft-cta-actions" variants={column}>
          <motion.a className="cc-ft-btn cc-ft-btn-light" href="#menu" whileHover={{ y: -3 }} whileTap={{ scale: .97 }}>Explore the menu <ArrowRight size={16}/></motion.a>
          <motion.a className="cc-ft-btn" href={locationUrl} target="_blank" rel="noreferrer" whileHover={{ y: -3 }} whileTap={{ scale: .97 }}><Navigation size={15}/> Get directions</motion.a>
        </motion.div>
      </motion.div>
    </div>

    <div className="cc-ft-ribbon" aria-hidden="true"><div className="cc-ft-ribbon-track">{[...ribbon, ...ribbon, ...ribbon, ...ribbon].map((item, index) => <span key={index}>{item}<i>✳</i></span>)}</div></div>

    <div className="cc-ft-inner">
      <motion.div className="cc-ft-grid" initial="hidden" whileInView="show" viewport={{ once: true, amount: .2 }} variants={{ hidden: {}, show: { transition: { staggerChildren: .1 } } }}>
        <motion.div className="cc-ft-brand" variants={column}>
          <a className="cc-ft-logo" href="#top" aria-label="Cup Culture home"><span className="cc-ft-logo-img"><img src="/images/logo.jpg" alt=""/></span><span><strong>CUP CULTURE</strong><small>JUST WHAT YOU NEEDED.</small></span></a>
          <p>Good food, refreshing sips and little moments that make your day better.</p>
          <motion.a className="cc-ft-insta" href="https://www.instagram.com/cupcultureindia/" target="_blank" rel="noreferrer" whileHover={{ y: -2 }} whileTap={{ scale: .97 }}><span className="cc-ft-insta-icon"><Instagram size={17}/></span><span><small>Follow along</small>@cupcultureindia</span><ArrowUpRight size={15}/></motion.a>
        </motion.div>

        <motion.nav className="cc-ft-col" variants={column} aria-label="Explore">
          <h3>Take a look</h3>
          <FooterLink href="#menu">The menu</FooterLink>
          <FooterLink href="#new">New arrivals</FooterLink>
          <FooterLink href="#story">Our story</FooterLink>
          <FooterLink href="#reviews">Reviews</FooterLink>
        </motion.nav>

        <motion.nav className="cc-ft-col" variants={column} aria-label="Help">
          <h3>Here to help</h3>
          <FooterLink href="#contact">Contact us</FooterLink>
          <FooterLink onClick={onPrivacy}>Privacy policy</FooterLink>
          <FooterLink onClick={onTerms}>Terms & conditions</FooterLink>
          <FooterLink href="/admin">Café team sign in</FooterLink>
        </motion.nav>

        <motion.div className="cc-ft-col cc-ft-visit" variants={column}>
          <h3>Come visit</h3>
          <a className="cc-ft-info" href={locationUrl} target="_blank" rel="noreferrer"><MapPin size={16}/><span>{locationName}</span></a>
          <div className="cc-ft-info"><Clock3 size={16}/><span>{openingHours || "Opening hours coming soon"}</span></div>
          <span className="cc-ft-badge"><i/> Dine in · Takeaway · Delivery</span>
          <div className="cc-ft-order"><small>Order online</small><a className="swiggy" href={SWIGGY_URL} target="_blank" rel="noreferrer"><b>S</b>Swiggy <ArrowUpRight size={13}/></a><a className="zomato" href={ZOMATO_URL} target="_blank" rel="noreferrer">zomato <ArrowUpRight size={13}/></a></div>
        </motion.div>
      </motion.div>
    </div>

    <motion.div className="cc-ft-word" role="img" aria-label="Cup Culture" initial={reduce ? false : "hidden"} whileInView="show" viewport={{ once: true, amount: .3 }} variants={{ hidden: {}, show: { transition: { staggerChildren: .045 } } }}>
      {wordmark.split("").map((letter, index) => <span key={index} className="cc-ft-letter-mask" aria-hidden="true"><motion.span className="cc-ft-letter" variants={{ hidden: { y: "105%" }, show: { y: "0%", transition: { duration: .8, ease: [.22, 1, .36, 1] } } }}>{letter === " " ? " " : letter}</motion.span></span>)}
    </motion.div>

    <div className="cc-ft-inner">
      <div className="cc-ft-bottom">
        <span>© {year} Cup Culture</span>
        <span className="cc-ft-made">Made with <motion.i animate={reduce ? undefined : { scale: [1, 1.25, 1] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: .6 }}>♥</motion.i> in Coimbatore</span>
        <motion.button type="button" className="cc-ft-top" onClick={toTop} whileHover={{ y: -3 }} whileTap={{ scale: .92 }} aria-label="Back to the top"><span>Back to top</span><span className="cc-ft-top-icon"><ArrowUp size={16}/></span></motion.button>
      </div>
    </div>
  </footer>;
}

function FooterLink({ href, onClick, children }: { href?: string; onClick?: () => void; children: React.ReactNode }) {
  const inner = <><span className="cc-ft-link-text">{children}</span><ArrowUpRight className="cc-ft-link-arrow" size={13}/></>;
  return href ? <a className="cc-ft-link" href={href}>{inner}</a> : <button type="button" className="cc-ft-link" onClick={onClick}>{inner}</button>;
}
