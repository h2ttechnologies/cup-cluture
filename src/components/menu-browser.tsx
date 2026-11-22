"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { categories, products } from "@/lib/menu";
import { ProductCard } from "@/components/product-card";

export function MenuBrowser() {
  const [search, setSearch] = useState(""); const [category, setCategory] = useState("all"); const [diet, setDiet] = useState("all"); const [sort, setSort] = useState("featured"); const [collection, setCollection] = useState("all");
  const shown = useMemo(() => products.filter((product) => {
    const queryMatch = `${product.name} ${product.category}`.toLowerCase().includes(search.trim().toLowerCase());
    const categoryMatch = category === "all" || product.categoryId === category;
    const dietMatch = diet === "all" || (diet === "veg" ? product.veg : !product.veg);
    const collectionMatch = collection === "all" || (collection === "popular" ? product.popular : product.isNew);
    return queryMatch && categoryMatch && dietMatch && collectionMatch;
  }).sort((a,b) => sort === "low" ? a.price-b.price : sort === "high" ? b.price-a.price : 0), [search, category, diet, sort, collection]);
  return <div><div className="menu-toolbar"><label className="search-box"><Search size={17}/><input type="search" placeholder="Search the menu… try “Momos”" value={search} onChange={(event)=>setSearch(event.target.value)}/></label><select className="select-control" value={diet} onChange={(event)=>setDiet(event.target.value)} aria-label="Filter by dietary type"><option value="all">All dishes</option><option value="veg">Vegetarian</option><option value="nonveg">Non-vegetarian</option></select><select className="select-control" value={sort} onChange={(event)=>setSort(event.target.value)} aria-label="Sort menu"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
    <div className="category-pills" aria-label="Menu categories"><button className={`category-pill ${category==="all"?"selected":""}`} onClick={()=>setCategory("all")}>Everything</button>{categories.map((item)=><button key={item.id} className={`category-pill ${category===item.id?"selected":""}`} onClick={()=>setCategory(item.id)}>{item.name}</button>)}</div>
    <div className="category-pills" aria-label="Collections" style={{paddingTop:0}}><button className={`category-pill ${collection==="all"?"selected":""}`} onClick={()=>setCollection("all")}>All items</button><button className={`category-pill ${collection==="popular"?"selected":""}`} onClick={()=>setCollection("popular")}>Popular favourites</button><button className={`category-pill ${collection==="new"?"selected":""}`} onClick={()=>setCollection("new")}>New arrivals</button></div>
    <div className="menu-result">Showing {shown.length} {shown.length===1?"item":"items"} across {categories.length} menu collections</div>
    {shown.length ? <div className="product-grid">{shown.map((product)=><ProductCard key={product.id} product={product}/>)}</div> : <div className="empty-state"><span className="eyebrow">NOT ON THIS MENU</span><h3>No matching favourites yet</h3><p>Try a shorter search, or browse everything we have on the menu.</p><button className="button button-primary" onClick={()=>{setSearch("");setCategory("all");setDiet("all");setCollection("all");}}>Show the full menu</button></div>}
  </div>;
}
