import { NextResponse } from "next/server";
import { products as seedProducts } from "@/lib/menu";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ products: seedProducts });
  try {
    const client = createAdminClient();
    const { data, error } = await client.from("products").select("id,category_id,name,price,description,image_url,is_veg,is_popular,is_new_arrival,is_available,categories(name)").order("category_id").order("display_order");
    if (error) throw error;
    if (!data?.length) return NextResponse.json({ products: seedProducts });
    const fallback = new Map(seedProducts.map((item) => [item.id, item]));
    const items = data.map((row: any) => {
      const known = fallback.get(row.id);
      const useTeaPhoto = known?.categoryId === "spill-the-tea" && ["Ginger Tea", "Elaichi Tea", "Jaggery Tea", "Black Tea", "Green Tea", "Lemon Tea", "Honey Lemon Tea", "Ginger Lemon Tea"].includes(row.name);
      return {
        id: row.id,
        name: row.name,
        price: Number(row.price),
        category: row.categories?.name || known?.category || row.category_id,
        categoryId: row.category_id,
        veg: Boolean(row.is_veg),
        image: useTeaPhoto && known ? known.image : row.image_url || known?.image || seedProducts.find((item) => item.categoryId === row.category_id)?.image || "/images/photo-sheet.png",
        popular: Boolean(row.is_popular),
        isNew: Boolean(row.is_new_arrival),
        available: Boolean(row.is_available),
        description: row.description || known?.description || "A Cup Culture favourite, made fresh for your table.",
      };
    });
    return NextResponse.json({ products: items });
  } catch (error) {
    console.error("menu_read_error", error);
    return NextResponse.json({ products: seedProducts });
  }
}
