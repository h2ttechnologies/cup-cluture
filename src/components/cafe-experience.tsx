"use client";

import { AnimatePresence, MotionConfig, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Clock3, Coffee, Heart, Instagram, Leaf, MapPin, Menu as MenuIcon, Minus, Package, Phone, Plus, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { categories, formatPrice, products as seedProducts, type Product } from "@/lib/menu";
import { SiteFooter } from "@/components/site-footer";
import { HeroSection } from "@/components/hero-section";
import { NewArrivals } from "@/components/new-arrivals";
import { CafeGallery } from "@/components/cafe-gallery";
import { AddAgainDialog } from "@/components/add-again-dialog";
import { CartBar, CartDrawer } from "@/components/cart-drawer";
import { ContactSection } from "@/components/contact-section";
import { GOOGLE_REVIEW_COUNT, guestReviews } from "@/lib/reviews";
import { cartSubtotal, useStore, type CartLine } from "@/lib/store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/browser";

type Overlay = "cart" | "account" | "detail" | "privacy" | "terms" | null;

type OrderReceipt = { id: string; name: string; type: string; total: number };
type AddedToast = { id: number; name: string; image: string };
type FlyingItem = { id: number; label: string; startX: number; startY: number; endX: number; endY: number };
const extraOptions = [{ name: "Cheese Slice", price: 20 }, { name: "Peri Peri Masala", price: 10 }, { name: "Mayo", price: 10 }, { name: "Butter", price: 15 }];

const isVeg = (item: Product) => item.veg;
const supportsExtras = (category: string) => ["QUICK BITES", "BUN BASH", "SANDWICH CULTURE", "BURGER MANIA", "FRIES CRAZE", "MOMOS ZONE", "MAGGI HUB", "CC WRAPS"].includes(category);
const displayImage = (item: Product) => item.image || seedProducts.find((seed) => seed.id === item.id)?.image || "/images/photo-sheet.png";

function Logo({ compact = false }: { compact?: boolean }) {
  return <a className={`cc-logo ${compact ? "cc-logo-compact" : ""}`} href="#top" aria-label="Cup Culture home"><span className="cc-logo-image"><img src="/images/logo.jpg" alt=""/></span><span className="cc-logo-text"><strong>CUP CULTURE</strong><small>JUST WHAT YOU NEEDED.</small></span></a>;
}

function Price({ value }: { value: number }) { return <>{formatPrice(value)}</>; }

function VegMark({ veg }: { veg: boolean }) { return <span className={`cc-diet ${veg ? "is-veg" : "is-nonveg"}`} title={veg ? "Vegetarian" : "Non-vegetarian"}><i/>{veg ? "VEG" : "NON-VEG"}</span>; }

const reviewHighlights = ["Totally worth the money", "Standout hot chocolate", "Reasonable prices", "Peaceful ambience", "Clean & comfortable", "Calm atmosphere", "Great with friends & family"];
const reviewInitials = (name: string) => name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
const REVIEW_DELAY = 6500;

function ReviewsShowcase() {
  const [[index, direction], setSlide] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const total = guestReviews.length;
  const running = !paused && inView && !reduceMotion;
  const go = (step: number) => setSlide(([current]) => [(current + step + total) % total, step]);
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => go(1), REVIEW_DELAY);
    return () => window.clearTimeout(timer);
  }, [index, running]);
  const review = guestReviews[index];
  const words = review.text.split(" ");
  return <div className="cc-rv" ref={rootRef} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={()=>setPaused(false)} onKeyDown={(event)=>{ if(event.key==="ArrowRight") go(1); if(event.key==="ArrowLeft") go(-1); }}>
    <span className="cc-rv-blob cc-rv-blob-a" aria-hidden="true"/><span className="cc-rv-blob cc-rv-blob-b" aria-hidden="true"/>
    <div className="cc-rv-stage" aria-live={running ? "off" : "polite"}>
      <span className="cc-rv-back cc-rv-back-2" aria-hidden="true"/>
      <span className="cc-rv-back cc-rv-back-1" aria-hidden="true"/>
      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.article key={index} className="cc-rv-card" custom={direction}
          variants={{ enter: (d: number) => ({ x: d * 90, opacity: 0, rotate: d * 5, scale: .95 }), center: { x: 0, opacity: 1, rotate: 0, scale: 1 }, exit: (d: number) => ({ x: d * -90, opacity: 0, rotate: d * -5, scale: .93 }) }}
          initial="enter" animate="center" exit="exit" transition={{ type: "spring", damping: 26, stiffness: 210 }}
          drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={.55} whileDrag={{ scale: .98, cursor: "grabbing" }}
          onDragStart={()=>setPaused(true)} onDragEnd={(_, info)=>{ setPaused(false); if (info.offset.x < -55 || info.velocity.x < -420) go(1); else if (info.offset.x > 55 || info.velocity.x > 420) go(-1); }}
          aria-roledescription="slide" aria-label={`Review ${index + 1} of ${total}`}>
          <div className="cc-rv-top"><span className="cc-rv-source"><span className="cc-google-mark" aria-hidden="true">G</span>Google review</span><span className="cc-rv-num">{String(index + 1).padStart(2, "0")}<small>/{String(total).padStart(2, "0")}</small></span></div>
          <span className="cc-rv-quote" aria-hidden="true">“</span>
          <p className={`cc-rv-text${review.text.length > 170 ? " is-long" : review.text.length < 40 ? " is-short" : ""}`}>{words.map((word, wordIndex) => <motion.span key={wordIndex} initial={reduceMotion ? false : { opacity: 0, y: 9, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: .18 + wordIndex * .032, duration: .38, ease: "easeOut" }}>{word}{" "}</motion.span>)}</p>
          <motion.div className="cc-rv-author" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 + words.length * .032, duration: .4 }}>
            <span className={`cc-rv-avatar tone-${index % 3}`}>{reviewInitials(review.name)}</span>
            <span><strong>{review.name}</strong><small>Guest at Cup Culture</small></span>
          </motion.div>
        </motion.article>
      </AnimatePresence>
    </div>
    <p className="cc-rv-hint" aria-hidden="true">Swipe for more kind words</p>
    <div className="cc-rv-controls">
      <motion.button type="button" className="cc-rv-arrow" onClick={()=>go(-1)} whileHover={{ x: -3 }} whileTap={{ scale: .88 }} aria-label="Previous review"><ArrowLeft size={17}/></motion.button>
      {total <= 10 ? <div className="cc-rv-dots">{guestReviews.map((item, dotIndex) => <button key={item.name} type="button" className={dotIndex === index ? "active" : ""} aria-label={`Show review from ${item.name}`} aria-current={dotIndex === index || undefined} onClick={()=>setSlide([dotIndex, dotIndex >= index ? 1 : -1])}>{dotIndex === index && <motion.i key={`${index}-${running}`} initial={{ scaleX: 0 }} animate={{ scaleX: running ? 1 : 0 }} transition={{ duration: running ? REVIEW_DELAY / 1000 : .2, ease: "linear" }}/>}</button>)}</div>
        : <div className="cc-rv-progress" role="progressbar" aria-label="Review position" aria-valuemin={1} aria-valuemax={total} aria-valuenow={index + 1}><span className="cc-rv-progress-count">{String(index + 1).padStart(2, "0")}<small> / {total}</small></span><span className="cc-rv-progress-track"><motion.i animate={{ width: `${((index + 1) / total) * 100}%` }} transition={{ duration: .5, ease: [.22, 1, .36, 1] }}/></span></div>}
      <motion.button type="button" className="cc-rv-arrow" onClick={()=>go(1)} whileHover={{ x: 3 }} whileTap={{ scale: .88 }} aria-label="Next review"><ArrowRight size={17}/></motion.button>
    </div>
    <div className="cc-rv-tags" aria-hidden="true"><div className="cc-rv-tags-track">{[...reviewHighlights, ...reviewHighlights].map((tag, tagIndex) => <span key={tagIndex}><Heart size={11} fill="currentColor"/>{tag}</span>)}</div></div>
  </div>;
}

export function CafeExperience() {
  const { cart, favorites, hydrated, addToCart, changeQuantity, removeFromCart, toggleFavorite, clearCart, products: catalog } = useStore();
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [diet, setDiet] = useState("all");
  const [sort, setSort] = useState("featured");
  const [collection, setCollection] = useState("all");
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [detailExtras, setDetailExtras] = useState<string[]>([]);
  const [detailInstructions, setDetailInstructions] = useState("");
  const [addedNotice, setAddedNotice] = useState(false);
  const [orderType, setOrderType] = useState("");
  const [tableChoice, setTableChoice] = useState("");
  const [addedToast, setAddedToast] = useState<AddedToast | null>(null);
  const [flyingItem, setFlyingItem] = useState<FlyingItem | null>(null);
  const [bagPulse, setBagPulse] = useState(0);
  const [pendingAdd, setPendingAdd] = useState<{ item: Product; source: HTMLElement } | null>(null);
  const cancelPendingAdd = useCallback(() => setPendingAdd(null), []);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [orderReceipt, setOrderReceipt] = useState<OrderReceipt | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [settings, setSettings] = useState<any>({ business: {}, checkout: {} });
  const [user, setUser] = useState<any>(null);
  const [accountMode, setAccountMode] = useState<"login" | "signup" | "forgot">("login");
  const [accountTab, setAccountTab] = useState("orders");
  const [accountMessage, setAccountMessage] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountBusy, setAccountBusy] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [customerBookings, setCustomerBookings] = useState<any[]>([]);
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
  const [savedAddress, setSavedAddress] = useState("");
  const bagButtonRef = useRef<HTMLButtonElement>(null);
  const toastTimerRef = useRef<number | null>(null);
  const flightTimerRef = useRef<number | null>(null);
  const addSequenceRef = useRef(0);

  const cartQuantities = useMemo(() => cart.reduce<Record<string, number>>((map, line) => { map[line.product.id] = (map[line.product.id] || 0) + line.quantity; return map; }, {}), [cart]);
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cartSubtotal(cart);
  const taxRate = Math.max(0, Number(settings.checkout?.tax_rate_percent) || 0);
  const tax = Math.round(subtotal * taxRate) / 100;
  const deliveryFee = orderType === "Home Delivery" ? Math.max(0, Number(settings.checkout?.delivery_fee) || 0) : 0;
  const cartTotal = subtotal + tax + deliveryFee;
  const visibleProducts = useMemo(() => catalog.filter((item) => {
    const matchesQuery = `${item.name} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory;
    const matchesDiet = diet === "all" || (diet === "veg" ? item.veg : !item.veg);
    const matchesCollection = collection === "all" || (collection === "popular" ? item.popular : item.isNew);
    return matchesQuery && matchesCategory && matchesDiet && matchesCollection;
  }).sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : 0), [catalog, query, activeCategory, diet, sort, collection]);

  useEffect(() => {
    fetch("/api/settings").then((response) => response.json()).then((result) => {
      setSettings(result);
      setWhatsappNumber(String(result.business?.whatsapp_number || ""));
    }).catch(() => {});
    if (isSupabaseConfigured) {
      try {
        const client = createClient();
        client.auth.getUser().then(({ data }) => setUser(data.user));
        const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
        return () => subscription.unsubscribe();
      } catch { /* account UI explains missing configuration */ }
    } else {
      setCustomerOrders(JSON.parse(localStorage.getItem("cc-orders") || "[]"));
      setCustomerBookings(JSON.parse(localStorage.getItem("cc-reservations") || "[]"));
    }
  }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") closeOverlay(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === "#bag") setOverlay("cart");
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);
  useEffect(() => {
    if (!user) return;
    fetch("/api/profile").then((response) => response.json()).then((result) => {
      setCustomerOrders(result.orders || []); setCustomerBookings(result.reservations || []); setCustomerAddresses(result.addresses || []);
    }).catch(() => {});
  }, [user]);
  useEffect(() => () => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    if (flightTimerRef.current !== null) window.clearTimeout(flightTimerRef.current);
  }, []);

  function openDetail(item: Product) { setDetail(item); setDetailQuantity(1); setDetailExtras([]); setDetailInstructions(""); setAddedNotice(false); setOverlay("detail"); }
  function closeOverlay() { setOverlay(null); setOrderReceipt(null); setCheckoutError(""); setWhatsappError(""); }
  function toggleExtra(name: string) { setDetailExtras((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]); }
  function showAddedFeedback(item: Product, source?: HTMLElement) {
    const id = ++addSequenceRef.current;
    const sourceRect = source?.getBoundingClientRect();
    const bagRect = bagButtonRef.current?.getBoundingClientRect();
    if (sourceRect && bagRect) {
      setFlyingItem({ id, label: formatPrice(item.price), startX: sourceRect.left + sourceRect.width / 2 - 26, startY: sourceRect.top + sourceRect.height / 2 - 17, endX: bagRect.left + bagRect.width / 2 - 26, endY: bagRect.top + bagRect.height / 2 - 17 });
      if (flightTimerRef.current !== null) window.clearTimeout(flightTimerRef.current);
      flightTimerRef.current = window.setTimeout(() => setFlyingItem((current) => current?.id === id ? null : current), 1000);
    }
    window.setTimeout(() => setBagPulse(id), 620);
    setAddedToast({ id, name: item.name, image: displayImage(item) });
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setAddedToast((current) => current?.id === id ? null : current), 4200);
  }
  /** Quick add from the menu. If the dish is already in the bag, ask first. Returns true when it was added right away. */
  function addProductToBag(item: Product, source: HTMLElement) {
    if (cartQuantities[item.id]) { setPendingAdd({ item, source }); return false; }
    addToCart(item); showAddedFeedback(item, source); return true;
  }
  function confirmPendingAdd() {
    if (!pendingAdd) return;
    addToCart(pendingAdd.item);
    showAddedFeedback(pendingAdd.item, pendingAdd.source.isConnected ? pendingAdd.source : undefined);
    setPendingAdd(null);
  }
  function addDetailToBag(source?: HTMLElement) {
    if (!detail) return;
    if (!detail.available) return;
    const chosen = extraOptions.filter((item) => detailExtras.includes(item.name));
    addToCart(detail, detailQuantity, chosen, detailInstructions);
    showAddedFeedback(detail, source);
    setAddedNotice(true);
    window.setTimeout(() => setAddedNotice(false), 1900);
  }

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setCheckoutError("");
    if (!cart.length) { setCheckoutError("Your bag is empty. Add something from the menu first."); return; }
    if (!orderType) { setCheckoutError("Choose takeaway, a table or home delivery before placing your order."); return; }
    if (orderType === "Dine In" && !tableChoice) { setCheckoutError("Choose your table before placing your order."); return; }
    setCheckoutBusy(true);
    const data = new FormData(event.currentTarget);
    const values = Object.fromEntries(data.entries());
    const input = {
      customer: { name: String(values.customerName || ""), phone: String(values.customerPhone || ""), email: String(values.customerEmail || "") },
      type: orderType, payment: orderType === "Home Delivery" ? "Cash on delivery" : "Pay at counter",
      delivery: { address: String(values.address || ""), postalCode: String(values.postalCode || ""), landmark: String(values.landmark || ""), table: tableChoice, pickupAt: String(values.pickupAt || "") },
      instructions: String(values.orderInstructions || ""), whatsappUpdates: values.whatsappUpdates === "on",
      lines: cart.map((line) => ({ productId: line.product.id, quantity: line.quantity, addons: line.addons.map((addon) => addon.name), instructions: line.instructions })),
    };
    try {
      let order: OrderReceipt;
      if (!isSupabaseConfigured) {
        const id = `CC-${Date.now().toString().slice(-7)}`;
        order = { id, name: input.customer.name, type: orderType, total: cartTotal };
        const previous = JSON.parse(localStorage.getItem("cc-orders") || "[]");
        localStorage.setItem("cc-orders", JSON.stringify([{ ...order, phone: input.customer.phone, status: "Order Placed", lines: cart, created_at: new Date().toISOString() }, ...previous]));
        setCustomerOrders((current) => [{ ...order, phone: input.customer.phone, status: "Order Placed", lines: cart }, ...current]);
      } else {
        const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "We couldn't place your order. Please try again.");
        order = result.order;
      }
      setOrderReceipt(order); clearCart();
    } catch (cause) { setCheckoutError(cause instanceof Error ? cause.message : "We couldn't place your order."); }
    finally { setCheckoutBusy(false); }
  }

  function orderOnWhatsApp(form?: HTMLFormElement | null) {
    setWhatsappError("");
    if (!whatsappNumber) { setWhatsappError("WhatsApp ordering isn’t set up yet. Place the order here or contact the café using the details below."); return; }
    if (!orderType) { setWhatsappError("Choose takeaway, a table or home delivery first."); return; }
    if (orderType === "Dine In" && !tableChoice) { setWhatsappError("Choose your table before continuing."); return; }
    const data = form ? new FormData(form) : new FormData();
    const name = String(data.get("customerName") || "").trim();
    const phone = String(data.get("customerPhone") || "").trim();
    if (name.length < 2 || !/^\+?[0-9 ()-]{10,16}$/.test(phone)) { setWhatsappError("Add your name and a valid mobile number before ordering on WhatsApp."); return; }
    const lines = cart.map((line) => `• ${line.product.name} × ${line.quantity} — ${formatPrice((line.product.price + line.addons.reduce((sum, item) => sum + item.price, 0)) * line.quantity)}${line.addons.length ? `\n  Extras: ${line.addons.map((item) => item.name).join(", ")}` : ""}${line.instructions ? `\n  Note: ${line.instructions}` : ""}`);
    const typeDetails = orderType === "Home Delivery" ? [`Address: ${data.get("address") || "Please confirm with me"}`, `Landmark: ${data.get("landmark") || "—"}`, `PIN code: ${data.get("postalCode") || "—"}`] : orderType === "Takeaway" ? [`Pickup time: ${data.get("pickupAt") || "Please confirm with me"}`] : [`Table: ${tableChoice}`];
    const message = ["*CUP CULTURE ORDER REQUEST*", `Order reference: CC-WA-${Date.now().toString().slice(-7)}`, `Customer: ${name}`, `Mobile: ${phone}`, "", "*Your items*", ...lines, "", `Order type: ${orderType}`, ...typeDetails, `Payment: ${orderType === "Home Delivery" ? "Cash on delivery" : "Pay at counter"}`, `Total: ${formatPrice(cartTotal)}`, data.get("orderInstructions") ? `Notes: ${data.get("orderInstructions")}` : ""].filter(Boolean).join("\n");
    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  async function submitAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setAccountError(""); setAccountMessage(""); setAccountBusy(true);
    const values = new FormData(event.currentTarget); const email = String(values.get("email")); const password = String(values.get("password") || "");
    try {
      if (!isSupabaseConfigured) throw new Error("Customer accounts are not enabled yet. The Supabase account service must be connected first.");
      const client = createClient();
      if (accountMode === "forgot") {
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/#account` }); if (error) throw error;
        setAccountMessage("If there’s an account for that address, a reset link is on its way.");
      } else if (accountMode === "signup") {
        const { error } = await client.auth.signUp({ email, password, options: { data: { full_name: String(values.get("fullName") || ""), phone: String(values.get("phone") || "") } } }); if (error) throw error;
        setAccountMessage("Check your email to confirm your account.");
      } else {
        const { data, error } = await client.auth.signInWithPassword({ email, password }); if (error) throw error; setUser(data.user);
        setAccountMessage("You’re signed in. Your account is ready.");
      }
    } catch (cause) { setAccountError(cause instanceof Error ? cause.message : "We couldn't sign you in."); }
    finally { setAccountBusy(false); }
  }

  async function signOut() { if (!isSupabaseConfigured) return; await createClient().auth.signOut(); setUser(null); setCustomerOrders([]); setCustomerBookings([]); }
  async function saveAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSupabaseConfigured) { setCustomerAddresses((items) => [...items, { id: Date.now(), address: savedAddress }]); setSavedAddress(""); return; }
    const response = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address: savedAddress }) });
    const result = await response.json(); if (response.ok) { setCustomerAddresses(result.addresses || []); setSavedAddress(""); } else setAccountError(result.error || "Could not save address.");
  }

  const newItems = catalog.filter((item) => item.isNew);
  const business = settings.business || {};
  const locationName = business.address || "Cup Culture, T-Nagar, Villankurichi, Coimbatore, Tamil Nadu 641035";
  const locationUrl = business.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;
  return <MotionConfig reducedMotion="user"><div className={`cc-page ${itemCount > 0 ? "has-items-in-cart" : ""}`} id="top">
    <div className="cc-ribbon"><span>Small moments. Big comfort.</span><span>Made for your everyday <b>✳</b></span><span className="ribbon-location"><MapPin size={12}/> Villankurichi · Coimbatore</span></div>
    <header className="cc-header"><Logo/><nav className={`cc-nav ${mobileNav ? "nav-visible" : ""}`} aria-label="Main navigation"><a href="#menu" onClick={() => setMobileNav(false)}>The menu</a><a href="#story" onClick={() => setMobileNav(false)}>Our story</a><a href="#reviews" onClick={() => setMobileNav(false)}>Reviews</a><a href="#contact" onClick={() => setMobileNav(false)}>Find us</a></nav><div className="cc-actions"><button ref={bagButtonRef} className="cc-bag-button" onClick={() => { setOrderReceipt(null); setOverlay("cart"); }} aria-label={`Open bag with ${itemCount} items`}><motion.span key={`icon-${bagPulse}`} className="cc-bag-icon" animate={bagPulse?{scale:[1,1.32,.92,1.06,1],rotate:[0,-12,9,-3,0]}:{}} transition={{duration:.6,ease:"easeOut"}}><ShoppingBag size={19}/></motion.span><span>Bag</span><motion.b key={`count-${itemCount}`} initial={bagPulse?{scale:.3,y:-6}:false} animate={{scale:1,y:0}} transition={{type:"spring",damping:10,stiffness:380}}>{itemCount}</motion.b>{bagPulse>0&&<motion.i key={`ring-${bagPulse}`} className="cc-bag-ring" initial={{scale:.6,opacity:.7}} animate={{scale:1.6,opacity:0}} transition={{duration:.7,ease:"easeOut"}}/>}</button><button className="cc-mobile-toggle" onClick={() => setMobileNav((open) => !open)} aria-label="Toggle navigation">{mobileNav ? <X size={21}/> : <MenuIcon size={21}/>}</button></div></header>

    {flyingItem&&<motion.div key={flyingItem.id} className="cc-flying-chip" aria-hidden="true" initial={{x:flyingItem.startX,y:flyingItem.startY,scale:.5,opacity:0}} animate={{x:[flyingItem.startX,(flyingItem.startX+flyingItem.endX)/2,flyingItem.endX],y:[flyingItem.startY,Math.min(flyingItem.startY,flyingItem.endY)-110,flyingItem.endY],scale:[.5,1.12,.3],opacity:[0,1,0],rotate:[0,-8,0]}} transition={{duration:.82,times:[0,.42,1],ease:[.45,0,.2,1]}} onAnimationComplete={()=>setFlyingItem((current)=>current?.id===flyingItem.id?null:current)}><Coffee size={13}/>{flyingItem.label}</motion.div>}
    <AnimatePresence>{addedToast&&<motion.div key={addedToast.id} className="cc-add-toast" role="status" aria-live="polite" initial={{opacity:0,y:-22,scale:.9}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-12,scale:.96}} transition={{type:"spring",damping:24,stiffness:340}}><motion.span className="cc-toast-check" initial={{scale:0,rotate:-120}} animate={{scale:1,rotate:0}} transition={{type:"spring",damping:12,stiffness:260,delay:.08}}><Check size={18}/></motion.span><span><strong>Added to your bag</strong><small>{addedToast.name}</small></span><motion.button type="button" className="cc-toast-view" aria-label={`View bag with ${addedToast.name}`} onClick={()=>{setAddedToast(null);setOrderReceipt(null);setOverlay("cart");}} whileHover={{scale:1.04}} whileTap={{scale:.96}}>View bag <ArrowRight size={13}/></motion.button></motion.div>}</AnimatePresence>

    <main>
      <HeroSection onCategory={(id)=>{setActiveCategory(id);setCollection("all");setQuery("");}}/>

      <NewArrivals items={newItems} imageFor={displayImage} quantities={cartQuantities} onOpen={openDetail} onAdd={addProductToBag} onSeeAll={()=>{setCollection("new");setActiveCategory("all");document.getElementById("menu")?.scrollIntoView({behavior:"smooth"});}}/>

      <section className="cc-menu-section" id="menu"><div className="cc-section cc-menu-wrap"><div className="cc-menu-heading"><div><span className="cc-kicker">THE CUP CULTURE MENU</span><h2>Craving something?</h2><p>Go with a familiar favourite or let curiosity lead the way.</p></div><div className="menu-doodle" aria-hidden="true">made<br/>with ♡</div></div>
        <div className="cc-menu-tools"><label className="cc-search"><Search size={18}/><input type="search" aria-label="Search menu" placeholder="Search the menu… try “Momos”" value={query} onChange={(event) => setQuery(event.target.value)}/>{query&&<button onClick={()=>setQuery("")} aria-label="Clear search"><X size={15}/></button>}</label><select className="cc-select" aria-label="Filter vegetarian options" value={diet} onChange={(event)=>setDiet(event.target.value)}><option value="all">All dishes</option><option value="veg">Vegetarian</option><option value="nonveg">Non-vegetarian</option></select><select className="cc-select" aria-label="Sort menu" value={sort} onChange={(event)=>setSort(event.target.value)}><option value="featured">Our picks</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
        <div className="cc-menu-filters"><div className="cc-filter-scroller"><button className={`cc-category-pill ${activeCategory==="all"?"chosen":""}`} onClick={()=>setActiveCategory("all")}>Everything <span>77</span></button>{categories.map((category)=><button key={category.id} className={`cc-category-pill ${activeCategory===category.id?"chosen":""}`} onClick={()=>setActiveCategory(category.id)}>{category.name}</button>)}</div><div className="cc-collection-pills"><button className={`cc-mini-pill ${collection==="all"?"chosen":""}`} onClick={()=>setCollection("all")}>All</button><button className={`cc-mini-pill ${collection==="popular"?"chosen":""}`} onClick={()=>setCollection("popular")}><Heart size={12}/> Most loved</button><button className={`cc-mini-pill ${collection==="new"?"chosen":""}`} onClick={()=>setCollection("new")}><Sparkles size={12}/> New arrivals</button><span className="cc-results-count">{visibleProducts.length} things to love</span></div></div>
        {visibleProducts.length ? <MenuBoard items={visibleProducts} sorted={sort!=="featured"} activeLabel={activeCategory==="all"?"The full menu":(categories.find((category)=>category.id===activeCategory)?.name||"The menu")} quantities={cartQuantities} onOpen={openDetail} onAdd={addProductToBag}/> : <div className="cc-empty"><span className="cc-empty-icon">☕</span><h3>Nothing on that plate.</h3><p>Try another search or browse everything on the menu.</p><button className="cc-button cc-button-dark" onClick={()=>{setQuery("");setActiveCategory("all");setDiet("all");setCollection("all");}}>Show me the menu</button></div>}
        <p className="cc-menu-footnote"><span className="cc-diet is-veg"><i/>VEG</span> Vegetarian <span className="cc-diet is-nonveg"><i/>NON-VEG</span> Non-vegetarian · Every item is made to order · Add-ons are always your choice</p>
      </div></section>

      <CafeGallery/>

      <section className="cc-story" id="story"><div className="cc-section cc-story-grid"><div className="cc-story-art"><motion.div className="story-photo story-photo-one" whileInView={{rotate:-4,y:0,opacity:1}} initial={{rotate:4,y:30,opacity:0}} viewport={{once:true}}><img src="/images/gallery/coffee-mug.webp" alt="A Coffee Buzz mug of hot coffee on a Cup Culture table"/></motion.div><motion.div className="story-photo story-photo-two" whileInView={{rotate:5,y:0,opacity:1}} initial={{rotate:-6,y:25,opacity:0}} viewport={{once:true}} transition={{delay:.15}}><img src="/images/corn.webp" alt="A bowl of spiced crispy corn"/></motion.div><span className="story-sticker">take it<br/>easy ✿</span></div><div className="cc-story-copy"><span className="cc-kicker">A PLACE TO PAUSE</span><h2>Your everyday escape,<br/><em>only at Cup Culture.</em></h2><p>We believe good food and a little comfort belong in every kind of day. From a familiar cup of tea to the bite you’ve been thinking about, our menu brings together the things that make you feel at home.</p><p>Come in for a quick pick-me-up, catch up over a table, or take a little something along on your way. However you find us, we’re glad you’re here.</p><a className="cc-button cc-button-dark" href="#contact">Come say hello <ArrowRight size={15}/></a><div className="story-values"><span><Leaf size={15}/> Freshly prepared</span><span><Heart size={15}/> For every craving</span><span><Coffee size={15}/> Everyday comfort</span></div></div></div></section>

      <section className="cc-reviews" id="reviews" aria-labelledby="cc-reviews-title">
        <motion.div className="cc-section cc-reviews-heading" initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.5}} transition={{duration:.6,ease:[.22,1,.36,1]}}><span className="cc-kicker">GOOGLE REVIEWS</span><h2 id="cc-reviews-title">Good things guests are saying<span className="title-dot">.</span></h2><p>Kind words shared by people who have spent a little time with us.</p></motion.div>
        <ReviewsShowcase/>
        <p className="cc-reviews-note">Guest comments shown from Cup Culture Google reviews · <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Cup Culture T-Nagar Villankurichi Coimbatore")}`} target="_blank" rel="noreferrer">Read all {GOOGLE_REVIEW_COUNT} reviews on Google ↗</a></p>
      </section>



      <ContactSection locationName={locationName} locationUrl={locationUrl} phone={business.phone || undefined} openingHours={business.opening_hours || undefined}/>
    </main>

    <SiteFooter locationName={locationName} locationUrl={locationUrl} openingHours={business.opening_hours || undefined} onPrivacy={()=>setOverlay("privacy")} onTerms={()=>setOverlay("terms")}/>

    <AddAgainDialog item={pendingAdd?.item || null} quantity={pendingAdd ? cartQuantities[pendingAdd.item.id] || 0 : 0} onConfirm={confirmPendingAdd} onCancel={cancelPendingAdd} onViewBag={()=>{setPendingAdd(null);setAddedToast(null);setOrderReceipt(null);setOverlay("cart");}}/>
    <CartBar count={itemCount} subtotal={subtotal} visible={itemCount > 0 && overlay === null} onOpen={()=>{setAddedToast(null);setOrderReceipt(null);setOverlay("cart");}}/>
    <CartDrawer open={overlay==="cart"} hydrated={hydrated} cart={cart} subtotal={subtotal} tax={tax} taxRate={taxRate} deliveryFee={deliveryFee} total={cartTotal} orderType={orderType} tableChoice={tableChoice}
      onChooseService={(type, table)=>{setOrderType(type);setTableChoice(table);setCheckoutError("");setWhatsappError("");}}
      onQuantity={changeQuantity} onRemove={removeFromCart} onClose={closeOverlay}
      onBrowse={()=>{closeOverlay();window.setTimeout(()=>document.getElementById("menu")?.scrollIntoView({behavior:"smooth"}),250);}}
      onPlaceOrder={placeOrder} onWhatsApp={(form)=>orderOnWhatsApp(form)} busy={checkoutBusy} checkoutError={checkoutError} whatsappError={whatsappError} receipt={orderReceipt}/>
    <AnimatePresence>
      {overlay && overlay !== "cart" && <motion.div key={overlay} className="cc-modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(event)=>{if(event.target===event.currentTarget)closeOverlay();}}><motion.aside className={`cc-modal ${overlay==="account"?"cc-account-modal":""}`} initial={{y:18,opacity:0}} animate={{y:0,opacity:1}} exit={{y:18,opacity:0}} transition={{type:"spring",damping:29,stiffness:280}} role="dialog" aria-modal="true" aria-label={overlay==="account"?"Your Cup Culture account":overlay==="detail"?detail?.name:"Cup Culture details"}>
        <button className="cc-modal-close" onClick={closeOverlay} aria-label="Close"><X size={20}/></button>
        {overlay==="detail"&&detail&&<DetailContent item={detail} quantity={detailQuantity} setQuantity={setDetailQuantity} extras={detailExtras} toggleExtra={toggleExtra} instructions={detailInstructions} setInstructions={setDetailInstructions} onAdd={addDetailToBag} added={addedNotice} onOpenCart={()=>setOverlay("cart")}/>}
        {overlay==="account"&&<div className="cc-account-content">{!user?<><span className="cc-kicker">YOUR CUP CULTURE</span><h2>{accountMode==="signup"?"Let’s get to know you.":accountMode==="forgot"?"Reset your password.":"Welcome back."}</h2><p>{accountMode==="signup"?"Create an account for quicker checkouts and a home for your favourites.":accountMode==="forgot"?"We’ll send a reset link to your email.":"Sign in to find your orders and saved details."}</p><form className="cc-form-grid" onSubmit={submitAccount}>{accountMode==="signup"&&<label className="cc-field cc-field-wide"><span>Full name</span><input name="fullName" required minLength={2}/></label>}<label className="cc-field cc-field-wide"><span>Email address</span><input name="email" type="email" autoComplete="email" required/></label>{accountMode!=="forgot"&&<><label className="cc-field cc-field-wide"><span>Password</span><input name="password" type="password" minLength={8} autoComplete={accountMode==="signup"?"new-password":"current-password"} required/></label>{accountMode==="signup"&&<label className="cc-field cc-field-wide"><span>Mobile number</span><input name="phone" type="tel" required pattern="[0-9 +\(\)\-]{10,16}"/></label>}</>}<button className="cc-button cc-button-dark cc-field-wide" disabled={accountBusy}>{accountBusy?"One moment…":accountMode==="signup"?"Create your account":accountMode==="forgot"?"Send reset link":"Sign in"}<ArrowRight size={14}/></button></form>{accountMessage&&<p className="cc-success-note" role="status">{accountMessage}</p>}{accountError&&<p className="cc-error" role="alert">{accountError}</p>}<div className="cc-account-switch">{accountMode!=="signup"&&<button onClick={()=>setAccountMode(accountMode==="forgot"?"login":"forgot")}>{accountMode==="forgot"?"Back to sign in":"Forgot your password?"}</button>}<button onClick={()=>{setAccountMode(accountMode==="signup"?"login":"signup");setAccountError("");setAccountMessage("");}}>{accountMode==="signup"?"I already have an account":"Create an account"}</button></div><div className="cc-guest-note">No account needed. You can order as a guest anytime.</div></>:<><div className="cc-account-welcome"><span className="cc-kicker">WELCOME BACK</span><button className="cc-text-link" onClick={signOut}>Sign out <ArrowUpRight size={13}/></button></div><h2>{user.user_metadata?.full_name||user.email}</h2><div className="cc-account-tabs">{[["orders","Orders"],["reservations","Reservations"],["addresses","Addresses"],["favourites","Favourites"]].map(([id,label])=><button key={id} className={accountTab===id?"selected":""} onClick={()=>setAccountTab(id)}>{label}</button>)}</div>{accountTab==="orders"&&(customerOrders.length?<div className="cc-account-list">{customerOrders.map((order)=><div className="cc-account-row" key={order.id||order.order_number}><Package size={17}/><span><strong>{order.order_number||order.id}</strong><small>{order.order_type||order.type} · {order.created_at?new Date(order.created_at).toLocaleDateString("en-IN"):"Order history"}</small></span><b>{formatPrice(Number(order.total_amount||order.total||0))}</b></div>)}</div>:<div className="cc-empty-account"><p>No orders yet. Your next favourite is waiting.</p><button className="cc-text-link" onClick={()=>{closeOverlay();document.getElementById("menu")?.scrollIntoView({behavior:"smooth"});}}>Explore the menu <ArrowRight size={14}/></button></div>)}{accountTab==="reservations"&&(customerBookings.length?<div className="cc-account-list">{customerBookings.map((booking)=><div className="cc-account-row" key={booking.id||booking.reservation_number}><Clock3 size={17}/><span><strong>{booking.date||booking.reservation_date} · {booking.time||String(booking.start_time).slice(0,5)}</strong><small>{booking.guests} guests · {booking.status||"Pending"}</small></span></div>)}</div>:<div className="cc-empty-account"><p>No previous table requests.</p></div>)}{accountTab==="addresses"&&<><div className="cc-account-list">{customerAddresses.map((address:any)=><div className="cc-account-row" key={address.id}><MapPin size={17}/><span><strong>{address.label||"Saved address"}</strong><small>{address.address||address.address_line}</small></span></div>)}</div><form className="cc-save-address" onSubmit={saveAddress}><label className="cc-field"><span>Add a saved address</span><textarea value={savedAddress} onChange={(event)=>setSavedAddress(event.target.value)} required rows={2}/></label><button className="cc-button cc-button-dark">Save address <Check size={14}/></button></form></>}{accountTab==="favourites"&&<div className="cc-account-list">{catalog.filter((item)=>favorites.includes(item.id)).map((item)=><button className="cc-account-row" key={item.id} onClick={()=>openDetail(item)}><img src={displayImage(item)} alt=""/><span><strong>{item.name}</strong><small>{item.category}</small></span><b>{formatPrice(item.price)}</b></button>)}{!favorites.length&&<div className="cc-empty-account">Save menu items with the heart and they’ll be here.</div>}</div>}</>}</div>}
        {(overlay==="privacy"||overlay==="terms")&&<div className="cc-policy-content"><span className="cc-kicker">THE IMPORTANT DETAILS</span><h2>{overlay==="privacy"?"Privacy policy":"Terms & conditions"}</h2>{overlay==="privacy"?<><p>We use the details you share to process order and reservation requests, respond to messages and provide account features. Account and order records are stored through Supabase when the café connects its account. The café should complete this policy with its legal name and privacy contact before launch.</p><p>Ask the café to access, correct or remove your details using the contact information on this page.</p></>:<><p>Orders and table requests are subject to café confirmation. Menu availability, preparation times, delivery area and applicable charges are confirmed by the café. This website does not accept online payments; settle at the counter or on delivery.</p><p>Reservation requests are not confirmed until the café responds. Contact the café about changes, cancellations or refunds.</p></>}</div>}
      </motion.aside></motion.div>}
    </AnimatePresence>
  </div></MotionConfig>;
}

function MenuBoard({ items, sorted, activeLabel, quantities, onOpen, onAdd }: { items: Product[]; sorted: boolean; activeLabel: string; quantities: Record<string, number>; onOpen: (item:Product)=>void; onAdd: (item:Product, source:HTMLElement)=>boolean|void }) {
  const groups = sorted ? [{ name: "Sorted by price", note: "Every pick on the menu, lined up by price.", items }] : categories.map((category) => ({ name: category.name, note: items.find((item) => item.categoryId === category.id)?.description || "", items: items.filter((item) => item.categoryId === category.id) })).filter((group) => group.items.length);
  const from = Math.min(...items.map((item) => item.price));
  return <div className="cc-board">
    <aside className="cc-board-visual"><div className="cc-board-photo"><img src="/images/cafe-interior.webp" alt="The glowing Cup Culture arch inside the café"/><span className="cc-board-glow" aria-hidden="true"/><div className="cc-board-photo-copy"><span>FRESHLY MADE · TO ORDER</span><AnimatePresence mode="wait"><motion.strong key={activeLabel} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.3}}>{activeLabel}</motion.strong></AnimatePresence><small>{items.length} {items.length===1?"pick":"picks"} · from {formatPrice(from)}</small></div></div><p className="cc-board-note"><span>✳</span> Tap a name to add extras or a note. Tap <b>+</b> to add it straight to your bag.</p></aside>
    <div className="cc-board-list">{groups.map((group, groupIndex) => <motion.section key={group.name} className="cc-board-group" initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.1}} transition={{duration:.45,delay:groupIndex<2?groupIndex*.06:0}}>
      <header><span className="cc-board-index">{String(groupIndex+1).padStart(2,"0")}</span><div><h3>{group.name}</h3>{group.note&&<p>{group.note}</p>}</div><span className="cc-board-count">{group.items.length}</span></header>
      <ul>{group.items.map((item) => <MenuRow key={item.id} item={item} quantity={quantities[item.id] || 0} onOpen={onOpen} onAdd={onAdd}/>)}</ul>
    </motion.section>)}</div>
  </div>;
}

function MenuRow({ item, quantity, onOpen, onAdd }: { item: Product; quantity: number; onOpen: (item:Product)=>void; onAdd: (item:Product, source:HTMLElement)=>boolean|void }) {
  const [burst, setBurst] = useState(0);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);
  function add(event: React.MouseEvent<HTMLButtonElement>) {
    if (onAdd(item, event.currentTarget) === false) return;
    setBurst(Date.now());
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setBurst(0), 1150);
  }
  return <li className={`cc-row${burst?" is-added":""}${quantity?" in-bag":""}${!item.available?" is-out":""}`}>
    {burst>0&&<motion.span key={burst} className="cc-row-sweep" aria-hidden="true" initial={{x:"-100%"}} animate={{x:"100%"}} transition={{duration:.9,ease:[.4,0,.2,1]}}/>}
    <span className={`cc-row-dot ${item.veg?"veg":"nonveg"}`} title={item.veg?"Vegetarian":"Non-vegetarian"}><i/></span>
    <button type="button" className="cc-row-name" onClick={()=>onOpen(item)}>{item.name}{item.isNew&&<em>New</em>}{item.popular&&<em className="loved">Loved</em>}</button>
    <span className="cc-row-leader" aria-hidden="true"/>
    <strong className="cc-row-price">{formatPrice(item.price)}</strong>
    <motion.button type="button" className="cc-row-add" disabled={!item.available} onClick={add} whileHover={{scale:1.08}} whileTap={{scale:.86}} aria-label={item.available?`Add ${item.name} to bag`:`${item.name} is sold out`}>
      {item.available?<AnimatePresence mode="wait" initial={false}>{burst?<motion.span key="ok" initial={{scale:0,rotate:-90}} animate={{scale:1,rotate:0}} exit={{scale:0,opacity:0}} transition={{type:"spring",damping:11,stiffness:320}}><Check size={15}/></motion.span>:<motion.span key="plus" initial={{scale:0,rotate:90}} animate={{scale:1,rotate:0}} exit={{scale:0,opacity:0}} transition={{duration:.18}}><Plus size={15}/></motion.span>}</AnimatePresence>:<X size={13}/>}
      {burst>0&&Array.from({length:8}).map((_,i)=>{const a=(i/8)*Math.PI*2;return <motion.i key={`${burst}-${i}`} className="cc-row-spark" aria-hidden="true" initial={{x:0,y:0,scale:1,opacity:1}} animate={{x:Math.cos(a)*26,y:Math.sin(a)*26,scale:0,opacity:0}} transition={{duration:.6,ease:"easeOut"}}/>;})}
      <AnimatePresence>{quantity>0&&<motion.b key={quantity} className="cc-row-qty" initial={{scale:0,y:4}} animate={{scale:1,y:0}} exit={{scale:0}} transition={{type:"spring",damping:12,stiffness:420}}>{quantity}</motion.b>}</AnimatePresence>
    </motion.button>
  </li>;
}


function DetailContent({ item, quantity, setQuantity, extras, toggleExtra, instructions, setInstructions, onAdd, added, onOpenCart }: { item:Product; quantity:number; setQuantity:(value:number|((current:number)=>number))=>void; extras:string[]; toggleExtra:(name:string)=>void; instructions:string; setInstructions:(value:string)=>void; onAdd:(source:HTMLElement)=>void; added:boolean; onOpenCart:()=>void }) {
  const additions=extraOptions.filter((option)=>extras.includes(option.name));const total=(item.price+additions.reduce((sum,option)=>sum+option.price,0))*quantity;
  return <div className="cc-detail-content"><div className="cc-detail-image"><img src={displayImage(item)} alt={item.name}/><VegMark veg={item.veg}/></div><span className="cc-kicker">{item.category}</span><h2>{item.name}</h2><strong className="cc-detail-price">{formatPrice(item.price)}</strong><p className="cc-detail-description">{item.description} Prepared fresh for your table.</p><div className="cc-detail-diet"><span className={`diet-square ${item.veg?"veg":"nonveg"}`}/>{item.veg?"Vegetarian":"Non-vegetarian"}<span className={`cc-stock ${item.available?"in-stock":"out-stock"}`}>{item.available?"Available to order":"Out of stock"}</span></div>{supportsExtras(item.category)&&<><span className="cc-field-caption cc-detail-caption">MAKE IT YOURS · OPTIONAL</span><div className="cc-extras">{extraOptions.map((option)=><label key={option.name} className={extras.includes(option.name)?"selected":""}><input type="checkbox" checked={extras.includes(option.name)} onChange={()=>toggleExtra(option.name)}/><span>{option.name}</span><b>+{formatPrice(option.price)}</b></label>)}</div></>}<label className="cc-field cc-detail-instructions"><span>SPECIAL INSTRUCTIONS · OPTIONAL</span><textarea rows={2} value={instructions} onChange={(event)=>setInstructions(event.target.value)} placeholder="A little less spicy? Tell us here."/></label><div className="cc-detail-add-row"><div className="cc-quantity"><button onClick={()=>setQuantity((current:number)=>Math.max(1,current-1))} aria-label="Decrease quantity"><Minus size={14}/></button><strong>{quantity}</strong><button onClick={()=>setQuantity((current:number)=>current+1)} aria-label="Increase quantity"><Plus size={14}/></button></div><button className="cc-button cc-button-dark" onClick={(event)=>onAdd(event.currentTarget)} disabled={!item.available}>{added?"Added to your bag ✓":`Add to bag · ${formatPrice(total)}`}</button></div>{added&&<button className="cc-text-link" onClick={onOpenCart}>View your bag <ArrowRight size={14}/></button>}</div>;
}

