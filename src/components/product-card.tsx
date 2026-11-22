"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, Plus } from "lucide-react";
import type { Product } from "@/lib/menu";
import { formatPrice } from "@/lib/menu";
import { useStore } from "@/lib/store";

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addToCart, favorites, toggleFavorite } = useStore();
  return <article className={`product-card ${compact ? "product-card-compact" : ""}`}>
    <Link href={`/menu/${product.id}`} className="product-photo"><img src={product.image} alt={product.name} loading="lazy"/><span className={`diet-dot ${product.veg ? "veg" : "nonveg"}`} title={product.veg ? "Vegetarian" : "Non-vegetarian"}><i/></span>{product.isNew && <span className="photo-tag">JUST IN</span>}<button className={`favorite-button ${favorites.includes(product.id) ? "favorited" : ""}`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleFavorite(product.id); }} aria-label={favorites.includes(product.id) ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}><Heart size={17} fill={favorites.includes(product.id) ? "currentColor" : "none"}/></button></Link>
    <div className="product-content"><div className="product-category">{product.category}</div><Link href={`/menu/${product.id}`} className="product-name">{product.name}</Link><p className="product-description">{product.description}</p><div className="product-card-bottom"><strong>{formatPrice(product.price)}</strong><button className="add-button" onClick={() => addToCart(product)} aria-label={`Add ${product.name} to cart`}><Plus size={17}/><span>Add</span></button></div><Link href={`/menu/${product.id}`} className="details-link">View details <ArrowUpRight size={13}/></Link></div>
  </article>;
}
