import { cache } from "react";
import { createOptionalAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { filterAdminVisibleSupportTickets } from "@/lib/data/support-ticket-filters";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import type { AdReportPriority, AdReportStatus, AdReportTargetType } from "@/lib/types/ad-report";
import type { ListingStatus } from "@/lib/types/listing";

export type AdminProfileRole =
  | "buyer"
  | "seller"
  | "dealer"
  | "sales_agent"
  | "support"
  | "admin"
  | "super_admin";

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
  is_featured: boolean;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number | null;
  body_type: string | null;
  transmission: string | null;
  fuel_type: string | null;
  color: string | null;
  condition: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown> | null;
  images: Array<{ id: string; r2_key: string; alt_text: string | null; image_order: number }> | null;
  seller: Array<{ id: string; full_name: string | null; email: string | null }> | null;
  dealer: Array<{ id: string; name: string; city: string | null }> | null;
};

type TicketRow = {
  id: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "triaged" | "waiting_on_seller" | "waiting_on_buyer" | "resolved" | "closed";
  updated_at: string;
  assigned_to_profile: Array<{ full_name: string | null; email: string | null }> | null;
};

type UserListingCountRow = {
  seller_id: string;
  status: ListingStatus;
};

type PermissionRow = {
  key: string;
  label: string;
  description: string | null;
  category: string;
};

type RolePermissionRow = {
  role: AdminProfileRole;
  permission_key: string;
};

const ADMIN_STAFF_PROFILE_ROLES: AdminProfileRole[] = [
  "sales_agent",
  "support",
  "admin",
  "super_admin",
];

export type AdminDashboardMetric = {
  label: string;
  value: number;
  note?: string;
};

export type AdminDashboardListing = {
  id: string;
  title: string;
  subtitle: string | null;
  make: string;
  model: string;
  year: number;
  bodyType: string | null;
  mileage: number | null;
  transmission: string | null;
  fuelType: string | null;
  color: string | null;
  condition: string | null;
  description: string | null;
  coverImageKey: string | null;
  coverImageAlt: string | null;
  imageCount: number;
  sellerName: string;
  sellerEmail: string | null;
  sellerType: "Dealer" | "Private";
  dealerName: string | null;
  status: ListingStatus;
  isFeatured: boolean;
  price: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
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
  notice?: string | null;
  error?: string | null;
};

export type AdminUsersOverviewData = {
  stats: {
    total: number;
    buyers: number;
    sellers: number;
    dealers: number;
    salesAgents: number;
    admins: number;
    superAdmins: number;
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
    superAdmins: number;
    supports: number;
    staff: number;
    pendingDealers: number;
  };
  roles: AdminRoleSummary[];
  permissions: PermissionRow[];
  rolePermissions: Record<AdminProfileRole, string[]>;
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

type ListingReportRow = {
  id: string;
  target_type: AdReportTargetType;
  listing_id: string | null;
  dealer_id: string | null;
  reporter_name: string;
  reporter_phone: string;
  reporter_email: string;
  reporter_location: string;
  reason: string;
  reason_label: string;
  comments: string;
  priority: AdReportPriority;
  status: AdReportStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  reporter_profile: Array<{ id: string; full_name: string | null; email: string | null }> | null;
  listing: Array<{ id: string; make: string; model: string; year: number }> | null;
  dealer: Array<{ id: string; name: string }> | null;
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
  source: "support_ticket" | "ad_report";
  targetType: AdReportTargetType | null;
  subject: string;
  category: string;
  priority: ReportTicketRow["priority"] | AdReportPriority;
  status: ReportTicketRow["status"] | AdReportStatus;
  customerSummary: string | null;
  internalNote: string | null;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: string | null;
  createdBy: string | null;
  reporterPhone: string | null;
  reporterEmail: string | null;
  reporterLocation: string | null;
  adminNote: string | null;
  listingTitle: string | null;
  href: string;
};

export type AdminReportEvent = {
  id: string;
  ticketId: string;
  ticketSubject: string;
  ticketPriority: ReportTicketRow["priority"] | AdReportPriority | null;
  ticketStatus: ReportTicketRow["status"] | AdReportStatus | null;
  eventType: TicketEventRow["event_type"] | "ad_report_created";
  note: string | null;
  actorName: string;
  createdAt: string;
  href: string;
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
  notice: null,
  error: null,
};

const EMPTY_ADMIN_USERS_OVERVIEW_DATA: AdminUsersOverviewData = {
  stats: {
    total: 0,
    buyers: 0,
    sellers: 0,
    dealers: 0,
    salesAgents: 0,
    admins: 0,
    superAdmins: 0,
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
    superAdmins: 0,
    supports: 0,
    staff: 0,
    pendingDealers: 0,
  },
  roles: [],
  permissions: [],
  rolePermissions: {
    buyer: [],
    seller: [],
    dealer: [],
    sales_agent: [],
    support: [],
    admin: [],
    super_admin: [],
  },
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

async function createAdminDataClient() {
  return createOptionalAdminClient() ?? (await createClient());
}

export function getAdminDataAccessNotice() {
  return createOptionalAdminClient()
    ? null
    : "Admin data is using the signed-in admin session because SUPABASE_SERVICE_ROLE_KEY is not configured in this environment. If records are missing, set the service role key in Vercel staging or confirm the admin RLS migrations are applied.";
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] || null : value || null;
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
  const images = (listing.images || []).slice().sort((a, b) => a.image_order - b.image_order);
  const coverImage = images[0] || null;

  return {
    id: listing.id,
    title: buildListingTitle(listing),
    subtitle: buildListingSubtitle(listing),
    make: listing.make,
    model: listing.model,
    year: listing.year,
    bodyType: listing.body_type,
    mileage: listing.mileage,
    transmission: listing.transmission,
    fuelType: listing.fuel_type,
    color: listing.color,
    condition: listing.condition,
    description: listing.description,
    coverImageKey: coverImage?.r2_key || null,
    coverImageAlt: coverImage?.alt_text || null,
    imageCount: images.length,
    sellerName: seller?.full_name || dealer?.name || seller?.email || "Unknown seller",
    sellerEmail: seller?.email || null,
    sellerType: dealer ? "Dealer" : "Private",
    dealerName: dealer?.name || null,
    status: listing.status,
    isFeatured: Boolean(listing.is_featured),
    price: Number(listing.price || 0),
    currency: listing.currency,
    createdAt: listing.created_at,
    updatedAt: listing.updated_at,
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

function buildAdReportTargetTitle(report: ListingReportRow) {
  const listing = firstRelation(report.listing);
  if (listing) return buildCompactListingTitle(listing);

  const dealer = firstRelation(report.dealer);
  if (dealer) return dealer.name;

  return report.target_type === "dealer" ? "Dealer profile" : "Listing";
}

function buildAdReportHref(report: Pick<ListingReportRow, "target_type" | "listing_id" | "dealer_id">) {
  if (report.target_type === "dealer" && report.dealer_id) {
    return `/dealers/${report.dealer_id}`;
  }

  if (report.listing_id) {
    return `/vehicle/${report.listing_id}`;
  }

  return "/admin/reports";
}

function normalizeReportTicket(ticket: ReportTicketRow): AdminReportTicket {
  const assignee = firstRelation(ticket.assigned_to_profile);
  const creator = firstRelation(ticket.created_by_profile);
  const listing = firstRelation(ticket.listing);

  return {
    id: ticket.id,
    source: "support_ticket",
    targetType: null,
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
    reporterPhone: null,
    reporterEmail: null,
    reporterLocation: null,
    adminNote: ticket.internal_note,
    listingTitle: buildCompactListingTitle(listing || null),
    href: `/admin/car-inquiries?ticket=${ticket.id}`,
  };
}

function normalizeListingReport(report: ListingReportRow): AdminReportTicket {
  const reporterProfile = firstRelation(report.reporter_profile);
  const targetTitle = buildAdReportTargetTitle(report);
  const reporterName =
    report.reporter_name ||
    reporterProfile?.full_name ||
    reporterProfile?.email ||
    "Unknown reporter";

  return {
    id: report.id,
    source: "ad_report",
    targetType: report.target_type,
    subject: `${report.reason_label} • ${targetTitle}`,
    category: report.target_type === "dealer" ? "dealer_report" : "listing_report",
    priority: report.priority,
    status: report.status,
    customerSummary: report.comments,
    internalNote: [
      `Reporter: ${reporterName}`,
      `Phone: ${report.reporter_phone}`,
      `Email: ${report.reporter_email}`,
      `Location: ${report.reporter_location}`,
      report.admin_note ? `Admin note: ${report.admin_note}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    resolutionNote: null,
    createdAt: report.created_at,
    updatedAt: report.updated_at,
    assignedTo: null,
    createdBy: reporterName,
    reporterPhone: report.reporter_phone,
    reporterEmail: report.reporter_email,
    reporterLocation: report.reporter_location,
    adminNote: report.admin_note,
    listingTitle: targetTitle,
    href: buildAdReportHref(report),
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
    href: `/admin/car-inquiries?ticket=${event.ticket_id}`,
  };
}

function normalizeListingReportEvent(report: ListingReportRow): AdminReportEvent {
  const normalized = normalizeListingReport(report);

  return {
    id: `ad-report-${report.id}`,
    ticketId: report.id,
    ticketSubject: normalized.subject,
    ticketPriority: normalized.priority,
    ticketStatus: normalized.status,
    eventType: "ad_report_created",
    note: report.comments,
    actorName: normalized.createdBy || "Unknown reporter",
    createdAt: report.created_at,
    href: normalized.href,
  };
}

function isOpenTicket(
  status: ReportTicketRow["status"] | TicketRow["status"] | AdReportStatus
) {
  return (
    status === "open" ||
    status === "reviewing" ||
    status === "triaged" ||
    status === "waiting_on_seller" ||
    status === "waiting_on_buyer"
  );
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
    const supabase = await createAdminDataClient();

    const [
      pendingListings,
      pendingDealers,
      openTickets,
      urgentReports,
      urgentAdReportsResult,
      pendingPayments,
      insuranceCountResult,
    ] = await Promise.all([
      readCount(supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "pending")),
      readCount(supabase.from("dealers").select("*", { count: "exact", head: true }).eq("status", "PENDING")),
      readCount(
        supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .in("status", ["open", "triaged", "waiting_on_seller", "waiting_on_buyer"])
          .neq("category", "listing_enquiry")
          .neq("category", "public_listing_enquiry")
      ),
      readCount(
        supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .in("status", ["open", "triaged", "waiting_on_seller", "waiting_on_buyer"])
          .in("priority", ["high", "urgent"])
          .neq("category", "listing_enquiry")
          .neq("category", "public_listing_enquiry")
      ),
      supabase
        .from("listing_reports")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "reviewing"])
        .in("priority", ["high", "urgent"]),
      readCount(
        supabase
          .from("payments")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ),
      supabase
        .from("insurance_requests")
        .select("*", { count: "exact", head: true })
        .in("status", ["new", "quoted", "blocked"]),
    ]);

    let openInsuranceRequests = insuranceCountResult.count ?? 0;
    if (insuranceCountResult.error) {
      if (!isMissingRelationError(insuranceCountResult.error)) {
        throw new Error(insuranceCountResult.error.message);
      }

      const fallbackResult = await supabase
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .eq("category", "insurance_request")
        .in("status", ["open", "triaged", "waiting_on_seller", "waiting_on_buyer"]);

      if (fallbackResult.error) {
        throw new Error(fallbackResult.error.message);
      }

      openInsuranceRequests = fallbackResult.count ?? 0;
    }

    let urgentAdReports = urgentAdReportsResult.count ?? 0;
    if (urgentAdReportsResult.error) {
      if (!isMissingRelationError(urgentAdReportsResult.error)) {
        throw new Error(urgentAdReportsResult.error.message);
      }

      urgentAdReports = 0;
    }

    return {
      "/admin/review": pendingListings || undefined,
      "/admin/reports": urgentReports + urgentAdReports || undefined,
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
    const supabase = await createAdminDataClient();

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
      readCount(supabase.from("listings").select("*", { count: "exact", head: true })),
      readCount(supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "pending")),
      readCount(supabase.from("profiles").select("*", { count: "exact", head: true })),
      readCount(
        supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .in("status", ["open", "triaged", "waiting_on_seller", "waiting_on_buyer"])
          .neq("category", "listing_enquiry")
          .neq("category", "public_listing_enquiry")
      ),
      supabase
        .from("listings")
        .select(
          `
            id,
            status,
            is_featured,
            make,
            model,
            year,
            price,
            currency,
            mileage,
            body_type,
            transmission,
            fuel_type,
            color,
            condition,
            description,
            created_at,
            updated_at,
            metadata,
            images:listing_images(id, r2_key, alt_text, image_order),
            seller:profiles!seller_id(id, full_name, email),
            dealer:dealers(id, name, city)
          `
        )
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("dealers")
        .select("id, profile_id, name, status, city, created_at, profile:profiles!profile_id(full_name, email)")
        .order("created_at", { ascending: false }),
      supabase.from("listings").select("seller_id, status"),
      supabase
        .from("support_tickets")
        .select(
          `
            id,
            subject,
            category,
            priority,
            status,
            updated_at,
            assigned_to_profile:profiles!assigned_to(full_name, email)
          `
        )
        .order("updated_at", { ascending: false })
        .limit(6),
      supabase
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
      recentTickets: filterAdminVisibleSupportTickets(
        (recentTicketsResult.data || []) as unknown as TicketRow[]
      ).map(normalizeTicket),
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
      const supabase = adminSupabase ?? (await createClient());

      const statuses: ListingStatus[] = ["draft", "pending", "active", "reserved", "rejected", "sold", "expired"];

      const countResults = await Promise.all(
        statuses.map(async (status) => {
          const { count, error } = await supabase
            .from("listings")
            .select("*", { count: "exact", head: true })
            .eq("status", status);

          if (error) {
            throw new Error(`Unable to count ${status} listings: ${error.message}`);
          }

          return count ?? 0;
        })
      );

      const { data, error: listingsError } = await supabase
        .from("listings")
        .select(
          `
            id,
            status,
            is_featured,
            make,
            model,
            year,
            price,
            currency,
            mileage,
            body_type,
            transmission,
            fuel_type,
            color,
            condition,
            description,
            created_at,
            updated_at,
            metadata,
            images:listing_images(id, r2_key, alt_text, image_order),
            seller:profiles!seller_id(id, full_name, email),
            dealer:dealers(id, name, city)
          `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (listingsError) {
        throw new Error(`Unable to load listings: ${listingsError.message}`);
      }

      return {
        stats: Object.fromEntries(statuses.map((status, index) => [status, countResults[index]])) as Record<
          ListingStatus,
          number
        >,
        total: countResults.reduce((sum, count) => sum + count, 0),
        listings: ((data || []) as unknown as ListingRow[]).map(normalizeListing),
        notice: null,
        error: null,
      };
    } catch (error) {
      const message = describeError(error);
      console.warn(`Admin listings unavailable: ${message}`);
      return {
        ...EMPTY_ADMIN_LISTINGS_OVERVIEW_DATA,
        error: message,
      };
    }
  }
);

export const getAdminUsersOverviewData = cache(async (limit = 80): Promise<AdminUsersOverviewData> => {
  try {
    const supabase = await createAdminDataClient();

    const [
      total,
      buyers,
      sellers,
      dealers,
      salesAgents,
      admins,
      superAdmins,
      supports,
      pendingDealers,
      profilesResult,
    ] = await Promise.all([
      readCount(supabase.from("profiles").select("*", { count: "exact", head: true })),
      readCount(supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "buyer")),
      readCount(supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "seller")),
      readCount(supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "dealer")),
      readCount(supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "sales_agent")),
      readCount(supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin")),
      readCount(supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "super_admin")),
      readCount(supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "support")),
      readCount(supabase.from("dealers").select("*", { count: "exact", head: true }).eq("status", "PENDING")),
      supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at")
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

    const profiles = (profilesResult.data || []) as ProfileRow[];
    const profileIds = profiles.map((profile) => profile.id);

    const [dealerRowsResult, listingCountRowsResult] = await Promise.all([
      profileIds.length > 0
        ? supabase
            .from("dealers")
            .select("id, profile_id, name, status, city, created_at, profile:profiles!profile_id(full_name, email)")
            .in("profile_id", profileIds)
        : Promise.resolve({ data: [] }),
      profileIds.length > 0
        ? supabase.from("listings").select("seller_id, status").in("seller_id", profileIds)
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
        salesAgents,
        admins,
        superAdmins,
        supports,
        staff: admins + superAdmins + supports + salesAgents,
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
    const supabase = await createAdminDataClient();

    const [usersOverview, staffProfilesResult, permissionsResult, rolePermissionsResult] = await Promise.all([
      getAdminUsersOverviewData(limit),
      supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at")
        .in("role", ADMIN_STAFF_PROFILE_ROLES)
        .order("role", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase.from("permissions").select("key, label, description, category").order("category").order("key"),
      supabase.from("role_permissions").select("role, permission_key").order("role").order("permission_key"),
    ]);

    if (staffProfilesResult.error) {
      throw new Error(`Unable to load staff profiles: ${staffProfilesResult.error.message}`);
    }

    const rolePermissions: Record<AdminProfileRole, string[]> = {
      buyer: [],
      seller: [],
      dealer: [],
      sales_agent: [],
      support: [],
      admin: [],
      super_admin: [],
    };

    for (const row of (rolePermissionsResult.data || []) as RolePermissionRow[]) {
      if (row.role in rolePermissions) {
        rolePermissions[row.role].push(row.permission_key);
      }
    }

    const emptyDealerMap = new Map<string, DealerRow>();
    const emptyListingCountMap = new Map<string, { total: number; active: number }>();

    return {
      stats: {
        total: usersOverview.stats.total,
        admins: usersOverview.stats.admins,
        superAdmins: usersOverview.stats.superAdmins,
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
          key: "sales_agent",
          label: "Sales Agent",
          description: "Dealer-invited sales rep account linked to a dealership.",
          count: usersOverview.stats.salesAgents,
          tone: "blue",
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
        {
          key: "super_admin",
          label: "Super Admin",
          description: "Owner-level access to roles, permissions, provider settings, and all admin tools.",
          count: usersOverview.stats.superAdmins,
          tone: "red",
        },
      ],
      permissions: ((permissionsResult.data || []) as PermissionRow[]),
      rolePermissions,
      users: ((staffProfilesResult.data || []) as ProfileRow[]).map((profile) =>
        normalizeUser(profile, emptyDealerMap, emptyListingCountMap)
      ),
    };
  } catch (error) {
    console.warn(`Admin roles unavailable: ${describeError(error)}`);
    return EMPTY_ADMIN_ROLES_PERMISSIONS_DATA;
  }
});

export const getAdminAuditLogsData = cache(async (limit = 80): Promise<AdminAuditLogsData> => {
  try {
    const supabase = await createAdminDataClient();

    const last24HoursCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [total, last24Hours, dealerEvents, listingEvents, logsResult] = await Promise.all([
      readCount(supabase.from("audit_logs").select("*", { count: "exact", head: true })),
      readCount(
        supabase
          .from("audit_logs")
          .select("*", { count: "exact", head: true })
          .gte("created_at", last24HoursCutoff)
      ),
      readCount(
        supabase
          .from("audit_logs")
          .select("*", { count: "exact", head: true })
          .eq("entity_type", "dealer")
      ),
      readCount(
        supabase
          .from("audit_logs")
          .select("*", { count: "exact", head: true })
          .eq("entity_type", "listing")
      ),
      supabase
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
    const supabase = await createAdminDataClient();

    const [paymentsResult, paymentSummaryResult] = await Promise.all([
      supabase
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
      supabase
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
      ? await supabase
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
      const supabase = await createAdminDataClient();

      const [ticketsResult, eventsResult, listingReportsResult] = await Promise.all([
        supabase
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
        supabase
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
        supabase
          .from("listing_reports")
          .select(
            `
              id,
              target_type,
              listing_id,
              dealer_id,
              reporter_name,
              reporter_phone,
              reporter_email,
              reporter_location,
              reason,
              reason_label,
              comments,
              priority,
              status,
              admin_note,
              created_at,
              updated_at,
              reporter_profile:profiles!reporter_profile_id(id, full_name, email),
              listing:listings(id, make, model, year),
              dealer:dealers(id, name)
            `
          )
          .order("updated_at", { ascending: false })
          .limit(ticketLimit),
      ]);

      const today = new Date().toISOString().slice(0, 10);
      let listingReports: AdminReportTicket[] = [];
      let listingReportEvents: AdminReportEvent[] = [];

      if (listingReportsResult.error) {
        if (!isMissingRelationError(listingReportsResult.error)) {
          throw new Error(listingReportsResult.error.message);
        }
      } else {
        const reportRows = (listingReportsResult.data || []) as unknown as ListingReportRow[];
        listingReports = reportRows.map(normalizeListingReport);
        listingReportEvents = reportRows.slice(0, eventLimit).map(normalizeListingReportEvent);
      }

      const supportTickets = filterAdminVisibleSupportTickets(
        (ticketsResult.data || []) as unknown as ReportTicketRow[]
      ).map(normalizeReportTicket);
      const tickets = [...listingReports, ...supportTickets]
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        .slice(0, ticketLimit);
      const ticketById = new Map(tickets.map((ticket) => [ticket.id, ticket]));
      const supportEvents = ((eventsResult.data || []) as unknown as TicketEventRow[])
        .filter((event) => ticketById.has(event.ticket_id))
        .map((event) => normalizeReportEvent(event, ticketById));

      return {
        stats: {
          open: tickets.filter((ticket) => isOpenTicket(ticket.status)).length,
          highPriority: tickets.filter(
            (ticket) => isOpenTicket(ticket.status) && ["high", "urgent"].includes(ticket.priority)
          ).length,
          resolvedToday: tickets.filter(
            (ticket) =>
              ["resolved", "closed", "dismissed"].includes(ticket.status) &&
              ticket.updatedAt.slice(0, 10) === today
          ).length,
          unassigned: tickets.filter((ticket) => isOpenTicket(ticket.status) && !ticket.assignedTo).length,
        },
        tickets,
        recentEvents: [...listingReportEvents, ...supportEvents]
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
          .slice(0, eventLimit),
      };
    } catch (error) {
      console.warn(`Admin reports unavailable: ${describeError(error)}`);
      return EMPTY_ADMIN_REPORTS_DATA;
    }
  }
);

export const getAdminAnalyticsData = cache(async (): Promise<AdminAnalyticsData> => {
  try {
    const supabase = await createAdminDataClient();

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
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDayCutoff)
      ),
      readCount(
        supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDayCutoff)
      ),
      readCount(
        supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .in("status", ["open", "triaged", "waiting_on_seller", "waiting_on_buyer"])
          .neq("category", "listing_enquiry")
          .neq("category", "public_listing_enquiry")
      ),
      supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", activityCutoff),
      supabase
        .from("listings")
        .select("created_at")
        .gte("created_at", activityCutoff),
      supabase
        .from("support_tickets")
        .select("created_at, status, priority, category"),
      supabase
        .from("payments")
        .select("amount, currency, status, purpose, provider, created_at"),
      getAdminListingsOverviewData(0),
      getAdminUsersOverviewData(0),
    ]);

    const paymentRows = (paymentSummaryResult.data || []) as unknown as PaymentRow[];
    const ticketRows = filterAdminVisibleSupportTickets((ticketSummaryResult.data || []) as Array<{
      created_at: string;
      status: ReportTicketRow["status"];
      priority: ReportTicketRow["priority"];
      category: string;
    }>);
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
