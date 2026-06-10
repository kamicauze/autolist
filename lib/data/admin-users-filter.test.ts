import assert from "node:assert/strict";
import { filterAdminUsers, type AdminUsersFilterState } from "./admin-users-filter";

const users = [
  {
    id: "buyer-1",
    name: "Amina Buyer",
    email: "amina@example.com",
    role: "buyer",
    joinedAt: "2026-01-01T00:00:00.000Z",
    dealerStatus: null,
    listingCount: 0,
    activeListingCount: 0,
  },
  {
    id: "dealer-1",
    name: "Nairobi Motors",
    email: "sales@nairobimotors.test",
    role: "dealer",
    joinedAt: "2026-01-02T00:00:00.000Z",
    dealerStatus: "APPROVED",
    listingCount: 8,
    activeListingCount: 5,
  },
  {
    id: "seller-1",
    name: "Pending Dealer Lead",
    email: "lead@example.com",
    role: "seller",
    joinedAt: "2026-01-03T00:00:00.000Z",
    dealerStatus: "PENDING",
    listingCount: 2,
    activeListingCount: 0,
  },
] as const;

const defaultFilters: AdminUsersFilterState = {
  query: "",
  role: "all",
  dealerStatus: "all",
  listingActivity: "all",
};

assert.deepEqual(
  filterAdminUsers(users, { ...defaultFilters, query: "nairobi" }).map((user) => user.id),
  ["dealer-1"]
);

assert.deepEqual(
  filterAdminUsers(users, { ...defaultFilters, role: "dealer" }).map((user) => user.id),
  ["dealer-1"]
);

assert.deepEqual(
  filterAdminUsers(users, { ...defaultFilters, dealerStatus: "PENDING" }).map((user) => user.id),
  ["seller-1"]
);

assert.deepEqual(
  filterAdminUsers(users, { ...defaultFilters, listingActivity: "none" }).map((user) => user.id),
  ["buyer-1"]
);
