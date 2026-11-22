"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Bike, Check, ChevronRight, Copy, Minus, Plus, ShoppingBag, Store, Trash2, UtensilsCrossed, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/menu";
import type { CartLine } from "@/lib/store";

export type OrderReceipt = { id: string; name: string; type: string; total: number };

type CartDrawerProps = {
  open: boolean;
  hydrated: boolean;
  cart: CartLine[];
  subtotal: number; tax: number; taxRate: number; deliveryFee: number; total: number;
  orderType: string; tableChoice: string;
  onChooseService: (type: string, table: string) => void;
  onQuantity: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  onClose: () => void;
  onBrowse: () => void;
  onPlaceOrder: (event: React.FormEvent<HTMLFormElement>) => void;
  onWhatsApp: (form: HTMLFormElement | null) => void;
  busy: boolean; checkoutError: string; whatsappError: string;
  receipt: OrderReceipt | null;
};

type Step = "bag" | "details";
const floors = [{ name: "Ground Floor", tables: 5 }, { name: "Rooftop", tables: 11 }];
const services = [
  { id: "Takeaway", label: "Takeaway", hint: "Pick up at the counter", icon: Store },
  { id: "Dine In", label: "Dine in", hint: "We’ll bring it to your table", icon: UtensilsCrossed },
  { id: "Home Delivery", label: "Delivery", hint: "Comfort at your door", icon: Bike },
];
const ease = [.22, 1, .36, 1] as const;
const lineTotal = (line: CartLine) => (line.product.price + line.addons.reduce((sum, item) => sum + item.price, 0)) * line.quantity;

export function CartDrawer(props: CartDrawerProps) {
  const { open, onClose } = props;
  const [step, setStep] = useState<Step>("bag");
  const [isMobile, setIsMobile] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const query = window.matchMedia("(max-width: 720px)");
    const update = () => setIsMobile(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => { if (open) setStep("bag"); }, [open]);
  useEffect(() => { if (!props.cart.length && step === "details" && !props.receipt) setStep("bag"); }, [props.cart.length, step, props.receipt]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  const view = props.receipt ? "done" : !props.hydrated ? "loading" : props.cart.length === 0 ? "empty" : step;
  const sheet = isMobile ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } } : { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } };

  return <AnimatePresence>
    {open && <motion.div key="cart-backdrop" className="cc-cd-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .3 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.aside className="cc-cd" role="dialog" aria-modal="true" aria-label="Your bag" {...sheet} transition={reduce ? { duration: 0 } : { type: "spring", damping: 32, stiffness: 300 }}>
        <DragHandle isMobile={isMobile} onClose={onClose}/>
        <header className="cc-cd-head">
          <div className="cc-cd-head-row">
            <AnimatePresence mode="wait" initial={false}>
              {view === "details"
                ? <motion.button key="back" type="button" className="cc-cd-icon-btn" onClick={() => setStep("bag")} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} aria-label="Back to your bag"><ArrowLeft size={18}/></motion.button>
                : <motion.span key="bag" className="cc-cd-head-icon" initial={{ opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .6 }}><ShoppingBag size={18}/></motion.span>}
            </AnimatePresence>
            <div className="cc-cd-title">
              <span className="cc-kicker">{view === "details" ? "ALMOST THERE" : view === "done" ? "ALL DONE" : "A FEW GOOD THINGS"}</span>
              <h2>{view === "details" ? "Checkout" : view === "done" ? "Order placed" : "Your bag"}<span className="title-dot">.</span></h2>
            </div>
            <motion.button type="button" className="cc-cd-icon-btn" onClick={onClose} whileTap={{ scale: .9 }} whileHover={{ rotate: 90 }} aria-label="Close bag"><X size={18}/></motion.button>
          </div>
          {(view === "bag" || view === "details") && <Steps current={view === "bag" ? 0 : 1}/>}
        </header>

        <div className="cc-cd-body">
          <AnimatePresence mode="wait" initial={false}>
            {view === "loading" && <motion.p key="loading" className="cc-cd-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Opening your bag…</motion.p>}
            {view === "empty" && <EmptyBag key="empty" onBrowse={props.onBrowse}/>}
            {view === "bag" && <BagStep key="bag" {...props}/>}
            {view === "details" && <DetailsStep key="details" {...props}/>}
            {view === "done" && props.receipt && <DoneStep key="done" receipt={props.receipt} onClose={onClose}/>}
          </AnimatePresence>
        </div>

        <AnimatePresence initial={false}>
          {view === "bag" && <motion.footer key="bag-foot" className="cc-cd-foot" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ duration: .35, ease }}>
            <div className="cc-cd-foot-total"><span>Subtotal<small>{props.cart.reduce((sum, line) => sum + line.quantity, 0)} items</small></span><Ticker value={props.subtotal}/></div>
            <motion.button type="button" className="cc-cd-primary" onClick={() => setStep("details")} whileHover={{ y: -2 }} whileTap={{ scale: .97 }}>Continue to checkout <ArrowRight size={17}/></motion.button>
          </motion.footer>}
        </AnimatePresence>
      </motion.aside>
    </motion.div>}
  </AnimatePresence>;
}

function DragHandle({ isMobile, onClose }: { isMobile: boolean; onClose: () => void }) {
  const start = useRef<number | null>(null);
  if (!isMobile) return null;
  return <div className="cc-cd-handle-zone" onPointerDown={(event) => { start.current = event.clientY; }} onPointerUp={(event) => { if (start.current !== null && event.clientY - start.current > 50) onClose(); start.current = null; }} onTouchStart={(event) => { start.current = event.touches[0].clientY; }} onTouchEnd={(event) => { if (start.current !== null && event.changedTouches[0].clientY - start.current > 50) onClose(); start.current = null; }} aria-hidden="true"><span className="cc-cd-handle"/></div>;
}

function Steps({ current }: { current: number }) {
  return <ol className="cc-cd-steps" aria-label="Checkout progress">{["Your bag", "Details", "Done"].map((label, index) => <li key={label} className={index < current ? "done" : index === current ? "active" : ""} aria-current={index === current ? "step" : undefined}>
    <span className="cc-cd-step-dot">{index < current ? <Check size={11}/> : index + 1}</span><span className="cc-cd-step-label">{label}</span>
    {index < 2 && <span className="cc-cd-step-bar"><motion.i initial={false} animate={{ scaleX: index < current ? 1 : 0 }} transition={{ duration: .5, ease }}/></span>}
  </li>)}</ol>;
}

function Ticker({ value, className = "" }: { value: number; className?: string }) {
  return <span className={`cc-cd-ticker ${className}`}><AnimatePresence mode="popLayout" initial={false}><motion.span key={value} initial={{ y: "90%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-90%", opacity: 0 }} transition={{ duration: .32, ease }}>{formatPrice(value)}</motion.span></AnimatePresence></span>;
}

const stepMotion = { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 }, transition: { duration: .35, ease } };

function EmptyBag({ onBrowse }: { onBrowse: () => void }) {
  return <motion.div className="cc-cd-empty" {...stepMotion}>
    <div className="cc-cd-empty-cup" aria-hidden="true"><span className="cc-ft-steam s1"/><span className="cc-ft-steam s2"/><span className="cc-ft-steam s3"/><span className="cc-cd-empty-mug">☕</span></div>
    <h3>Your bag is feeling light.</h3>
    <p>Find a little something to make your day — a warm cup, a quick bite, or both.</p>
    <motion.button type="button" className="cc-cd-primary" onClick={onBrowse} whileHover={{ y: -2 }} whileTap={{ scale: .97 }}>Explore the menu <ArrowRight size={17}/></motion.button>
  </motion.div>;
}

function BagStep({ cart, onQuantity, onRemove, subtotal, tax, taxRate }: CartDrawerProps) {
  return <motion.div className="cc-cd-bag" {...stepMotion}>
    <motion.ul className="cc-cd-lines" layout>
      <AnimatePresence initial={false}>
        {cart.map((line, index) => <CartLineItem key={line.key} line={line} index={index} onQuantity={onQuantity} onRemove={onRemove}/>)}
      </AnimatePresence>
    </motion.ul>
    <motion.div className="cc-cd-summary" layout>
      <div><span>Items subtotal</span><Ticker value={subtotal}/></div>
      <div><span>Tax {taxRate ? `(${taxRate}%)` : ""}</span>{tax ? <Ticker value={tax}/> : <em>Set by café</em>}</div>
      <div><span>Payment</span><em>At the counter or on delivery</em></div>
    </motion.div>
  </motion.div>;
}

function CartLineItem({ line, index, onQuantity, onRemove }: { line: CartLine; index: number; onQuantity: (key: string, delta: number) => void; onRemove: (key: string) => void }) {
  const initials = line.product.name.split(/\s+/).filter((part) => /[A-Za-z]/.test(part[0])).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <motion.li className="cc-cd-line" layout initial={{ opacity: 0, y: 16, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: Math.min(index, 6) * .05, duration: .35, ease } }} exit={{ opacity: 0, x: 80, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: .3, ease } }}>
    <span className={`cc-cd-tile ${line.product.veg ? "veg" : "nonveg"}`} aria-hidden="true">{initials}<i/></span>
    <div className="cc-cd-line-copy">
      <small>{line.product.category}</small>
      <strong>{line.product.name}</strong>
      {line.addons.length > 0 && <span className="cc-cd-line-extra">+ {line.addons.map((item) => item.name).join(", ")}</span>}
      {line.instructions && <span className="cc-cd-line-extra">“{line.instructions}”</span>}
      <div className="cc-cd-line-row">
        <div className="cc-cd-stepper" role="group" aria-label={`Quantity of ${line.product.name}`}>
          <motion.button type="button" whileTap={{ scale: .8 }} onClick={() => onQuantity(line.key, -1)} aria-label={line.quantity === 1 ? `Remove ${line.product.name}` : "Decrease quantity"}>
            <AnimatePresence mode="wait" initial={false}>{line.quantity === 1 ? <motion.span key="trash" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}><Trash2 size={13}/></motion.span> : <motion.span key="minus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Minus size={13}/></motion.span>}</AnimatePresence>
          </motion.button>
          <span className="cc-cd-qty"><AnimatePresence mode="popLayout" initial={false}><motion.span key={line.quantity} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: .2 }}>{line.quantity}</motion.span></AnimatePresence></span>
          <motion.button type="button" whileTap={{ scale: .8 }} onClick={() => onQuantity(line.key, 1)} aria-label="Increase quantity"><Plus size={13}/></motion.button>
        </div>
        <Ticker value={lineTotal(line)} className="cc-cd-line-price"/>
      </div>
    </div>
    <motion.button type="button" className="cc-cd-remove" onClick={() => onRemove(line.key)} whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }} aria-label={`Remove ${line.product.name} from bag`}><X size={14}/></motion.button>
  </motion.li>;
}

function DetailsStep(props: CartDrawerProps) {
  const { orderType, tableChoice, onChooseService, total, deliveryFee, busy, checkoutError, whatsappError } = props;
  const formRef = useRef<HTMLFormElement>(null);
  const [floor, setFloor] = useState(tableChoice.startsWith("Rooftop") ? "Rooftop" : "Ground Floor");
  return <motion.form ref={formRef} className="cc-cd-details" onSubmit={props.onPlaceOrder} {...stepMotion} noValidate={false}>
    <section className="cc-cd-block">
      <h3><span>1</span> How would you like it?</h3>
      <div className="cc-cd-services">{services.map(({ id, label, hint, icon: Icon }) => <button key={id} type="button" className={orderType === id ? "chosen" : ""} onClick={() => onChooseService(id, id === "Dine In" ? tableChoice : "")} aria-pressed={orderType === id}>
        {orderType === id && <motion.span layoutId="cc-cd-service-pill" className="cc-cd-service-pill" transition={{ type: "spring", damping: 26, stiffness: 320 }}/>}
        <span className="cc-cd-service-icon"><Icon size={20}/></span><strong>{label}</strong><small>{hint}</small>
      </button>)}</div>
      <AnimatePresence initial={false}>
        {orderType === "Dine In" && <motion.div key="tables" className="cc-cd-reveal" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .35, ease }}>
          <div className="cc-cd-floors">{floors.map((item) => <button key={item.name} type="button" className={floor === item.name ? "chosen" : ""} onClick={() => setFloor(item.name)}>{floor === item.name && <motion.span layoutId="cc-cd-floor-pill" className="cc-cd-floor-pill"/>}<span>{item.name}</span></button>)}</div>
          <div className="cc-cd-tables">{Array.from({ length: floors.find((item) => item.name === floor)!.tables }).map((_, index) => { const value = `${floor} — Table ${index + 1}`; return <motion.button key={value} type="button" className={tableChoice === value ? "chosen" : ""} onClick={() => onChooseService("Dine In", value)} initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * .02 }} whileTap={{ scale: .9 }} aria-pressed={tableChoice === value}>{index + 1}</motion.button>; })}</div>
          <p className="cc-cd-hint">{tableChoice ? <>Seated at <b>{tableChoice}</b></> : "Tap your table number"}</p>
        </motion.div>}
        {orderType === "Takeaway" && <motion.div key="pickup" className="cc-cd-reveal" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .35, ease }}>
          <div className="cc-cd-fields one"><Field name="pickupAt" label="Pickup time · optional" type="time"/></div>
        </motion.div>}
        {orderType === "Home Delivery" && <motion.div key="delivery" className="cc-cd-reveal" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .35, ease }}>
          <div className="cc-cd-fields">
            <label className="cc-ct-float cc-ct-float-wide"><textarea name="address" rows={2} required placeholder=" "/><span>Delivery address</span></label>
            <Field name="postalCode" label="PIN code" inputMode="numeric" pattern="[0-9]{6}" required/>
            <Field name="landmark" label="Landmark · optional"/>
          </div>
        </motion.div>}
      </AnimatePresence>
    </section>

    <section className="cc-cd-block">
      <h3><span>2</span> Who’s ordering?</h3>
      <div className="cc-cd-fields">
        <Field name="customerName" label="Full name" minLength={2} autoComplete="name" required/>
        <Field name="customerPhone" label="Mobile number" type="tel" pattern="[0-9 +\(\)\-]{10,16}" autoComplete="tel" required/>
        <Field name="customerEmail" label="Email · optional" type="email" autoComplete="email" wide/>
        <label className="cc-cd-optin cc-ct-float-wide"><input type="checkbox" name="whatsappUpdates" defaultChecked/><span className="cc-cd-optin-box" aria-hidden="true"><Check size={13}/></span><span className="cc-cd-optin-copy"><strong>Send me order updates on WhatsApp</strong><small>We’ll message your mobile number when your order is confirmed, being prepared and ready.</small></span></label>
        <label className="cc-ct-float cc-ct-float-wide"><textarea name="orderInstructions" rows={2} placeholder=" "/><span>Order note · optional</span></label>
      </div>
    </section>

    <section className="cc-cd-receipt-mini">
      <div><span>Items</span><Ticker value={props.subtotal}/></div>
      {props.tax > 0 && <div><span>Tax</span><Ticker value={props.tax}/></div>}
      {orderType === "Home Delivery" && <div><span>Delivery</span>{deliveryFee ? <Ticker value={deliveryFee}/> : <em>Confirmed by café</em>}</div>}
      <div className="grand"><span>Total</span><Ticker value={total}/></div>
      <p>Pay {orderType === "Home Delivery" ? "on delivery" : "at the counter"} — no online payment needed.</p>
    </section>

    <AnimatePresence>{(checkoutError || whatsappError) && <motion.p key={checkoutError || whatsappError} className="cc-error" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0, x: [0, -6, 6, -3, 0] }} exit={{ opacity: 0 }}>{checkoutError || whatsappError}</motion.p>}</AnimatePresence>

    <div className="cc-cd-foot cc-cd-foot-inline">
      <motion.button className={`cc-cd-primary${busy ? " is-busy" : ""}`} disabled={busy} whileHover={busy ? undefined : { y: -2 }} whileTap={{ scale: .97 }}>
        <AnimatePresence mode="wait" initial={false}>{busy ? <motion.span key="busy" className="cc-cd-btn-label" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><span className="cc-ct-spinner"/> Placing your order…</motion.span> : <motion.span key="idle" className="cc-cd-btn-label" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>Place order · {formatPrice(total)} <ChevronRight size={17}/></motion.span>}</AnimatePresence>
      </motion.button>
      <motion.button type="button" className="cc-cd-whatsapp" onClick={() => props.onWhatsApp(formRef.current)} whileHover={{ y: -2 }} whileTap={{ scale: .97 }}><svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.2-.2-.5-.3Z"/></svg> Order on WhatsApp</motion.button>
    </div>
  </motion.form>;
}

function Field({ label, wide, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; wide?: boolean }) {
  return <label className={`cc-ct-float${wide ? " cc-ct-float-wide" : ""}`}><input {...props} placeholder=" "/><span>{label}</span></label>;
}

function DoneStep({ receipt, onClose }: { receipt: OrderReceipt; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();
  const first = receipt.name.split(" ")[0] || "friend";
  return <motion.div className="cc-cd-done" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 20 }} role="status">
    <span className="cc-cd-done-badge">
      {!reduce && Array.from({ length: 14 }).map((_, i) => { const a = (i / 14) * Math.PI * 2; return <motion.i key={i} initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: Math.cos(a) * 80, y: Math.sin(a) * 80, opacity: 0, scale: .3 }} transition={{ duration: 1, delay: .3, ease: "easeOut" }}/>; })}
      <motion.span initial={{ scale: 0, rotate: -140 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 11, stiffness: 200, delay: .1 }}><Check size={34}/></motion.span>
    </span>
    <span className="cc-kicker">THANKS, {first.toUpperCase()}</span>
    <h3>Your order is in.</h3>
    <p>We’ve received your {receipt.type.toLowerCase()} order. Keep this number handy if you contact the café.</p>
    <div className="cc-cd-ticket">
      <div><small>Order number</small><strong>{receipt.id}</strong></div>
      <motion.button type="button" onClick={() => { navigator.clipboard?.writeText(receipt.id).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1600); }).catch(() => {}); }} whileTap={{ scale: .9 }} aria-label="Copy order number">{copied ? <Check size={15}/> : <Copy size={15}/>}</motion.button>
      <span className="cc-cd-ticket-cut" aria-hidden="true"/>
      <div className="cc-cd-ticket-total"><small>Order total</small><strong>{formatPrice(receipt.total)}</strong></div>
    </div>
    <motion.button type="button" className="cc-cd-primary" onClick={onClose} whileHover={{ y: -2 }} whileTap={{ scale: .97 }}>Lovely, thanks <Check size={16}/></motion.button>
  </motion.div>;
}

export function CartBar({ count, subtotal, visible, onOpen }: { count: number; subtotal: number; visible: boolean; onOpen: () => void }) {
  return <AnimatePresence>
    {visible && <motion.div key="cart-bar" className="cc-cb" initial={{ y: 110, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 110, opacity: 0 }} transition={{ type: "spring", damping: 24, stiffness: 300 }}>
      <motion.button type="button" className="cc-cb-btn" onClick={onOpen} whileTap={{ scale: .97 }} aria-label={`View bag with ${count} ${count === 1 ? "item" : "items"}, subtotal ${formatPrice(subtotal)}`}>
        <span className="cc-cb-icon"><ShoppingBag size={19}/><motion.b key={count} initial={{ scale: .4 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10, stiffness: 420 }}>{count}</motion.b></span>
        <span className="cc-cb-copy"><small>{count} {count === 1 ? "item" : "items"} in your bag</small><Ticker value={subtotal}/></span>
        <span className="cc-cb-cta">View bag <ArrowRight size={16}/></span>
        <span className="cc-cb-shine" aria-hidden="true"/>
      </motion.button>
    </motion.div>}
  </AnimatePresence>;
}
