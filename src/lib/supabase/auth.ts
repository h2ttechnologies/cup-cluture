import { createClient } from "@/lib/supabase/server";
export async function getAdminUser(){const client=await createClient();const {data:{user},error}=await client.auth.getUser();if(error||!user)return null;const {data:profile}=await client.from("profiles").select("role").eq("id",user.id).maybeSingle();if(profile?.role!=="admin")return null;return user;}
