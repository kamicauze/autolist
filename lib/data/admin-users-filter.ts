export const ADMIN_USER_CATEGORIES = [
  { value: "dealer", label: "Dealers" },
  { value: "private_seller", label: "Private sellers" },
  { value: "buyer", label: "Buyers" },
  { value: "staff", label: "Staff" },
] as const;

export type AdminUserCategory = (typeof ADMIN_USER_CATEGORIES)[number]["value"];

export type AdminUsersFilterState = {
  category: AdminUserCategory;
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

const STAFF_ROLES = new Set(["sales_agent", "support", "admin", "super_admin"]);

export function getAdminUserCategory(user: FilterableAdminUser): AdminUserCategory {
  if (user.role === "dealer" || user.dealerStatus !== null) return "dealer";
  if (user.role === "seller") return "private_seller";
  if (user.role === "buyer") return "buyer";
  if (STAFF_ROLES.has(user.role)) return "staff";

  return "buyer";
}

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
    const matchesCategory = getAdminUserCategory(user) === filters.category;
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

    return (
      matchesCategory &&
      matchesQuery &&
      matchesRole &&
      matchesDealerStatus &&
      matchesListingActivity
    );
  });
}
