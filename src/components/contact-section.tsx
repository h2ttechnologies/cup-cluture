"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, Clock3, Instagram, Map as MapIcon, MapPin, Navigation, Phone, Send, X } from "lucide-react";
import { useState } from "react";

type ContactProps = { locationName: string; locationUrl: string; phone?: string; openingHours?: string };
type SendState = "idle" | "sending" | "sent";

const topics = ["General question", "Feedback", "Order enquiry", "Reservation enquiry"];
const rise = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0 } };

export function ContactSection({ locationName, locationUrl, phone, openingHours }: ContactProps) {
  return <section className="cc-contact cc-ct" id="contact">
    <span className="cc-ct-orb cc-ct-orb-a" aria-hidden="true"/><span className="cc-ct-orb cc-ct-orb-b" aria-hidden="true"/>
    <div className="cc-section cc-ct-grid">
      <motion.div className="cc-ct-left" initial="hidden" whileInView="show" viewport={{ once: true, amount: .15 }} transition={{ staggerChildren: .1 }}>
        <motion.span variants={rise} className="cc-kicker">WE’RE JUST A NOTE AWAY</motion.span>
        <motion.h2 variants={rise} transition={{ duration: .6, ease: [.22, 1, .36, 1] }}>Come by.<br/><em>Say hello.</em></motion.h2>
        <motion.p variants={rise}>Questions, feedback or just saying hi — we’d love to hear from you.</motion.p>
        <motion.div variants={rise} transition={{ duration: .6 }}><LocationCard locationName={locationName} locationUrl={locationUrl}/></motion.div>
        <motion.div className="cc-ct-tiles" variants={{ hidden: {}, show: { transition: { staggerChildren: .08 } } }}>
          <InfoTile icon={<Phone size={18}/>} label="Give us a call" value={phone || "Number coming soon"} href={phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined}/>
          <InfoTile icon={<Instagram size={18}/>} label="Come say hi" value="@cupcultureindia" href="https://www.instagram.com/cupcultureindia/" external/>
          <InfoTile icon={<Clock3 size={18}/>} label="Opening hours" value={openingHours || "Hours coming soon"} live={Boolean(openingHours)}/>
        </motion.div>
      </motion.div>
      <motion.div className="cc-ct-right" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .7, ease: [.22, 1, .36, 1], delay: .1 }}>
        <NoteForm/>
      </motion.div>
    </div>
  </section>;
}

function LocationCard({ locationName, locationUrl }: { locationName: string; locationUrl: string }) {
  const [live, setLive] = useState(false);
  const reduce = useReducedMotion();
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(locationName)}&output=embed`;
  return <div className="cc-ct-map-card">
    <div className="cc-ct-map">
      <AnimatePresence mode="wait" initial={false}>
        {live ? <motion.iframe key="live" className="cc-ct-map-live" src={embedUrl} title="Cup Culture on Google Maps" loading="lazy" referrerPolicy="no-referrer-when-downgrade" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .45 }}/>
        : <motion.div key="art" className="cc-ct-map-art" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .3 }}>
          <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="400" height="240" fill="#f4e4cc"/>
            <path d="M0 40 Q60 30 110 52 T230 44 T400 58" className="cc-ct-water"/>
            <rect x="248" y="128" width="96" height="70" rx="14" className="cc-ct-park"/>
            <rect x="26" y="150" width="70" height="56" rx="12" className="cc-ct-park"/>
            <circle cx="300" cy="160" r="9" className="cc-ct-tree"/><circle cx="320" cy="174" r="7" className="cc-ct-tree"/><circle cx="58" cy="176" r="8" className="cc-ct-tree"/>
            <g className="cc-ct-blocks"><rect x="130" y="78" width="56" height="38" rx="6"/><rect x="204" y="76" width="44" height="40" rx="6"/><rect x="128" y="140" width="62" height="46" rx="6"/><rect x="300" y="78" width="70" height="36" rx="6"/><rect x="30" y="80" width="62" height="44" rx="6"/></g>
            <g className="cc-ct-roads"><path d="M-10 132 H410"/><path d="M112 -10 V250"/><path d="M196 130 L270 -10"/><path d="M196 132 V250"/><path d="M280 132 Q300 210 410 220"/></g>
            <g className="cc-ct-roads-minor"><path d="M0 70 H112"/><path d="M196 132 L400 112"/><path d="M112 196 H196"/></g>
            <motion.path d="M54 214 C80 180 100 150 112 132 S170 132 196 132 S214 108 222 98" className="cc-ct-route" initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, delay: .5, ease: "easeInOut" }}/>
            <circle cx="54" cy="214" r="6" className="cc-ct-you"/><circle cx="54" cy="214" r="6" className="cc-ct-you-ring"/>
          </svg>
          <motion.div className="cc-ct-pin" initial={reduce ? false : { y: -70, opacity: 0, scale: .6 }} whileInView={{ y: 0, opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", damping: 9, stiffness: 160, delay: .3 }}>
            <span className="cc-ct-pin-ring"/><span className="cc-ct-pin-ring delay"/>
            <span className="cc-ct-pin-head"><img src="/images/logo.jpg" alt=""/></span>
            <motion.span className="cc-ct-pin-label" initial={reduce ? false : { opacity: 0, y: 6, scale: .8 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.9, type: "spring", damping: 14 }}>Cup Culture</motion.span>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
      <motion.button type="button" className="cc-ct-map-toggle" onClick={() => setLive((value) => !value)} whileTap={{ scale: .94 }} aria-pressed={live}>{live ? <><X size={14}/> Close live map</> : <><MapIcon size={14}/> View live map</>}</motion.button>
    </div>
    <div className="cc-ct-map-info">
      <span className="cc-ct-map-icon"><MapPin size={19}/></span>
      <div><small>OUR SPOT IN COIMBATORE</small><strong>Cup Culture · T-Nagar</strong><span>{locationName}</span></div>
    </div>
    <div className="cc-ct-map-actions">
      <motion.a className="cc-ct-btn cc-ct-btn-dark" href={locationUrl} target="_blank" rel="noreferrer" whileHover={{ y: -2 }} whileTap={{ scale: .97 }}><Navigation size={15}/> Get directions</motion.a>
      <motion.button type="button" className="cc-ct-btn" onClick={() => setLive(true)} whileHover={{ y: -2 }} whileTap={{ scale: .97 }}><MapIcon size={15}/> See on map</motion.button>
    </div>
  </div>;
}

function InfoTile({ icon, label, value, href, external, live }: { icon: React.ReactNode; label: string; value: string; href?: string; external?: boolean; live?: boolean }) {
  const content = <><span className="cc-ct-tile-icon">{icon}{live && <i className="cc-ct-live-dot"/>}</span><span className="cc-ct-tile-copy"><small>{label}</small><strong>{value}</strong></span>{href && <ArrowUpRight className="cc-ct-tile-arrow" size={15}/>}</>;
  const variants = { hidden: { opacity: 0, y: 18, scale: .97 }, show: { opacity: 1, y: 0, scale: 1 } };
  return href
    ? <motion.a className="cc-ct-tile" href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} variants={variants} whileHover={{ y: -4 }} whileTap={{ scale: .98 }}>{content}</motion.a>
    : <motion.div className={`cc-ct-tile${value.includes("soon") ? " is-soon" : ""}`} variants={variants}>{content}</motion.div>;
}

function NoteForm() {
  const [topic, setTopic] = useState(topics[0]);
  const [state, setState] = useState<SendState>("idle");
  const [error, setError] = useState("");
  const [length, setLength] = useState(0);
  const reduce = useReducedMotion();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setState("sending");
    const form = event.currentTarget;
    try {
      const [response] = await Promise.all([
        fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form).entries())) }),
        new Promise((resolve) => setTimeout(resolve, 700)),
      ]);
      if (!response.ok) { const result = await response.json().catch(() => ({})); throw new Error(result.error || "We couldn't send your message."); }
      setState("sent");
    } catch (cause) {
      setState("idle");
      setError(cause instanceof Error ? cause.message : "We couldn't send your message.");
    }
  }

  return <div className="cc-ct-note">
    <span className="cc-ct-note-tape" aria-hidden="true"/>
    <AnimatePresence mode="wait" initial={false}>
      {state === "sent" ? <motion.div key="sent" className="cc-ct-sent" initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 18 }} role="status">
        <span className="cc-ct-sent-icon">
          {!reduce && Array.from({ length: 12 }).map((_, i) => { const a = (i / 12) * Math.PI * 2; return <motion.i key={i} initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: Math.cos(a) * 70, y: Math.sin(a) * 70, opacity: 0, scale: .4 }} transition={{ duration: .9, delay: .25, ease: "easeOut" }}/>; })}
          <motion.span initial={{ scale: 0, rotate: -120 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 11, stiffness: 220, delay: .1 }}><Check size={30}/></motion.span>
        </span>
        <span className="cc-kicker">NOTE RECEIVED</span>
        <h3>Thanks for reaching out.</h3>
        <p>Your message is with the Cup Culture team. We’ll get back to you soon.</p>
        <button type="button" className="cc-ct-btn" onClick={() => { setState("idle"); setLength(0); }}>Send another note</button>
      </motion.div>
      : <motion.form key="form" className="cc-ct-form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -16, transition: { duration: .3 } }}>
        <span className="cc-kicker">SEND A LITTLE NOTE</span>
        <h3>What’s on your mind?</h3>
        <p className="cc-ct-form-sub">We read every note — usually within a day.</p>
        <fieldset className="cc-ct-topics">
          <legend>What’s this about?</legend>
          <div>{topics.map((item) => <label key={item} className={topic === item ? "chosen" : ""}>
            <input type="radio" name="topic" value={item} checked={topic === item} onChange={() => setTopic(item)}/>
            {topic === item && <motion.span layoutId="cc-topic-pill" className="cc-ct-topic-pill" transition={{ type: "spring", damping: 24, stiffness: 320 }}/>}
            <span className="cc-ct-topic-text">{item}</span>
          </label>)}</div>
        </fieldset>
        <div className="cc-ct-fields">
          <FloatField name="name" label="Your name" required minLength={2} autoComplete="name"/>
          <FloatField name="email" label="Email address" type="email" required autoComplete="email"/>
          <label className="cc-ct-float cc-ct-float-wide">
            <textarea name="message" rows={4} minLength={10} maxLength={1000} required placeholder=" " onChange={(event) => setLength(event.target.value.length)}/>
            <span>Your message</span>
            <small className={length > 0 && length < 10 ? "warn" : ""}>{length}/1000</small>
          </label>
        </div>
        <AnimatePresence>{error && <motion.p className="cc-error" role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto", x: [0, -6, 6, -3, 0] }} exit={{ opacity: 0, height: 0 }}>{error}</motion.p>}</AnimatePresence>
        <motion.button className={`cc-ct-send is-${state}`} disabled={state === "sending"} whileHover={state === "idle" ? { y: -2 } : undefined} whileTap={{ scale: .97 }}>
          <AnimatePresence mode="wait" initial={false}>
            {state === "sending"
              ? <motion.span key="sending" className="cc-ct-send-label" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><span className="cc-ct-spinner"/> Sending…</motion.span>
              : <motion.span key="idle" className="cc-ct-send-label" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>Send your note <span className="cc-ct-plane"><Send size={15}/></span></motion.span>}
          </AnimatePresence>
        </motion.button>
      </motion.form>}
    </AnimatePresence>
  </div>;
}

function FloatField({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="cc-ct-float"><input {...props} placeholder=" "/><span>{label}</span></label>;
}
