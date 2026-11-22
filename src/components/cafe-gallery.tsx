"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Instagram } from "lucide-react";

const ease = [.22, 1, .36, 1] as const;
const rise = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: .6, ease } } };

const rowOne = [
  { src: "/images/gallery/coffee-mug.webp", label: "Coffee Buzz mornings" },
  { src: "/images/gallery/hot-chocolate.webp", label: "The hot chocolate" },
  { src: "/images/gallery/lemon-tea.webp", label: "A slow lemon tea" },
  { src: "/images/gallery/rose-milk.webp", label: "Rose milk afternoons" },
  { src: "/images/gallery/momos-steamer.webp", label: "Fresh from the steamer" },
  { src: "/images/gallery/cc-burger.webp", label: "Burgers worth the wait" },
];
const rowTwo = [
  { src: "/images/gallery/cold-coffee.webp", label: "Something cold" },
  { src: "/images/gallery/bun-jam.webp", label: "Bun, butter & jam" },
  { src: "/images/gallery/ginger-chai.webp", label: "Ginger chai o’clock" },
  { src: "/images/gallery/iced-coffee.webp", label: "Iced coffee break" },
  { src: "/images/gallery/oreo-shake.webp", label: "Treat yourself" },
  { src: "/images/gallery/green-tea.webp", label: "A quiet green tea" },
];

export function CafeGallery() {
  return <section className="cc-gl" id="moments" aria-labelledby="cc-gl-title">
    <div className="cc-section cc-gl-grid">
      <motion.div className="cc-gl-copy" initial="hidden" whileInView="show" viewport={{ once: true, amount: .4 }} variants={{ hidden: {}, show: { transition: { staggerChildren: .08 } } }}>
        <motion.span className="cc-kicker" variants={rise}>LITTLE MOMENTS AT CUP CULTURE</motion.span>
        <motion.h2 id="cc-gl-title" variants={rise}>A cosy corner<br/><em>to call your own.</em></motion.h2>
        <motion.p variants={rise}>Warm light, a familiar cup and a table that’s always ready. Come for a quick pick-me-up — stay for the conversation.</motion.p>
        <motion.ul className="cc-gl-points" variants={rise}>
          <li><b>Ground floor</b><span>Cosy tables</span></li>
          <li><b>Rooftop</b><span>Tables up top</span></li>
          <li><b>All day</b><span>Chai to burgers</span></li>
        </motion.ul>
        <motion.a variants={rise} className="cc-gl-insta" href="https://www.instagram.com/cupcultureindia/" target="_blank" rel="noreferrer" whileHover={{ y: -2 }} whileTap={{ scale: .97 }}>
          <span className="cc-gl-insta-icon"><Instagram size={17}/></span>
          <span><small>Share your moment</small>Tag @cupcultureindia</span>
          <ArrowUpRight size={15}/>
        </motion.a>
      </motion.div>

      <motion.figure className="cc-gl-hero" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .8, ease }}>
        <img src="/images/cafe-interior.webp" alt="The glowing Cup Culture arch with the words Just what you needed, beside a wooden table"/>
        <span className="cc-gl-hero-glow" aria-hidden="true"/>
        <figcaption><span>INSIDE THE CAFÉ</span><strong>Just what you needed.</strong></figcaption>
      </motion.figure>
    </div>

    <div className="cc-gl-rows" aria-label="Moments from our tables">
      <GalleryRow items={rowOne}/>
      <GalleryRow items={rowTwo} reverse/>
    </div>
  </section>;
}

function GalleryRow({ items, reverse = false }: { items: { src: string; label: string }[]; reverse?: boolean }) {
  return <div className="cc-gl-row">
    <div className={`cc-gl-track${reverse ? " is-reverse" : ""}`}>
      {[...items, ...items].map((item, index) => <figure key={index} className="cc-gl-tile" aria-hidden={index >= items.length || undefined}>
        <img src={item.src} alt={index < items.length ? item.label : ""} loading="lazy"/>
        <figcaption>{item.label}</figcaption>
      </figure>)}
    </div>
  </div>;
}
