export type HomepageListingRailTab = "featured" | "viewed" | "recent" | "favorites";

export function getHomepageListingRailViewAllHref(
  activeTab: HomepageListingRailTab,
  isAuthenticated: boolean
) {
  if (activeTab === "featured") return "/search?featured=true";
  if (activeTab === "viewed") return "/recently-viewed";
  if (activeTab === "favorites") {
    return isAuthenticated
      ? "/dashboard/favorites"
      : `/login?next=${encodeURIComponent("/dashboard/favorites")}`;
  }

  return "/search?sortBy=newest";
}
