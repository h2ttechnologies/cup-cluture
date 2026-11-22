import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { isSupabaseConfigured,createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin-dashboard";
export const dynamic="force-dynamic";
export default async function AdminPage(){if(!isSupabaseConfigured)return <><section className="page-hero"><div className="page-hero-inner"><span className="eyebrow">CUP CULTURE TEAM</span><h1 className="page-title">The café, behind the scenes.</h1></div></section><section className="page-body"><div className="admin-lock"><LockKeyhole size={28}/><h1>Connect the café dashboard.</h1><p>Admin tools are protected behind Supabase sign-in and the admin role. Add the Supabase URL, public key and server-only service role key, run the database migrations, then set the authorised user’s profile role to <code>admin</code>.</p><Link href="/profile" className="button button-primary">Go to sign in</Link></div></section></>;
  const client=await createClient();const {data:{user}}=await client.auth.getUser();if(!user)redirect("/profile");const {data:profile}=await client.from("profiles").select("role,full_name").eq("id",user.id).maybeSingle();if(profile?.role!=="admin")return <><section className="page-hero"><div className="page-hero-inner"><span className="eyebrow">CUP CULTURE TEAM</span><h1 className="page-title">The café, behind the scenes.</h1></div></section><section className="page-body"><div className="admin-lock"><LockKeyhole size={28}/><h1>This area is for café admins.</h1><p>You are signed in as {user.email}, but this account doesn’t have the administrator role.</p><Link href="/profile" className="button button-primary">Back to your account</Link></div></section></>;
  return <AdminDashboard adminName={profile.full_name||user.email||"Cup Culture Admin"}/>;
}
