export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  categoryId: string;
  veg: boolean;
  image: string;
  popular?: boolean;
  isNew?: boolean;
  available: boolean;
  description: string;
};

type MenuItem = [string, number, "veg" | "nonveg"];
type MenuCategory = { id: string; name: string; items: MenuItem[] };

export const menu: MenuCategory[] = [
  { id: "cc-specials", name: "CC SPECIALS", items: [["Hot Chocolate",60,"veg"],["Crispy Corn",99,"veg"],["Paalkova Bun",60,"veg"],["Fried Onion Peri Peri Maggi",79,"veg"],["Lotus Biscoff Milkshake",139,"veg"]] },
  { id: "spill-the-tea", name: "SPILL THE TEA", items: [["Regular Tea",25,"veg"],["Ginger Tea",30,"veg"],["Elaichi Tea",30,"veg"],["Jaggery Tea",25,"veg"],["Black Tea",15,"veg"],["Green Tea",20,"veg"],["Lemon Tea",20,"veg"],["Honey Lemon Tea",25,"veg"],["Ginger Lemon Tea",25,"veg"],["Pineapple Tea",40,"veg"]] },
  { id: "coffee-buzz", name: "COFFEE BUZZ", items: [["Filter Coffee",30,"veg"],["Black Coffee",25,"veg"],["Jaggery Coffee",35,"veg"]] },
  { id: "hot-beverages", name: "HOT BEVERAGES", items: [["Hot Chocolate",60,"veg"],["Chocolate Tea",50,"veg"],["Chocolate Coffee",55,"veg"],["Plain Milk",25,"veg"],["Paalkova Milk",45,"veg"]] },
  { id: "quick-bites", name: "QUICK BITES", items: [["Crispy Corn",99,"veg"],["Butter Corn",49,"veg"],["Popcorn Chicken",149,"nonveg"],["Lays Bag",159,"veg"]] },
  { id: "bun-bash", name: "BUN BASH", items: [["Bun/Bread Butter Jam",60,"veg"],["Butter Bun",39,"veg"],["Oregano Delight Bun",49,"veg"],["Paalkova Bun",60,"veg"],["The Egg Melt",79,"nonveg"]] },
  { id: "sandwich-culture", name: "SANDWICH CULTURE", items: [["Veg Sandwich",79,"veg"],["Paneer Sandwich",109,"veg"],["Corn Peri Peri Sandwich",89,"veg"],["Egg Bhurji Sandwich",119,"nonveg"],["Chicken Sandwich",129,"nonveg"]] },
  { id: "burger-mania", name: "BURGER MANIA", items: [["CC Veg Burger",149,"veg"],["CC Chicken Burger",189,"nonveg"],["Bullseye Burger",169,"nonveg"],["Fried Chicken Burger",199,"nonveg"]] },
  { id: "fries-craze", name: "FRIES CRAZE", items: [["Plain Fries",69,"veg"],["Peri Peri Fries",79,"veg"],["Veg Loaded Fries",119,"veg"],["Chicken Loaded Fries",159,"nonveg"]] },
  { id: "momos-zone", name: "MOMOS ZONE", items: [["Veg Momos (Fried)",89,"veg"],["Veg Momos (Steamed)",99,"veg"],["Paneer Momos (Fried)",99,"veg"],["Paneer Momos (Steamed)",109,"veg"],["Chicken Momos (Fried)",109,"nonveg"],["Chicken Momos (Steamed)",119,"nonveg"]] },
  { id: "maggi-hub", name: "MAGGI HUB", items: [["Classic Maggi",49,"veg"],["Corn Maggi",79,"veg"],["Cheese Flakes Maggi",69,"veg"],["Peri Peri Maggi",59,"veg"],["Fried Onion Peri Peri Maggi",79,"veg"],["Egg Maggi",99,"nonveg"]] },
  { id: "ice-culture", name: "ICE CULTURE", items: [["Lemonade Iced Tea",99,"veg"],["Pineapple Iced Tea",129,"veg"],["Rose Iced Tea",129,"veg"],["Iced Coffee",139,"veg"]] },
  { id: "milky-madness", name: "MILKY MADNESS", items: [["Lotus Biscoff Milkshake",139,"veg"],["Choco Milkshake",89,"veg"],["Oreo Milkshake",109,"veg"],["KitKat Milkshake",109,"veg"],["Cold Coffee Milkshake",99,"veg"],["Boost Milkshake",69,"veg"],["Horlicks Milkshake",99,"veg"],["Rose Milk",59,"veg"],["Kadala Mittai Milkshake",119,"veg"]] },
  { id: "add-ons", name: "ADD ONS", items: [["Cheese Slice",20,"veg"],["Peri Peri Masala",10,"veg"],["Mayo",10,"veg"],["Butter",15,"veg"]] },
  { id: "cc-wraps", name: "CC WRAPS", items: [["Schezwan Paneer Wrap",129,"veg"],["Golden Egg Wrap",109,"nonveg"],["Crispy Chicken Wrap",139,"nonveg"]] },
];

const categoryImages: Record<string, string> = {
  "CC SPECIALS": "/images/biscoff.webp", "SPILL THE TEA": "/images/tea.webp", "COFFEE BUZZ": "/images/filter-coffee.webp",
  "HOT BEVERAGES": "/images/hot-chocolate.webp", "QUICK BITES": "/images/corn.webp", "BUN BASH": "/images/bun.webp",
  "SANDWICH CULTURE": "/images/grilled-sandwich.webp", "BURGER MANIA": "/images/burger.webp", "FRIES CRAZE": "/images/loaded-fries.webp",
  "MOMOS ZONE": "/images/momos.webp", "MAGGI HUB": "/images/maggi.webp", "ICE CULTURE": "/images/rose-iced.webp",
  "MILKY MADNESS": "/images/biscoff.webp", "ADD ONS": "/images/addons.webp", "CC WRAPS": "/images/rolls.webp",
};

const productImages: Record<string, string> = {
  "Regular Tea": "/images/tea.webp", "Ginger Tea": "/images/ginger-tea.webp", "Elaichi Tea": "/images/elaichi-tea.webp", "Jaggery Tea": "/images/jaggery-tea.webp", "Black Tea": "/images/black-tea.webp", "Green Tea": "/images/green-tea.webp", "Lemon Tea": "/images/lemon-tea.webp", "Honey Lemon Tea": "/images/honey-lemon-tea.webp", "Ginger Lemon Tea": "/images/ginger-lemon-tea.webp", "Pineapple Tea": "/images/pineapple-tea.webp",
  "Filter Coffee": "/images/filter-coffee.webp", "Black Coffee": "/images/black-coffee.webp", "Jaggery Coffee": "/images/jaggery-coffee.webp", "Hot Chocolate": "/images/hot-chocolate-cup.webp", "Plain Milk": "/images/plain-milk.webp", "Paalkova Milk": "/images/paalkova-milk.webp", "Choco Milkshake": "/images/chocolate-shake.webp", "Oreo Milkshake": "/images/chocolate-shake.webp", "KitKat Milkshake": "/images/chocolate-shake.webp", "Cold Coffee Milkshake": "/images/chocolate-shake.webp", "Boost Milkshake": "/images/mango-shake.webp", "Horlicks Milkshake": "/images/chocolate-shake.webp", "Crispy Corn": "/images/corn.webp", "Butter Corn": "/images/corn.webp", "Popcorn Chicken": "/images/loaded-fries.webp", "Lays Bag": "/images/loaded-fries.webp",
  "Bun/Bread Butter Jam": "/images/bun.webp", "Butter Bun": "/images/bun.webp", "Oregano Delight Bun": "/images/bun.webp", "Paalkova Bun": "/images/bun.webp",
  "Veg Sandwich": "/images/grilled-sandwich.webp", "Paneer Sandwich": "/images/rolls.webp", "Corn Peri Peri Sandwich": "/images/grilled-sandwich.webp", "Egg Bhurji Sandwich": "/images/egg-sandwich.webp", "Chicken Sandwich": "/images/grilled-sandwich.webp",
  "CC Veg Burger": "/images/burger.webp", "CC Chicken Burger": "/images/burger.webp", "Bullseye Burger": "/images/burger.webp", "Fried Chicken Burger": "/images/burger.webp",
  "Plain Fries": "/images/loaded-fries.webp", "Peri Peri Fries": "/images/loaded-fries.webp", "Veg Loaded Fries": "/images/loaded-fries.webp", "Chicken Loaded Fries": "/images/loaded-fries.webp",
  "Veg Momos (Fried)": "/images/momos.webp", "Veg Momos (Steamed)": "/images/momos.webp", "Paneer Momos (Fried)": "/images/momos.webp", "Paneer Momos (Steamed)": "/images/momos.webp", "Chicken Momos (Fried)": "/images/momos.webp", "Chicken Momos (Steamed)": "/images/momos.webp",
  "Lemonade Iced Tea": "/images/iced-tea.webp", "Pineapple Iced Tea": "/images/pineapple-iced.webp", "Rose Iced Tea": "/images/rose-iced.webp", "Iced Coffee": "/images/chocolate-shake.webp",
  "Lotus Biscoff Milkshake": "/images/biscoff.webp", "Kadala Mittai Milkshake": "/images/kadala.webp", "Schezwan Paneer Wrap": "/images/paneer-wrap.webp", "Golden Egg Wrap": "/images/egg-wrap.webp", "Crispy Chicken Wrap": "/images/chicken-wrap.webp", "Cheese Slice": "/images/addons.webp", "Peri Peri Masala": "/images/addons.webp", "Mayo": "/images/addons.webp", "Butter": "/images/addons.webp",
};

const categoryDescriptions: Record<string, string> = {
  "CC SPECIALS": "A little something special from the Cup Culture menu.", "SPILL THE TEA": "Find your everyday cup in our tea collection.", "COFFEE BUZZ": "Coffee favourites, made for a little pause.",
  "HOT BEVERAGES": "A comforting warm cup, any time of day.", "QUICK BITES": "A quick bite for whenever the mood strikes.", "BUN BASH": "A soft, satisfying stop between plans.",
  "SANDWICH CULTURE": "A familiar favourite, stacked just right.", "BURGER MANIA": "A hand-held favourite with plenty to love.", "FRIES CRAZE": "Golden, savoury and made for sharing.",
  "MOMOS ZONE": "A comforting favourite, steamed or fried.", "MAGGI HUB": "Your familiar bowl, with a Cup Culture twist.", "ICE CULTURE": "A cool sip for warmer moments.",
  "MILKY MADNESS": "Something smooth for your sweet side.", "ADD ONS": "A little extra for the things you love.", "CC WRAPS": "Good things, neatly wrapped up.",
};

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const products: Product[] = menu.flatMap((category) => category.items.map(([name, price, type], index) => ({
  id: `${category.id}-${slugify(name)}`,
  name,
  price,
  category: category.name,
  categoryId: category.id,
  veg: type === "veg",
  image: productImages[name] || categoryImages[category.name],
  popular: ["CC SPECIALS", "SANDWICH CULTURE", "BURGER MANIA", "MOMOS ZONE", "MILKY MADNESS"].includes(category.name) && index === 0,
  isNew: category.id === "cc-specials" && [2, 4].includes(index),
  available: true,
  description: categoryDescriptions[category.name],
})));

export const formatPrice = (price: number) => `₹${price.toFixed(0)}`;
export const categories = menu.map(({ id, name }) => ({ id, name }));
export const getProduct = (id: string) => products.find((item) => item.id === id);
