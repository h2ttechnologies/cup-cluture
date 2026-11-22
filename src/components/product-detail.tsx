"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/menu";
import { formatPrice } from "@/lib/menu";
import { useStore } from "@/lib/store";

const addOnChoices = [{name:"Cheese Slice",price:20},{name:"Peri Peri Masala",price:10},{name:"Mayo",price:10},{name:"Butter",price:15}];
const supportsAddons = (category: string) => ["QUICK BITES","BUN BASH","SANDWICH CULTURE","BURGER MANIA","FRIES CRAZE","MOMOS ZONE","MAGGI HUB","CC WRAPS"].includes(category);
export function ProductDetail({ product }: { product: Product }) {
  const [quantity,setQuantity]=useState(1);const [selected,setSelected]=useState<string[]>([]);const [instructions,setInstructions]=useState("");const [added,setAdded]=useState(false);const {addToCart}=useStore();
  const additions=addOnChoices.filter((item)=>selected.includes(item.name));const total=(product.price+additions.reduce((sum,item)=>sum+item.price,0))*quantity;
  return <section className="page-body"><div className="breadcrumb"><Link href="/menu"><ArrowLeft size={12}/> MENU</Link><span>/</span><span>{product.category}</span></div><div className="product-detail"><div className="detail-photo"><img src={product.image} alt={product.name}/></div><div className="detail-info"><span className="eyebrow">{product.category}</span><h1>{product.name}</h1><div className="detail-price">{formatPrice(product.price)}</div><p>{product.description} Every order is prepared fresh for your table.</p><div><span className="diet-dot-inline" style={{color:product.veg?"#39874a":"#aa3c25"}}>{product.veg?"▣ Veg":"▣ Non-veg"}</span><span className="stock-label"> · Available to order</span></div>
      {supportsAddons(product.category)&&<><span className="detail-label">MAKE IT YOURS · OPTIONAL</span><div className="option-chips">{addOnChoices.map((addon)=><label key={addon.name} className="option-chip"><input type="checkbox" checked={selected.includes(addon.name)} onChange={()=>setSelected((current)=>current.includes(addon.name)?current.filter((name)=>name!==addon.name):[...current,addon.name])}/>{addon.name} +{formatPrice(addon.price)}</label>)}</div></>}
      <label className="detail-label" htmlFor="instructions">SPECIAL INSTRUCTIONS · OPTIONAL</label><textarea id="instructions" value={instructions} onChange={(event)=>setInstructions(event.target.value)} placeholder="A little less spicy? Tell us here."/>
      <div className="detail-add-row"><div className="quantity-control"><button onClick={()=>setQuantity((n)=>Math.max(1,n-1))} aria-label="Decrease quantity"><Minus size={14}/></button><strong>{quantity}</strong><button onClick={()=>setQuantity((n)=>n+1)} aria-label="Increase quantity"><Plus size={14}/></button></div><button className="button button-primary" onClick={()=>{addToCart(product,quantity,additions,instructions);setAdded(true);}}><ShoppingBag size={15}/>{added?"Added to your bag":"Add to bag · "+formatPrice(total)}</button></div>{added&&<p role="status" className="detail-confirm">Added to your bag. <Link href="/cart" className="text-link">View bag</Link></p>}
    </div></div></section>;
}
