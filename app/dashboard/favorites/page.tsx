import { FavoritesGrid } from "@/components/dashboard/favorites/favorites-grid";
import { getDashboardFavoritesData } from "@/lib/data/favorites";

export default async function FavoritesPage() {
  const favorites = await getDashboardFavoritesData();

  return <FavoritesGrid favorites={favorites} />;
}
