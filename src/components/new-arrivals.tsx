"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatPrice, type Product } from "@/lib/menu";

type Props = {
  items: Product[];
  imageFor: (item: Product) => string;
  quantities: Record<string, number>;
  onOpen: (item: Product) => void;
  onAdd: (item: Product, source: HTMLElement) => void;
  onSeeAll: () => void;
};

const ease = [.22, 1, .36, 1] as const;
const rise = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: .6, ease } } };

export function NewArrivals({ items, imageFor, quantities, onOpen, onAdd, onSeeAll }: Props) {
  return <section className="cc-section cc-new cc-na" id="new">
    <motion.div className="cc-na-head" initial="hidden" whileInView="show" viewport={{ once: true, amount: .5 }} variants={{ hidden: {}, show: { transition: { staggerChildren: .08 } } }}>
      <div>
        <motion.span className="cc-kicker" variants={rise}>A FRESH LITTLE SOMETHING</motion.span>
        <motion.h2 variants={rise}>New to the table<span className="title-dot">.</span></motion.h2>
      </div>
      <motion.button type="button" className="cc-na-all" onClick={onSeeAll} variants={rise}>Meet the new arrivals <ArrowRight size={15}/></motion.button>
    </motion.div>

    {items.length
      ? <motion.div className="cc-na-grid" initial="hidden" whileInView="show" viewport={{ once: true, amount: .2 }} variants={{ hidden: {}, show: { transition: { staggerChildren: .12 } } }}>
          {items.slice(0, 4).map((item, index) => <ArrivalCard key={item.id} item={item} index={index} image={imageFor(item)} quantity={quantities[item.id] || 0} onOpen={onOpen} onAdd={onAdd}/>)}
        </motion.div>
      : <p className="cc-muted">The café team will share new favourites here soon.</p>}
  </section>;
}

function ArrivalCard({ item, index, image, quantity, onOpen, onAdd }: { item: Product; index: number; image: string; quantity: number; onOpen: (item: Product) => void; onAdd: (item: Product, source: HTMLElement) => void }) {
  const [added, setAdded] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  return <motion.article className="cc-na-card" variants={rise}>
    <button type="button" className="cc-na-photo" onClick={() => onOpen(item)} aria-label={`View ${item.name}`}>
      <img src={image} alt={item.name} loading="lazy"/>
      <span className="cc-na-stamp" aria-hidden="true">
        <svg viewBox="0 0 100 100"><defs><path id={`cc-na-circle-${index}`} d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0"/></defs><text><textPath href={`#cc-na-circle-${index}`}>JUST IN · FRESH TODAY · JUST IN · FRESH TODAY ·</textPath></text></svg>
        <b>New</b>
      </span>
    </button>
    <div className="cc-na-body">
      <span className="cc-na-meta"><i className={item.veg ? "veg" : "nonveg"}/>{item.category} <em>0{index + 1}</em></span>
      <button type="button" className="cc-na-name" onClick={() => onOpen(item)}>{item.name}</button>
      <p>{item.description}</p>
      <div className="cc-na-foot">
        <strong>{formatPrice(item.price)}</strong>
        <motion.button type="button" className={`cc-na-add${added ? " is-added" : ""}`} disabled={!item.available} whileTap={{ scale: .95 }}
          onClick={(event) => { onAdd(item, event.currentTarget); setAdded(true); if (timer.current !== null) window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setAdded(false), 1400); }}
          aria-label={item.available ? `Add ${item.name} to bag` : `${item.name} is sold out`}>
          <AnimatePresence mode="wait" initial={false}>
            {added
              ? <motion.span key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .2 }}><Check size={15}/> Added</motion.span>
              : <motion.span key="add" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .2 }}><Plus size={15}/> {item.available ? "Add to bag" : "Sold out"}</motion.span>}
          </AnimatePresence>
          {quantity > 0 && <motion.b key={quantity} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, stiffness: 420 }}>{quantity}</motion.b>}
        </motion.button>
      </div>
    </div>
  </motion.article>;
}
