import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FavoritesGrid } from "@/components/dashboard/favorites/favorites-grid";
import { getDashboardFavoritesData } from "@/lib/data/favorites";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Fdashboard%2Ffavorites");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "buyer") redirect("/dashboard");
  const favorites = await getDashboardFavoritesData();

  return <FavoritesGrid favorites={favorites} />;
}
