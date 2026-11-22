"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { formatPrice, type Product } from "@/lib/menu";

type Props = {
  item: Product | null;
  quantity: number;
  onConfirm: () => void;
  onCancel: () => void;
  onViewBag: () => void;
};

/** Asks before adding another of a dish that is already in the bag. */
export function AddAgainDialog({ item, quantity, onConfirm, onCancel, onViewBag }: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { event.stopPropagation(); onCancel(); } };
    window.addEventListener("keydown", onKey, true);
    const focus = window.setTimeout(() => confirmRef.current?.focus(), 60);
    return () => { window.removeEventListener("keydown", onKey, true); window.clearTimeout(focus); };
  }, [item, onCancel]);

  return <AnimatePresence>
    {item && <motion.div key="add-again" className="cc-aa-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <motion.div className="cc-aa" role="alertdialog" aria-modal="true" aria-labelledby="cc-aa-title" aria-describedby="cc-aa-desc"
        initial={{ opacity: 0, y: 40, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: .97 }}
        transition={{ type: "spring", damping: 26, stiffness: 340 }}>
        <button type="button" className="cc-aa-close" onClick={onCancel} aria-label="Close"><X size={16}/></button>
        <span className="cc-aa-badge" aria-hidden="true"><ShoppingBag size={20}/><b>{quantity}</b></span>
        <span className="cc-kicker">ALREADY IN YOUR BAG</span>
        <h3 id="cc-aa-title">Add another {item.name}?</h3>
        <p id="cc-aa-desc">You already have <b>{quantity}</b> in your bag. Tap below if you’d like one more.</p>
        <div className="cc-aa-actions">
          <motion.button ref={confirmRef} type="button" className="cc-aa-yes" onClick={onConfirm} whileTap={{ scale: .97 }}><Plus size={16}/> Yes, add one more · {formatPrice(item.price)}</motion.button>
          <motion.button type="button" className="cc-aa-no" onClick={onCancel} whileTap={{ scale: .97 }}>No, keep {quantity}</motion.button>
        </div>
        <button type="button" className="cc-aa-view" onClick={onViewBag}>View my bag</button>
      </motion.div>
    </motion.div>}
  </AnimatePresence>;
}
