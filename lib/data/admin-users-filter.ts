export type AdminUsersFilterState = {
  query: string;
  role: "all" | string;
  dealerStatus: "all" | "none" | "PENDING" | "APPROVED" | "REJECTED";
  listingActivity: "all" | "with_listings" | "active" | "none";
};

type FilterableAdminUser = {
  name: string;
  email: string | null;
  role: string;
  dealerStatus: string | null;
  listingCount: number;
  activeListingCount: number;
};

export function filterAdminUsers<T extends FilterableAdminUser>(
  users: readonly T[],
  filters: AdminUsersFilterState
) {
  const query = filters.query.trim().toLowerCase();

  return users.filter((user) => {
    const searchableText = [
      user.name,
      user.email,
      user.role,
      user.dealerStatus,
      `${user.listingCount} listings`,
      `${user.activeListingCount} active`,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesQuery = !query || searchableText.includes(query);
    const matchesRole = filters.role === "all" || user.role === filters.role;
    const matchesDealerStatus =
      filters.dealerStatus === "all" ||
      (filters.dealerStatus === "none"
        ? user.dealerStatus === null
        : user.dealerStatus === filters.dealerStatus);
    const matchesListingActivity =
      filters.listingActivity === "all" ||
      (filters.listingActivity === "with_listings" && user.listingCount > 0) ||
      (filters.listingActivity === "active" && user.activeListingCount > 0) ||
      (filters.listingActivity === "none" && user.listingCount === 0);

    return matchesQuery && matchesRole && matchesDealerStatus && matchesListingActivity;
  });
}
