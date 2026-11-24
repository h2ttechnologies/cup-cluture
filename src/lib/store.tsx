"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products as seedProducts, type Product } from "@/lib/menu";

export type CartLine = { key: string; product: Product; quantity: number; addons: { name: string; price: number }[]; instructions: string };
type StoreContextValue = {
  cart: CartLine[]; favorites: string[]; hydrated: boolean; products: Product[];
  addToCart: (product: Product, quantity?: number, addons?: { name: string; price: number }[], instructions?: string) => void;
  changeQuantity: (key: string, delta: number) => void; removeFromCart: (key: string) => void; clearCart: () => void;
  toggleFavorite: (id: string) => void;
};
const StoreContext = createContext<StoreContextValue | null>(null);
const lineKey = (id: string, addons: { name: string; price: number }[], instructions: string) => `${id}:${addons.map((item) => item.name).sort().join(",")}:${instructions.trim()}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(seedProducts);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("cc-cart") || "[]"));
      setFavorites(JSON.parse(localStorage.getItem("cc-favorites") || "[]"));
    } catch { setCart([]); setFavorites([]); }
    setHydrated(true);
  }, []);
  // Keep the menu fresh so changes made in the admin site (sold out, back on, price) show without a reload:
  // every 10 seconds while the page is visible, and straight away when the customer comes back to the tab.
  useEffect(() => {
    const load = () => fetch("/api/menu", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((result) => {
      if (Array.isArray(result?.products) && result.products.length) setCatalogProducts(result.products);
    }).catch(() => {});
    void load();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, 10000);
    const onVisible = () => { if (document.visibilityState === "visible") void load(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); window.removeEventListener("focus", onVisible); };
  }, []);
  // Bag lines keep the latest menu details (availability, price, name) for their item.
  const liveCart = useMemo(() => cart.map((line) => {
    const current = catalogProducts.find((item) => item.id === line.product.id);
    return current ? { ...line, product: { ...line.product, ...current } } : line;
  }), [cart, catalogProducts]);
  useEffect(() => { if (hydrated) localStorage.setItem("cc-cart", JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("cc-favorites", JSON.stringify(favorites)); }, [favorites, hydrated]);
  const value = useMemo<StoreContextValue>(() => ({
    cart: liveCart, favorites, hydrated, products: catalogProducts,
    addToCart: (product, quantity = 1, addons = [], instructions = "") => setCart((current) => {
      const key = lineKey(product.id, addons, instructions);
      const found = current.find((line) => line.key === key);
      return found ? current.map((line) => line.key === key ? { ...line, quantity: line.quantity + quantity } : line) : [...current, { key, product, quantity, addons, instructions }];
    }),
    changeQuantity: (key, delta) => setCart((current) => current.flatMap((line) => line.key !== key ? [line] : line.quantity + delta <= 0 ? [] : [{ ...line, quantity: line.quantity + delta }])),
    removeFromCart: (key) => setCart((current) => current.filter((line) => line.key !== key)),
    clearCart: () => setCart([]),
    toggleFavorite: (id) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]),
  }), [liveCart, favorites, hydrated, catalogProducts]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore() { const value = useContext(StoreContext); if (!value) throw new Error("useStore must be used within StoreProvider"); return value; }
export const cartSubtotal = (cart: CartLine[]) => cart.reduce((sum, line) => sum + (line.product.price + line.addons.reduce((total, addon) => total + addon.price, 0)) * line.quantity, 0);
