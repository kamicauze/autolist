import { cache } from "react";
import { createAdminClient, createOptionalAdminClient } from "@/lib/supabase/admin";
import type { ListingStatus } from "@/lib/types/listing";

type AdminProfileRole = "buyer" | "seller" | "dealer" | "admin" | "support";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AdminProfileRole;
  created_at: string;
};

type DealerRow = {
  id: string;
  profile_id: string;
  name: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  city: string | null;
  created_at: string;
  profile: Array<{ full_name: string | null; email: string | null }> | null;
};

type ListingRow = {
  id: string;
  status: ListingStatus;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  body_type: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
  seller: Array<{ id: string; full_name: string | null; email: string | null }> | null;
  dealer: Array<{ id: string; name: string; city: string | null }> | null;
};

type TicketRow = {
  id: string;
  subject: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "triaged" | "waiting_on_seller" | "waiting_on_buyer" | "resolved" | "closed";
  updated_at: string;
  assigned_to_profile: Array<{ full_name: string | null; email: string | null }> | null;
};

type UserListingCountRow = {
  seller_id: string;
  status: ListingStatus;
};

export type AdminDashboardMetric = {
  label: string;
  value: number;
  note?: string;
};

export type AdminDashboardListing = {
  id: string;
  title: string;
  subtitle: string | null;
  sellerName: string;
  sellerEmail: string | null;
  sellerType: "Dealer" | "Private";
  dealerName: string | null;
  status: ListingStatus;
  price: number;
  currency: string;
  createdAt: string;
};

export type AdminDashboardUser = {
  id: string;
  name: string;
  email: string | null;
  role: AdminProfileRole;
  joinedAt: string;
  dealerStatus: DealerRow["status"] | null;
  listingCount: number;
  activeListingCount: number;
};

export type AdminDashboardTicket = {
  id: string;
  subject: string;
  priority: TicketRow["priority"];
  status: TicketRow["status"];
  updatedAt: string;
  assignedTo: string | null;
};

export type AdminDashboardDealer = {
  id: string;
  name: string;
  city: string | null;
  contactName: string;
  contactEmail: string | null;
  createdAt: string;
};

export type AdminDashboardData = {
  metrics: {
    totalListings: AdminDashboardMetric;
    pendingListings: AdminDashboardMetric;
    totalUsers: AdminDashboardMetric;
    supportQueue: AdminDashboardMetric;
  };
  recentListings: AdminDashboardListing[];
  recentUsers: AdminDashboardUser[];
  recentTickets: AdminDashboardTicket[];
  pendingDealers: AdminDashboardDealer[];
};

export type AdminListingsOverviewData = {
  stats: Record<ListingStatus, number>;
  total: number;
  listings: AdminDashboardListing[];
};

export type AdminUsersOverviewData = {
  stats: {
    total: number;
    buyers: number;
    sellers: number;
    dealers: number;
    staff: number;
    pendingDealers: number;
  };
  users: AdminDashboardUser[];
};

type AuditLogRow = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  actor: Array<{ id: string; full_name: string | null; email: string | null }> | null;
};

export type AdminAuditLogEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  actor: {
    id: string | null;
    name: string;
    email: string | null;
  };
};

export type AdminAuditLogsData = {
  stats: {
    total: number;
    last24Hours: number;
    dealerEvents: number;
    listingEvents: number;
  };
  logs: AdminAuditLogEntry[];
};

export type AdminNavBadgeCounts = Partial<Record<string, number>>;

const EMPTY_ADMIN_DASHBOARD_DATA: AdminDashboardData = {
  metrics: {
    totalListings: {
      label: "Total listings",
      value: 0,
      note: "Unavailable",
    },
    pendingListings: {
      label: "Pending moderation",
      value: 0,
      note: "Unavailable",
    },
    totalUsers: {
      label: "Registered users",
      value: 0,
      note: "Unavailable",
    },
    supportQueue: {
      label: "Open support tickets",
      value: 0,
      note: "Unavailable",
    },
  },
  recentListings: [],
  recentUsers: [],
  recentTickets: [],
  pendingDealers: [],
};

function firstRelation<T>(value: T[] | null | undefined) {
  return Array.isArray(value) ? value[0] || null : null;
}

function readMetadataString(metadata: Record<string, unknown> | null, key: string) {
  const value = metadata && key in metadata ? metadata[key] : null;
  if (value == null) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function buildListingTitle(listing: Pick<ListingRow, "year" | "make" | "model" | "metadata">) {
  return [
    String(listing.year),
    listing.make,
    listing.model,
    readMetadataString(listing.metadata, "trim"),
  ]
    .filter(Boolean)
    .join(" ");
}

function buildListingSubtitle(
  listing: Pick<ListingRow, "body_type" | "metadata">
) {
  return [readMetadataString(listing.metadata, "variant"), listing.body_type]
    .filter(Boolean)
    .join(" • ") || null;
}

function normalizeListing(listing: ListingRow): AdminDashboardListing {
  const seller = firstRelation(listing.seller);
  const dealer = firstRelation(listing.dealer);

  return {
    id: listing.id,
    title: buildListingTitle(listing),
    subtitle: buildListingSubtitle(listing),
    sellerName: seller?.full_name || dealer?.name || seller?.email || "Unknown seller",
    sellerEmail: seller?.email || null,
    sellerType: dealer ? "Dealer" : "Private",
    dealerName: dealer?.name || null,
    status: listing.status,
    price: Number(listing.price || 0),
    currency: listing.currency,
    createdAt: listing.created_at,
  };
}

function normalizeUser(
  profile: ProfileRow,
  dealerByProfileId: Map<string, DealerRow>,
  listingCountsBySellerId: Map<string, { total: number; active: number }>
): AdminDashboardUser {
  const dealer = dealerByProfileId.get(profile.id) || null;
  const counts = listingCountsBySellerId.get(profile.id) || { total: 0, active: 0 };

  return {
    id: profile.id,
    name: profile.full_name || profile.email || "Unnamed user",
    email: profile.email,
    role: profile.role,
    joinedAt: profile.created_at,
    dealerStatus: dealer?.status || null,
    listingCount: counts.total,
    activeListingCount: counts.active,
  };
}

function normalizeTicket(ticket: TicketRow): AdminDashboardTicket {
  const assignee = firstRelation(ticket.assigned_to_profile);

  return {
    id: ticket.id,
    subject: ticket.subject,
    priority: ticket.priority,
    status: ticket.status,
    updatedAt: ticket.updated_at,
    assignedTo: assignee?.full_name || assignee?.email || null,
  };
}

function normalizeAuditLog(log: AuditLogRow): AdminAuditLogEntry {
  const actor = firstRelation(log.actor);

  return {
    id: log.id,
    action: log.action,
    entityType: log.entity_type,
    entityId: log.entity_id,
    details: log.details,
    ipAddress: log.ip_address,
    createdAt: log.created_at,
    actor: {
      id: actor?.id || log.user_id,
      name: actor?.full_name || actor?.email || "System",
      email: actor?.email || null,
    },
  };
}

async function readCount(query: PromiseLike<{ count: number | null }>) {
  const { count } = await query;
  return count ?? 0;
}

export const getAdminNavBadgeCounts = cache(async (): Promise<AdminNavBadgeCounts> => {
  const adminSupabase = createOptionalAdminClient();
  if (!adminSupabase) {
    console.warn("Admin badge counts unavailable: Supabase service role environment variables are missing.");
    return {};
  }

  const [pendingListings, pendingDealers, openTickets] = await Promise.all([
    readCount(adminSupabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "pending")),
    readCount(adminSupabase.from("dealers").select("*", { count: "exact", head: true }).eq("status", "PENDING")),
    readCount(
      adminSupabase
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "triaged", "waiting_on_seller", "waiting_on_buyer"])
    ),
  ]);

  return {
    "/admin/review": pendingListings || undefined,
    "/admin/verification": pendingDealers || undefined,
    "/admin/car-inquiries": openTickets || undefined,
  };
});

export const getAdminDashboardData = cache(async (): Promise<AdminDashboardData> => {
  const adminSupabase = createOptionalAdminClient();
  if (!adminSupabase) {
    console.warn("Admin dashboard data unavailable: Supabase service role environment variables are missing.");
    return EMPTY_ADMIN_DASHBOARD_DATA;
  }

  const [
    totalListings,
    pendingListings,
    totalUsers,
    openTickets,
    recentListingsResult,
    recentProfilesResult,
    dealerRowsResult,
    listingCountRowsResult,
    recentTicketsResult,
    pendingDealersResult,
  ] = await Promise.all([
    readCount(adminSupabase.from("listings").select("*", { count: "exact", head: true })),
    readCount(adminSupabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "pending")),
    readCount(adminSupabase.from("profiles").select("*", { count: "exact", head: true })),
    readCount(
      adminSupabase
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "triaged", "waiting_on_seller", "waiting_on_buyer"])
    ),
    adminSupabase
      .from("listings")
      .select(
        `
          id,
          status,
          make,
          model,
          year,
          price,
          currency,
          body_type,
          created_at,
          metadata,
          seller:profiles!seller_id(id, full_name, email),
          dealer:dealers(id, name, city)
        `
      )
      .order("created_at", { ascending: false })
      .limit(8),
    adminSupabase
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    adminSupabase
      .from("dealers")
      .select("id, profile_id, name, status, city, created_at, profile:profiles!profile_id(full_name, email)")
      .order("created_at", { ascending: false }),
    adminSupabase.from("listings").select("seller_id, status"),
    adminSupabase
      .from("support_tickets")
      .select(
        `
          id,
          subject,
          priority,
          status,
          updated_at,
          assigned_to_profile:profiles!assigned_to(full_name, email)
        `
      )
      .order("updated_at", { ascending: false })
      .limit(6),
    adminSupabase
      .from("dealers")
      .select("id, profile_id, name, status, city, created_at, profile:profiles!profile_id(full_name, email)")
      .eq("status", "PENDING")
      .order("created_at", { ascending: true })
      .limit(5),
  ]);

  const dealerRows = (dealerRowsResult.data || []) as unknown as DealerRow[];
  const listingCountRows = (listingCountRowsResult.data || []) as unknown as UserListingCountRow[];
  const dealerByProfileId = new Map(dealerRows.map((dealer) => [dealer.profile_id, dealer]));
  const listingCountsBySellerId = new Map<string, { total: number; active: number }>();

  for (const row of listingCountRows) {
    const existing = listingCountsBySellerId.get(row.seller_id) || { total: 0, active: 0 };
    existing.total += 1;
    if (row.status === "active") {
      existing.active += 1;
    }
    listingCountsBySellerId.set(row.seller_id, existing);
  }

  return {
    metrics: {
      totalListings: {
        label: "Total listings",
        value: totalListings,
        note: `${pendingListings} pending review`,
      },
      pendingListings: {
        label: "Pending moderation",
        value: pendingListings,
        note: "Review queue",
      },
      totalUsers: {
        label: "Registered users",
        value: totalUsers,
      },
      supportQueue: {
        label: "Open support tickets",
        value: openTickets,
        note: "Buyer and seller issues",
      },
    },
    recentListings: ((recentListingsResult.data || []) as unknown as ListingRow[]).map(normalizeListing),
    recentUsers: ((recentProfilesResult.data || []) as ProfileRow[]).map((profile) =>
      normalizeUser(profile, dealerByProfileId, listingCountsBySellerId)
    ),
    recentTickets: ((recentTicketsResult.data || []) as unknown as TicketRow[]).map(normalizeTicket),
    pendingDealers: ((pendingDealersResult.data || []) as unknown as DealerRow[]).map((dealer) => {
      const profile = firstRelation(dealer.profile);
      return {
        id: dealer.id,
        name: dealer.name,
        city: dealer.city,
        contactName: profile?.full_name || profile?.email || "Unknown dealer",
        contactEmail: profile?.email || null,
        createdAt: dealer.created_at,
      } satisfies AdminDashboardDealer;
    }),
  };
});

export const getAdminListingsOverviewData = cache(
  async (limit = 80): Promise<AdminListingsOverviewData> => {
    const adminSupabase = createAdminClient();
    const statuses: ListingStatus[] = ["draft", "pending", "active", "rejected", "sold", "expired"];

    const countResults = await Promise.all(
      statuses.map((status) =>
        readCount(adminSupabase.from("listings").select("*", { count: "exact", head: true }).eq("status", status))
      )
    );

    const { data } = await adminSupabase
      .from("listings")
      .select(
        `
          id,
          status,
          make,
          model,
          year,
          price,
          currency,
          body_type,
          created_at,
          metadata,
          seller:profiles!seller_id(id, full_name, email),
          dealer:dealers(id, name, city)
        `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    return {
      stats: Object.fromEntries(statuses.map((status, index) => [status, countResults[index]])) as Record<
        ListingStatus,
        number
      >,
      total: countResults.reduce((sum, count) => sum + count, 0),
      listings: ((data || []) as unknown as ListingRow[]).map(normalizeListing),
    };
  }
);

export const getAdminUsersOverviewData = cache(async (limit = 80): Promise<AdminUsersOverviewData> => {
  const adminSupabase = createAdminClient();

  const [
    total,
    buyers,
    sellers,
    dealers,
    admins,
    supports,
    pendingDealers,
    profilesResult,
  ] = await Promise.all([
    readCount(adminSupabase.from("profiles").select("*", { count: "exact", head: true })),
    readCount(adminSupabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "buyer")),
    readCount(adminSupabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "seller")),
    readCount(adminSupabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "dealer")),
    readCount(adminSupabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin")),
    readCount(adminSupabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "support")),
    readCount(adminSupabase.from("dealers").select("*", { count: "exact", head: true }).eq("status", "PENDING")),
    adminSupabase
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  const profiles = (profilesResult.data || []) as ProfileRow[];
  const profileIds = profiles.map((profile) => profile.id);

  const [dealerRowsResult, listingCountRowsResult] = await Promise.all([
    profileIds.length > 0
      ? adminSupabase
          .from("dealers")
          .select("id, profile_id, name, status, city, created_at, profile:profiles!profile_id(full_name, email)")
          .in("profile_id", profileIds)
      : Promise.resolve({ data: [] }),
    profileIds.length > 0
      ? adminSupabase.from("listings").select("seller_id, status").in("seller_id", profileIds)
      : Promise.resolve({ data: [] }),
  ]);

  const dealerRows = (dealerRowsResult.data || []) as unknown as DealerRow[];
  const listingCountRows = (listingCountRowsResult.data || []) as unknown as UserListingCountRow[];
  const dealerByProfileId = new Map(dealerRows.map((dealer) => [dealer.profile_id, dealer]));
  const listingCountsBySellerId = new Map<string, { total: number; active: number }>();

  for (const row of listingCountRows) {
    const existing = listingCountsBySellerId.get(row.seller_id) || { total: 0, active: 0 };
    existing.total += 1;
    if (row.status === "active") {
      existing.active += 1;
    }
    listingCountsBySellerId.set(row.seller_id, existing);
  }

  return {
    stats: {
      total,
      buyers,
      sellers,
      dealers,
      staff: admins + supports,
      pendingDealers,
    },
    users: profiles.map((profile) => normalizeUser(profile, dealerByProfileId, listingCountsBySellerId)),
  };
});

export const getAdminAuditLogsData = cache(async (limit = 80): Promise<AdminAuditLogsData> => {
  const adminSupabase = createAdminClient();
  const last24HoursCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [total, last24Hours, dealerEvents, listingEvents, logsResult] = await Promise.all([
    readCount(adminSupabase.from("audit_logs").select("*", { count: "exact", head: true })),
    readCount(
      adminSupabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", last24HoursCutoff)
    ),
    readCount(
      adminSupabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .eq("entity_type", "dealer")
    ),
    readCount(
      adminSupabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .eq("entity_type", "listing")
    ),
    adminSupabase
      .from("audit_logs")
      .select(
        `
          id,
          user_id,
          action,
          entity_type,
          entity_id,
          details,
          ip_address,
          created_at,
          actor:profiles!user_id(id, full_name, email)
        `
      )
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  return {
    stats: {
      total,
      last24Hours,
      dealerEvents,
      listingEvents,
    },
    logs: ((logsResult.data || []) as unknown as AuditLogRow[]).map(normalizeAuditLog),
  };
});
