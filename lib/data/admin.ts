import { cache } from "react";
import { createOptionalAdminClient } from "@/lib/supabase/admin";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import type { ListingStatus } from "@/lib/types/listing";

export type AdminProfileRole = "buyer" | "seller" | "dealer" | "admin" | "support";

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
    admins: number;
    supports: number;
    staff: number;
    pendingDealers: number;
  };
  users: AdminDashboardUser[];
};

export type AdminRoleSummary = {
  key: AdminProfileRole;
  label: string;
  description: string;
  count: number;
  tone: "blue" | "green" | "amber" | "red" | "slate";
  note?: string;
};

export type AdminRolesPermissionsData = {
  stats: {
    total: number;
    admins: number;
    supports: number;
    staff: number;
    pendingDealers: number;
  };
  roles: AdminRoleSummary[];
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

type PaymentRow = {
  id: string;
  user_id: string;
  reference: string;
  provider: "stripe" | "mpesa" | "manual";
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  purpose: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type PaymentProfileRow = Pick<ProfileRow, "id" | "full_name" | "email" | "role">;

type ReportTicketRow = {
  id: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "triaged" | "waiting_on_seller" | "waiting_on_buyer" | "resolved" | "closed";
  customer_summary: string | null;
  internal_note: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
  assigned_to_profile: Array<{ id: string; full_name: string | null; email: string | null }> | null;
  created_by_profile: Array<{ id: string; full_name: string | null; email: string | null }> | null;
  listing: Array<{ id: string; make: string; model: string; year: number }> | null;
};

type TicketEventRow = {
  id: string;
  ticket_id: string;
  actor_id: string | null;
  event_type: "created" | "assigned" | "status_changed" | "internal_note" | "resolved" | "closed";
  note: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor: Array<{ full_name: string | null; email: string | null }> | null;
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

export type AdminPaymentEntry = {
  id: string;
  reference: string;
  accountName: string;
  accountEmail: string | null;
  accountRole: AdminProfileRole | null;
  purpose: string;
  provider: PaymentRow["provider"];
  amount: number;
  currency: string;
  status: PaymentRow["status"];
  createdAt: string;
  note: string | null;
};

export type AdminPaymentBreakdownItem = {
  label: string;
  count: number;
  amount: number;
  currency: string;
};

export type AdminPaymentsData = {
  stats: {
    grossVolume: number;
    pendingVolume: number;
    refundCount: number;
    successfulPayments: number;
    pendingCount: number;
    primaryCurrency: string;
  };
  payments: AdminPaymentEntry[];
  purposeBreakdown: AdminPaymentBreakdownItem[];
  providerBreakdown: AdminPaymentBreakdownItem[];
};

export type AdminReportTicket = {
  id: string;
  subject: string;
  category: string;
  priority: ReportTicketRow["priority"];
  status: ReportTicketRow["status"];
  customerSummary: string | null;
  internalNote: string | null;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: string | null;
  createdBy: string | null;
  listingTitle: string | null;
};

export type AdminReportEvent = {
  id: string;
  ticketId: string;
  ticketSubject: string;
  ticketPriority: ReportTicketRow["priority"] | null;
  ticketStatus: ReportTicketRow["status"] | null;
  eventType: TicketEventRow["event_type"];
  note: string | null;
  actorName: string;
  createdAt: string;
};

export type AdminReportsData = {
  stats: {
    open: number;
    highPriority: number;
    resolvedToday: number;
    unassigned: number;
  };
  tickets: AdminReportTicket[];
  recentEvents: AdminReportEvent[];
};

export type AdminAnalyticsDay = {
  key: string;
  label: string;
  users: number;
  listings: number;
  payments: number;
  tickets: number;
  revenue: number;
};

export type AdminAnalyticsBreakdownItem = {
  label: string;
  value: number;
  amount?: number;
  note?: string;
};

export type AdminAnalyticsData = {
  metrics: {
    newUsers30Days: AdminDashboardMetric;
    newListings30Days: AdminDashboardMetric;
    paymentVolume30Days: AdminDashboardMetric;
    openTickets: AdminDashboardMetric;
  };
  activity: AdminAnalyticsDay[];
  listingMix: AdminAnalyticsBreakdownItem[];
  userMix: AdminAnalyticsBreakdownItem[];
  paymentMix: AdminAnalyticsBreakdownItem[];
  providerMix: AdminAnalyticsBreakdownItem[];
  supportMix: AdminAnalyticsBreakdownItem[];
  primaryCurrency: string;
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

const EMPTY_ADMIN_LISTINGS_OVERVIEW_DATA: AdminListingsOverviewData = {
  stats: {
    draft: 0,
    pending: 0,
    active: 0,
    reserved: 0,
    rejected: 0,
    sold: 0,
    expired: 0,
  },
  total: 0,
  listings: [],
};

const EMPTY_ADMIN_USERS_OVERVIEW_DATA: AdminUsersOverviewData = {
  stats: {
    total: 0,
    buyers: 0,
    sellers: 0,
    dealers: 0,
    admins: 0,
    supports: 0,
    staff: 0,
    pendingDealers: 0,
  },
  users: [],
};

const EMPTY_ADMIN_ROLES_PERMISSIONS_DATA: AdminRolesPermissionsData = {
  stats: {
    total: 0,
    admins: 0,
    supports: 0,
    staff: 0,
    pendingDealers: 0,
  },
  roles: [],
  users: [],
};

const EMPTY_ADMIN_AUDIT_LOGS_DATA: AdminAuditLogsData = {
  stats: {
    total: 0,
    last24Hours: 0,
    dealerEvents: 0,
    listingEvents: 0,
  },
  logs: [],
};

const EMPTY_ADMIN_PAYMENTS_DATA: AdminPaymentsData = {
  stats: {
    grossVolume: 0,
    pendingVolume: 0,
    refundCount: 0,
    successfulPayments: 0,
    pendingCount: 0,
    primaryCurrency: "KES",
  },
  payments: [],
  purposeBreakdown: [],
  providerBreakdown: [],
};

const EMPTY_ADMIN_REPORTS_DATA: AdminReportsData = {
  stats: {
    open: 0,
    highPriority: 0,
    resolvedToday: 0,
    unassigned: 0,
  },
  tickets: [],
  recentEvents: [],
};

const EMPTY_ADMIN_ANALYTICS_DATA: AdminAnalyticsData = {
  metrics: {
    newUsers30Days: {
      label: "New users (30d)",
      value: 0,
      note: "Unavailable",
    },
    newListings30Days: {
      label: "New listings (30d)",
      value: 0,
      note: "Unavailable",
    },
    paymentVolume30Days: {
      label: "Payment volume (30d)",
      value: 0,
      note: "Unavailable",
    },
    openTickets: {
      label: "Open tickets",
      value: 0,
      note: "Unavailable",
    },
  },
  activity: [],
  listingMix: [],
  userMix: [],
  paymentMix: [],
  providerMix: [],
  supportMix: [],
  primaryCurrency: "KES",
};

function describeError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unknown error";
}

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

function normalizePayment(
  payment: PaymentRow,
  profileLookup: Map<string, PaymentProfileRow>
): AdminPaymentEntry {
  const profile = profileLookup.get(payment.user_id) || null;
  const fallbackAccountName = `User ${payment.user_id.slice(0, 8)}`;

  return {
    id: payment.id,
    reference: payment.reference,
    accountName: profile?.full_name || profile?.email || fallbackAccountName,
    accountEmail: profile?.email || null,
    accountRole: profile?.role || null,
    purpose: payment.purpose,
    provider: payment.provider,
    amount: Number(payment.amount || 0),
    currency: payment.currency || "KES",
    status: payment.status,
    createdAt: payment.created_at,
    note:
      readMetadataString(payment.metadata, "note") ||
      readMetadataString(payment.metadata, "plan_name") ||
      readMetadataString(payment.metadata, "package_name"),
  };
}

function buildCompactListingTitle(listing: { year: number; make: string; model: string } | null) {
  if (!listing) return null;
  return [String(listing.year), listing.make, listing.model].filter(Boolean).join(" ");
}

function normalizeReportTicket(ticket: ReportTicketRow): AdminReportTicket {
  const assignee = firstRelation(ticket.assigned_to_profile);
  const creator = firstRelation(ticket.created_by_profile);
  const listing = firstRelation(ticket.listing);

  return {
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    customerSummary: ticket.customer_summary,
    internalNote: ticket.internal_note,
    resolutionNote: ticket.resolution_note,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    assignedTo: assignee?.full_name || assignee?.email || null,
    createdBy: creator?.full_name || creator?.email || null,
    listingTitle: buildCompactListingTitle(listing || null),
  };
}

function normalizeReportEvent(
  event: TicketEventRow,
  ticketById: Map<string, AdminReportTicket>
): AdminReportEvent {
  const actor = firstRelation(event.actor);
  const ticket = ticketById.get(event.ticket_id) || null;

  return {
    id: event.id,
    ticketId: event.ticket_id,
    ticketSubject: ticket?.subject || "Unknown ticket",
    ticketPriority: ticket?.priority || null,
    ticketStatus: ticket?.status || null,
    eventType: event.event_type,
    note: event.note,
    actorName: actor?.full_name || actor?.email || "System",
    createdAt: event.created_at,
  };
}

function isOpenTicket(
  status: ReportTicketRow["status"] | TicketRow["status"]
) {
  return status === "open" || status === "triaged" || status === "waiting_on_seller" || status === "waiting_on_buyer";
}

function paymentCurrency(rows: Array<{ currency: string }>) {
  const totals = new Map<string, number>();

  for (const row of rows) {
    const currency = row.currency || "KES";
    totals.set(currency, (totals.get(currency) || 0) + 1);
  }

  const [topCurrency] = [...totals.entries()].sort((left, right) => right[1] - left[1])[0] || [];
  return topCurrency || "KES";
}

function sumPaymentAmounts(rows: Array<{ amount: number }>) {
  return rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
}

function formatEnumLabel(value: string) {
  if (value === "mpesa") return "M-Pesa";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function buildPaymentBreakdown(
  rows: PaymentRow[],
  groupBy: "purpose" | "provider",
  currency: string
) {
  const totals = new Map<string, { count: number; amount: number }>();

  for (const row of rows) {
    const key = row[groupBy];
    const existing = totals.get(key) || { count: 0, amount: 0 };
    existing.count += 1;
    existing.amount += Number(row.amount || 0);
    totals.set(key, existing);
  }

  return [...totals.entries()]
    .map(([key, value]) => ({
      label: formatEnumLabel(key),
      count: value.count,
      amount: value.amount,
      currency,
    }))
    .sort((left, right) => right.amount - left.amount);
}

function buildUtcDaySeries(days: number) {
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - days + 1));

  return Array.from({ length: days }, (_, index) => {
    const current = new Date(start);
    current.setUTCDate(start.getUTCDate() + index);

    return {
      key: current.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("en-KE", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(current),
      users: 0,
      listings: 0,
      payments: 0,
      tickets: 0,
      revenue: 0,
    } satisfies AdminAnalyticsDay;
  });
}

function addActivityCount(
  buckets: Map<string, AdminAnalyticsDay>,
  timestamp: string,
  key: "users" | "listings" | "payments" | "tickets",
  amount = 1
) {
  const bucket = buckets.get(timestamp.slice(0, 10));
  if (!bucket) return;
  bucket[key] += amount;
}

function addActivityRevenue(
  buckets: Map<string, AdminAnalyticsDay>,
  timestamp: string,
  amount: number
) {
  const bucket = buckets.get(timestamp.slice(0, 10));
  if (!bucket) return;
  bucket.revenue += Number(amount || 0);
}

async function readCount(query: PromiseLike<{ count: number | null }>) {
  const { count } = await query;
  return count ?? 0;
}

export const getAdminNavBadgeCounts = cache(async (): Promise<AdminNavBadgeCounts> => {
  try {
    const adminSupabase = createOptionalAdminClient();
    if (!adminSupabase) {
      console.warn("Admin badge counts unavailable: Supabase service role environment variables are missing.");
      return {};
    }

    const [
      pendingListings,
      pendingDealers,
      openTickets,
      urgentReports,
      pendingPayments,
      insuranceCountResult,
    ] = await Promise.all([
      readCount(adminSupabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "pending")),
      readCount(adminSupabase.from("dealers").select("*", { count: "exact", head: true }).eq("status", "PENDING")),
      readCount(
        adminSupabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .in("status", ["open", "triaged", "waiting_on_seller", "waiting_on_buyer"])
      ),
      readCount(
        adminSupabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .in("status", ["open", "triaged", "waiting_on_seller", "waiting_on_buyer"])
          .in("priority", ["high", "urgent"])
      ),
      readCount(
        adminSupabase
          .from("payments")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      adminSupabase
        .from("insurance_requests")
        .select("*", { count: "exact", head: true })
        .in("status", ["new", "quoted", "blocked"]),
    ]);

    let openInsuranceRequests = insuranceCountResult.count ?? 0;
    if (insuranceCountResult.error) {
      if (!isMissingRelationError(insuranceCountResult.error)) {
        throw new Error(insuranceCountResult.error.message);
      }

      const fallbackResult = await adminSupabase
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .eq("category", "insurance_request")
        .in("status", ["open", "triaged", "waiting_on_seller", "waiting_on_buyer"]);

      if (fallbackResult.error) {
        throw new Error(fallbackResult.error.message);
      }

      openInsuranceRequests = fallbackResult.count ?? 0;
    }

    return {
      "/admin/review": pendingListings || undefined,
      "/admin/reports": urgentReports || undefined,
      "/admin/verification": pendingDealers || undefined,
      "/admin/insurance-requests": openInsuranceRequests || undefined,
      "/admin/car-inquiries": openTickets || undefined,
      "/admin/payments": pendingPayments || undefined,
    };
  } catch (error) {
    console.warn(`Admin badge counts unavailable: ${describeError(error)}`);
    return {};
  }
});

export const getAdminDashboardData = cache(async (): Promise<AdminDashboardData> => {
  try {
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
  } catch (error) {
    console.warn(`Admin dashboard data unavailable: ${describeError(error)}`);
    return EMPTY_ADMIN_DASHBOARD_DATA;
  }
});

export const getAdminListingsOverviewData = cache(
  async (limit = 80): Promise<AdminListingsOverviewData> => {
    try {
      const adminSupabase = createOptionalAdminClient();
      if (!adminSupabase) {
        console.warn("Admin listings unavailable: Supabase service role environment variables are missing.");
        return EMPTY_ADMIN_LISTINGS_OVERVIEW_DATA;
      }

      const statuses: ListingStatus[] = ["draft", "pending", "active", "reserved", "rejected", "sold", "expired"];

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
    } catch (error) {
      console.warn(`Admin listings unavailable: ${describeError(error)}`);
      return EMPTY_ADMIN_LISTINGS_OVERVIEW_DATA;
    }
  }
);

export const getAdminUsersOverviewData = cache(async (limit = 80): Promise<AdminUsersOverviewData> => {
  try {
    const adminSupabase = createOptionalAdminClient();
    if (!adminSupabase) {
      console.warn("Admin users unavailable: Supabase service role environment variables are missing.");
      return EMPTY_ADMIN_USERS_OVERVIEW_DATA;
    }

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
        admins,
        supports,
        staff: admins + supports,
        pendingDealers,
      },
      users: profiles.map((profile) => normalizeUser(profile, dealerByProfileId, listingCountsBySellerId)),
    };
  } catch (error) {
    console.warn(`Admin users unavailable: ${describeError(error)}`);
    return EMPTY_ADMIN_USERS_OVERVIEW_DATA;
  }
});

export const getAdminRolesPermissionsData = cache(async (limit = 120): Promise<AdminRolesPermissionsData> => {
  try {
    const usersOverview = await getAdminUsersOverviewData(limit);

    return {
      stats: {
        total: usersOverview.stats.total,
        admins: usersOverview.stats.admins,
        supports: usersOverview.stats.supports,
        staff: usersOverview.stats.staff,
        pendingDealers: usersOverview.stats.pendingDealers,
      },
      roles: [
        {
          key: "buyer",
          label: "Buyer",
          description: "Marketplace browsing, saved vehicles, and buyer enquiry access.",
          count: usersOverview.stats.buyers,
          tone: "slate",
        },
        {
          key: "seller",
          label: "Seller",
          description: "Private seller dashboard, listings, and buyer conversation access.",
          count: usersOverview.stats.sellers,
          tone: "blue",
        },
        {
          key: "dealer",
          label: "Dealer",
          description: "Dealer-facing listing flow plus KYC and verification workflows.",
          count: usersOverview.stats.dealers,
          tone: "green",
          note:
            usersOverview.stats.pendingDealers > 0
              ? `${usersOverview.stats.pendingDealers} dealer applications pending`
              : undefined,
        },
        {
          key: "support",
          label: "Support",
          description: "Support queue, escalated conversations, and ticket handling access.",
          count: usersOverview.stats.supports,
          tone: "amber",
        },
        {
          key: "admin",
          label: "Admin",
          description: "Full admin visibility across marketplace operations and system tools.",
          count: usersOverview.stats.admins,
          tone: "amber",
        },
      ],
      users: usersOverview.users,
    };
  } catch (error) {
    console.warn(`Admin roles unavailable: ${describeError(error)}`);
    return EMPTY_ADMIN_ROLES_PERMISSIONS_DATA;
  }
});

export const getAdminAuditLogsData = cache(async (limit = 80): Promise<AdminAuditLogsData> => {
  try {
    const adminSupabase = createOptionalAdminClient();
    if (!adminSupabase) {
      console.warn("Admin audit logs unavailable: Supabase service role environment variables are missing.");
      return EMPTY_ADMIN_AUDIT_LOGS_DATA;
    }

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
  } catch (error) {
    console.warn(`Admin audit logs unavailable: ${describeError(error)}`);
    return EMPTY_ADMIN_AUDIT_LOGS_DATA;
  }
});

export const getAdminPaymentsData = cache(async (limit = 80): Promise<AdminPaymentsData> => {
  try {
    const adminSupabase = createOptionalAdminClient();
    if (!adminSupabase) {
      console.warn("Admin payments unavailable: Supabase service role environment variables are missing.");
      return EMPTY_ADMIN_PAYMENTS_DATA;
    }

    const [paymentsResult, paymentSummaryResult] = await Promise.all([
      adminSupabase
        .from("payments")
        .select(
          `
            id,
            user_id,
            reference,
            provider,
            amount,
            currency,
            status,
            purpose,
            metadata,
            created_at
          `
        )
        .order("created_at", { ascending: false })
        .limit(limit),
      adminSupabase
        .from("payments")
        .select(
          `
            id,
            user_id,
            reference,
            provider,
            amount,
            currency,
            status,
            purpose,
            metadata,
            created_at
          `
        ),
    ]);

    if (paymentsResult.error) {
      throw new Error(paymentsResult.error.message);
    }

    if (paymentSummaryResult.error) {
      throw new Error(paymentSummaryResult.error.message);
    }

    const payments = (paymentsResult.data || []) as unknown as PaymentRow[];
    const summaryRows = (paymentSummaryResult.data || []) as unknown as PaymentRow[];
    const profileIds = Array.from(
      new Set([...payments, ...summaryRows].map((payment) => payment.user_id).filter(Boolean))
    );
    const { data: paymentProfiles, error: paymentProfilesError } = profileIds.length
      ? await adminSupabase
          .from("profiles")
          .select("id, full_name, email, role")
          .in("id", profileIds)
      : { data: [], error: null };

    if (paymentProfilesError) {
      throw new Error(paymentProfilesError.message);
    }

    const profileLookup = new Map(
      ((paymentProfiles || []) as PaymentProfileRow[]).map((profile) => [profile.id, profile])
    );
    const primaryCurrency = paymentCurrency(summaryRows);
    const succeededRows = summaryRows.filter((payment) => payment.status === "succeeded");
    const pendingRows = summaryRows.filter((payment) => payment.status === "pending");
    const refundedRows = summaryRows.filter((payment) => payment.status === "refunded");

    return {
      stats: {
        grossVolume: sumPaymentAmounts(succeededRows),
        pendingVolume: sumPaymentAmounts(pendingRows),
        refundCount: refundedRows.length,
        successfulPayments: succeededRows.length,
        pendingCount: pendingRows.length,
        primaryCurrency,
      },
      payments: payments.map((payment) => normalizePayment(payment, profileLookup)),
      purposeBreakdown: buildPaymentBreakdown(summaryRows, "purpose", primaryCurrency),
      providerBreakdown: buildPaymentBreakdown(summaryRows, "provider", primaryCurrency),
    };
  } catch (error) {
    console.warn(`Admin payments unavailable: ${describeError(error)}`);
    return EMPTY_ADMIN_PAYMENTS_DATA;
  }
});

export const getAdminReportsData = cache(
  async (ticketLimit = 80, eventLimit = 16): Promise<AdminReportsData> => {
    try {
      const adminSupabase = createOptionalAdminClient();
      if (!adminSupabase) {
        console.warn("Admin reports unavailable: Supabase service role environment variables are missing.");
        return EMPTY_ADMIN_REPORTS_DATA;
      }

      const [ticketsResult, eventsResult] = await Promise.all([
        adminSupabase
          .from("support_tickets")
          .select(
            `
              id,
              subject,
              category,
              priority,
              status,
              customer_summary,
              internal_note,
              resolution_note,
              created_at,
              updated_at,
              assigned_to_profile:profiles!assigned_to(id, full_name, email),
              created_by_profile:profiles!created_by(id, full_name, email),
              listing:listings(id, make, model, year)
            `
          )
          .order("updated_at", { ascending: false })
          .limit(ticketLimit),
        adminSupabase
          .from("ticket_events")
          .select(
            `
              id,
              ticket_id,
              actor_id,
              event_type,
              note,
              metadata,
              created_at,
              actor:profiles!actor_id(full_name, email)
            `
          )
          .order("created_at", { ascending: false })
          .limit(eventLimit),
      ]);

      const today = new Date().toISOString().slice(0, 10);
      const tickets = ((ticketsResult.data || []) as unknown as ReportTicketRow[]).map(normalizeReportTicket);
      const ticketById = new Map(tickets.map((ticket) => [ticket.id, ticket]));

      return {
        stats: {
          open: tickets.filter((ticket) => isOpenTicket(ticket.status)).length,
          highPriority: tickets.filter(
            (ticket) => isOpenTicket(ticket.status) && ["high", "urgent"].includes(ticket.priority)
          ).length,
          resolvedToday: tickets.filter(
            (ticket) =>
              ["resolved", "closed"].includes(ticket.status) && ticket.updatedAt.slice(0, 10) === today
          ).length,
          unassigned: tickets.filter((ticket) => isOpenTicket(ticket.status) && !ticket.assignedTo).length,
        },
        tickets,
        recentEvents: ((eventsResult.data || []) as unknown as TicketEventRow[]).map((event) =>
          normalizeReportEvent(event, ticketById)
        ),
      };
    } catch (error) {
      console.warn(`Admin reports unavailable: ${describeError(error)}`);
      return EMPTY_ADMIN_REPORTS_DATA;
    }
  }
);

export const getAdminAnalyticsData = cache(async (): Promise<AdminAnalyticsData> => {
  try {
    const adminSupabase = createOptionalAdminClient();
    if (!adminSupabase) {
      console.warn("Admin analytics unavailable: Supabase service role environment variables are missing.");
      return EMPTY_ADMIN_ANALYTICS_DATA;
    }

    const activityDays = 14;
    const today = new Date();
    const thirtyDayCutoff = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 29)
    ).toISOString();
    const activityCutoff = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - activityDays + 1)
    ).toISOString();

    const [
      users30Days,
      listings30Days,
      openTickets,
      profileActivityResult,
      listingActivityResult,
      ticketSummaryResult,
      paymentSummaryResult,
      listingsOverview,
      usersOverview,
    ] = await Promise.all([
      readCount(
        adminSupabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDayCutoff)
      ),
      readCount(
        adminSupabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDayCutoff)
      ),
      readCount(
        adminSupabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .in("status", ["open", "triaged", "waiting_on_seller", "waiting_on_buyer"])
      ),
      adminSupabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", activityCutoff),
      adminSupabase
        .from("listings")
        .select("created_at")
        .gte("created_at", activityCutoff),
      adminSupabase
        .from("support_tickets")
        .select("created_at, status, priority"),
      adminSupabase
        .from("payments")
        .select("amount, currency, status, purpose, provider, created_at"),
      getAdminListingsOverviewData(0),
      getAdminUsersOverviewData(0),
    ]);

    const paymentRows = (paymentSummaryResult.data || []) as unknown as PaymentRow[];
    const ticketRows = (ticketSummaryResult.data || []) as Array<{
      created_at: string;
      status: ReportTicketRow["status"];
      priority: ReportTicketRow["priority"];
    }>;
    const profileActivityRows = (profileActivityResult.data || []) as Array<{ created_at: string }>;
    const listingActivityRows = (listingActivityResult.data || []) as Array<{ created_at: string }>;
    const primaryCurrency = paymentCurrency(paymentRows);
    const payments30Days = paymentRows.filter((payment) => payment.created_at >= thirtyDayCutoff);
    const successfulPayments30Days = payments30Days.filter((payment) => payment.status === "succeeded");
    const activity = buildUtcDaySeries(activityDays);
    const activityByDay = new Map(activity.map((day) => [day.key, day]));

    for (const row of profileActivityRows) {
      addActivityCount(activityByDay, row.created_at, "users");
    }

    for (const row of listingActivityRows) {
      addActivityCount(activityByDay, row.created_at, "listings");
    }

    for (const row of ticketRows) {
      if (row.created_at >= activityCutoff) {
        addActivityCount(activityByDay, row.created_at, "tickets");
      }
    }

    for (const payment of paymentRows) {
      if (payment.created_at >= activityCutoff && payment.status === "succeeded") {
        addActivityCount(activityByDay, payment.created_at, "payments");
        addActivityRevenue(activityByDay, payment.created_at, payment.amount);
      }
    }

    return {
      metrics: {
        newUsers30Days: {
          label: "New users (30d)",
          value: users30Days,
          note: `${usersOverview.stats.pendingDealers} dealer applications pending`,
        },
        newListings30Days: {
          label: "New listings (30d)",
          value: listings30Days,
          note: `${listingsOverview.stats.pending} pending review`,
        },
        paymentVolume30Days: {
          label: "Payment volume (30d)",
          value: sumPaymentAmounts(successfulPayments30Days),
          note: `${successfulPayments30Days.length} successful payments`,
        },
        openTickets: {
          label: "Open tickets",
          value: openTickets,
          note: `${ticketRows.filter((ticket) => isOpenTicket(ticket.status) && ["high", "urgent"].includes(ticket.priority)).length} high priority`,
        },
      },
      activity,
      listingMix: [
        { label: "Active", value: listingsOverview.stats.active },
        { label: "Pending", value: listingsOverview.stats.pending },
        { label: "Sold", value: listingsOverview.stats.sold },
        { label: "Rejected", value: listingsOverview.stats.rejected },
      ],
      userMix: [
        { label: "Buyers", value: usersOverview.stats.buyers },
        { label: "Sellers", value: usersOverview.stats.sellers },
        { label: "Dealers", value: usersOverview.stats.dealers },
        { label: "Staff", value: usersOverview.stats.staff },
      ],
      paymentMix: buildPaymentBreakdown(paymentRows, "purpose", primaryCurrency).map((item) => ({
        label: item.label,
        value: item.count,
        amount: item.amount,
        note: `${item.count} transactions`,
      })),
      providerMix: buildPaymentBreakdown(paymentRows, "provider", primaryCurrency).map((item) => ({
        label: item.label,
        value: item.count,
        amount: item.amount,
        note: `${item.count} transactions`,
      })),
      supportMix: [
        { label: "Open", value: ticketRows.filter((ticket) => ticket.status === "open").length },
        { label: "Triaged", value: ticketRows.filter((ticket) => ticket.status === "triaged").length },
        {
          label: "Waiting on seller",
          value: ticketRows.filter((ticket) => ticket.status === "waiting_on_seller").length,
        },
        {
          label: "Waiting on buyer",
          value: ticketRows.filter((ticket) => ticket.status === "waiting_on_buyer").length,
        },
      ],
      primaryCurrency,
    };
  } catch (error) {
    console.warn(`Admin analytics unavailable: ${describeError(error)}`);
    return EMPTY_ADMIN_ANALYTICS_DATA;
  }
});
