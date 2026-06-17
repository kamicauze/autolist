import { cache } from "react";
import { createOptionalAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isMissingColumnError, isMissingRelationError } from "@/lib/supabase/error-utils";
import type { AdminProfileRole } from "@/lib/data/admin";
import {
  sortAdminUserActivityTimeline,
  summarizeAdminUserActivity,
  type AdminUserActivityItem,
  type AdminUserActivitySummaryItem,
} from "@/lib/data/admin-user-activity";
import type { ListingStatus } from "@/lib/types/listing";

type QueryError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

type QueryResult<T> = PromiseLike<{
  data: T[] | null;
  error: QueryError | null;
}>;

type ProfileDetailRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AdminProfileRole;
  avatar_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  bio: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  deactivated_at: string | null;
  created_at: string;
  updated_at: string | null;
};

type DealerDetailRow = {
  id: string;
  profile_id: string;
  name: string;
  business_name: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  address: string | null;
  city: string | null;
  location: string | null;
  mobile: string | null;
  email: string | null;
  whatsapp: string | null;
  website: string | null;
  about_text: string | null;
  contact_person: Record<string, unknown> | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  review_notes: string | null;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
};

type DealerDetailQueryRow = Omit<
  DealerDetailRow,
  | "submitted_at"
  | "reviewed_at"
  | "verified_at"
  | "rejection_reason"
  | "review_notes"
  | "verification_notes"
> &
  Partial<
    Pick<
      DealerDetailRow,
      | "submitted_at"
      | "reviewed_at"
      | "verified_at"
      | "rejection_reason"
      | "review_notes"
      | "verification_notes"
    >
  >;

type DealerDocumentRow = {
  id: string;
  document_type: string;
  display_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

type ListingRelationRow = {
  id: string;
  name: string;
  profile_id?: string;
} | null;

type ProfileRelationRow = {
  id: string;
  full_name: string | null;
  email: string | null;
} | null;

type ListingDetailRow = {
  id: string;
  seller_id: string;
  dealer_id: string | null;
  status: ListingStatus;
  is_featured: boolean;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number | null;
  body_type: string | null;
  condition: string | null;
  created_at: string;
  updated_at: string;
  dealer: ListingRelationRow[] | ListingRelationRow;
};

type EnquiryRow = {
  id: string;
  listing_id: string;
  user_id: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  listing:
    | Array<{
        id: string;
        make: string;
        model: string;
        year: number;
        seller_id: string;
        dealer_id: string | null;
        seller: ProfileRelationRow[] | ProfileRelationRow;
        dealer: ListingRelationRow[] | ListingRelationRow;
      }>
    | {
        id: string;
        make: string;
        model: string;
        year: number;
        seller_id: string;
        dealer_id: string | null;
        seller: ProfileRelationRow[] | ProfileRelationRow;
        dealer: ListingRelationRow[] | ListingRelationRow;
      }
    | null;
};

type ConversationThreadRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  dealer_id: string | null;
  status: string;
  source: string;
  subject: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  created_at: string;
  updated_at: string;
  buyer: ProfileRelationRow[] | ProfileRelationRow;
  seller: ProfileRelationRow[] | ProfileRelationRow;
  listing: Array<{ id: string; make: string; model: string; year: number | null }> | { id: string; make: string; model: string; year: number | null } | null;
};

type ConversationMessageRow = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  visibility: string;
  message_type: string;
  created_at: string;
  sender: ProfileRelationRow[] | ProfileRelationRow;
};

type SupportTicketRow = {
  id: string;
  thread_id: string | null;
  listing_id: string | null;
  created_by: string;
  assigned_to: string | null;
  subject: string;
  category: string;
  priority: string;
  status: string;
  customer_summary: string | null;
  internal_note: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
};

type PaymentDetailRow = {
  id: string;
  reference: string;
  provider: "stripe" | "mpesa" | "manual";
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  purpose: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type FavoriteRow = {
  id: string;
  listing_id: string;
  created_at: string;
  listing: Array<{ id: string; make: string; model: string; year: number | null }> | { id: string; make: string; model: string; year: number | null } | null;
};

type ReviewRow = {
  id: string;
  listing_id: string;
  reviewer_id: string;
  seller_id: string;
  rating: number;
  body: string;
  created_at: string;
  updated_at: string;
  listing: Array<{ id: string; make: string; model: string; year: number | null }> | { id: string; make: string; model: string; year: number | null } | null;
};

type OfferRow = {
  id: string;
  listing_id: string;
  seller_id: string;
  dealer_id: string;
  dealer_profile_id: string;
  amount: number;
  currency: string;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  listing: Array<{ id: string; make: string; model: string; year: number | null }> | { id: string; make: string; model: string; year: number | null } | null;
  dealer: Array<{ id: string; name: string }> | { id: string; name: string } | null;
};

type AuditLogDetailRow = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

type EntitlementRow = {
  id: string;
  plan_id: string;
  status: string;
  listing_limit: number | null;
  starts_at: string;
  ends_at: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminUserActivityData = {
  profile: ProfileDetailRow | null;
  dealer: DealerDetailRow | null;
  dealerDocuments: DealerDocumentRow[];
  summary: AdminUserActivitySummaryItem[];
  timeline: AdminUserActivityItem[];
  listings: ListingDetailRow[];
  sentEnquiries: EnquiryRow[];
  receivedEnquiries: EnquiryRow[];
  conversations: ConversationThreadRow[];
  messages: ConversationMessageRow[];
  supportTickets: SupportTicketRow[];
  payments: PaymentDetailRow[];
  favorites: FavoriteRow[];
  reviewsWritten: ReviewRow[];
  reviewsReceived: ReviewRow[];
  offersMade: OfferRow[];
  offersReceived: OfferRow[];
  entitlements: EntitlementRow[];
  auditLogs: AuditLogDetailRow[];
  errors: string[];
};

const DEALER_DETAIL_SELECT = `
  id,
  profile_id,
  name,
  business_name,
  status,
  address,
  city,
  location,
  mobile,
  email,
  whatsapp,
  website,
  about_text,
  contact_person,
  submitted_at,
  reviewed_at,
  verified_at,
  rejection_reason,
  review_notes,
  verification_notes,
  created_at,
  updated_at
`;

const DEALER_DETAIL_LEGACY_SELECT = `
  id,
  profile_id,
  name,
  business_name,
  status,
  address,
  city,
  location,
  mobile,
  email,
  whatsapp,
  website,
  about_text,
  contact_person,
  created_at,
  updated_at
`;

async function createAdminDetailClient() {
  return createOptionalAdminClient() ?? (await createClient());
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

function compactListingTitle(
  listing: { year: number | null; make: string; model: string } | null | undefined
) {
  if (!listing) return "Unknown listing";
  return [listing.year, listing.make, listing.model].filter(Boolean).join(" ");
}

function truncate(value: string | null | undefined, maxLength = 160) {
  const normalized = (value || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized || null;
  return `${normalized.slice(0, maxLength - 1)}...`;
}

function readMetadataString(metadata: Record<string, unknown> | null, key: string) {
  const value = metadata && key in metadata ? metadata[key] : null;
  if (value == null) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

async function readRows<T>(
  query: QueryResult<T>,
  label: string,
  errors: string[],
  optional = false
) {
  const { data, error } = await query;

  if (error) {
    if (shouldIgnoreOptionalMissingHistoryError(error, optional)) {
      return [];
    }

    errors.push(`${label}: ${error.message || "Unable to load records."}`);
    return [];
  }

  return data || [];
}

export function shouldIgnoreOptionalMissingHistoryError(
  error: QueryError | null | undefined,
  optional: boolean
) {
  return optional && isMissingRelationError(error);
}

export function isMissingDealerDetailWorkflowColumn(error: QueryError | null | undefined) {
  if (!isMissingColumnError(error)) return false;

  return [
    "submitted_at",
    "reviewed_at",
    "verified_at",
    "rejection_reason",
    "review_notes",
    "verification_notes",
  ].some((column) =>
    [error?.message, error?.details, error?.hint].some((part) => part?.includes(column))
  );
}

export function normalizeAdminDealerDetailRow(
  row: DealerDetailQueryRow | null | undefined
): DealerDetailRow | null {
  if (!row) return null;

  return {
    ...row,
    submitted_at: row.submitted_at ?? null,
    reviewed_at: row.reviewed_at ?? null,
    verified_at: row.verified_at ?? null,
    rejection_reason: row.rejection_reason ?? null,
    review_notes: row.review_notes ?? null,
    verification_notes: row.verification_notes ?? null,
  };
}

function mergeById<T extends { id: string }>(...groups: T[][]) {
  return Array.from(
    groups.flat().reduce((items, item) => items.set(item.id, item), new Map<string, T>()).values()
  );
}

function listingTitle(listing: ListingDetailRow) {
  return compactListingTitle(listing);
}

function enquiryListing(enquiry: EnquiryRow) {
  return firstRelation(enquiry.listing);
}

function addTimelineItem(items: AdminUserActivityItem[], item: AdminUserActivityItem) {
  if (!item.occurredAt) return;
  items.push(item);
}

export const getAdminUserActivityData = cache(
  async (profileId: string): Promise<AdminUserActivityData> => {
    const errors: string[] = [];
    const supabase = await createAdminDetailClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, email, full_name, role, avatar_url, phone, whatsapp, bio, city, address, website, deactivated_at, created_at, updated_at"
      )
      .eq("id", profileId)
      .maybeSingle<ProfileDetailRow>();

    if (profileError) {
      errors.push(`Profile: ${profileError.message}`);
    }

    if (!profile) {
      return {
        profile: null,
        dealer: null,
        dealerDocuments: [],
        summary: summarizeAdminUserActivity({
          listings: 0,
          activeListings: 0,
          sentEnquiries: 0,
          receivedEnquiries: 0,
          conversations: 0,
          supportTickets: 0,
          payments: 0,
          favorites: 0,
          reviewsWritten: 0,
          reviewsReceived: 0,
          offersMade: 0,
          offersReceived: 0,
        }),
        timeline: [],
        listings: [],
        sentEnquiries: [],
        receivedEnquiries: [],
        conversations: [],
        messages: [],
        supportTickets: [],
        payments: [],
        favorites: [],
        reviewsWritten: [],
        reviewsReceived: [],
        offersMade: [],
        offersReceived: [],
        entitlements: [],
        auditLogs: [],
        errors,
      };
    }

    let { data: dealerRow, error: dealerError } = await supabase
      .from("dealers")
      .select(DEALER_DETAIL_SELECT)
      .eq("profile_id", profileId)
      .maybeSingle<DealerDetailQueryRow>();

    if (dealerError && isMissingDealerDetailWorkflowColumn(dealerError)) {
      const fallback = await supabase
        .from("dealers")
        .select(DEALER_DETAIL_LEGACY_SELECT)
        .eq("profile_id", profileId)
        .maybeSingle<DealerDetailQueryRow>();

      dealerRow = fallback.data;
      dealerError = fallback.error;
    }

    if (dealerError) {
      errors.push(`Dealer profile: ${dealerError.message}`);
    }

    const dealer = normalizeAdminDealerDetailRow(dealerRow);

    const listings = await readRows<ListingDetailRow>(
      supabase
        .from("listings")
        .select(
          `
            id,
            seller_id,
            dealer_id,
            status,
            is_featured,
            make,
            model,
            year,
            price,
            currency,
            mileage,
            body_type,
            condition,
            created_at,
            updated_at,
            dealer:dealers(id, name, profile_id)
          `
        )
        .eq("seller_id", profileId)
        .order("created_at", { ascending: false }),
      "Listings",
      errors
    );

    const listingIds = listings.map((listing) => listing.id);

    const [
      dealerDocuments,
      sentEnquiries,
      receivedEnquiries,
      conversations,
      payments,
      favorites,
      reviewsWritten,
      reviewsReceived,
      offersMade,
      offersReceived,
      entitlements,
      userAuditLogs,
    ] = await Promise.all([
      dealer
        ? readRows<DealerDocumentRow>(
            supabase
              .from("dealer_verification_documents")
              .select("id, document_type, display_name, mime_type, size_bytes, created_at")
              .eq("dealer_id", dealer.id)
              .order("created_at", { ascending: false }),
            "Dealer documents",
            errors,
            true
          )
        : Promise.resolve([]),
      readRows<EnquiryRow>(
        supabase
          .from("enquiries")
          .select(
            `
              id,
              listing_id,
              user_id,
              message,
              status,
              created_at,
              updated_at,
              listing:listings!listing_id(
                id,
                make,
                model,
                year,
                seller_id,
                dealer_id,
                seller:profiles!seller_id(id, full_name, email),
                dealer:dealers(id, name, profile_id)
              )
            `
          )
          .eq("user_id", profileId)
          .order("created_at", { ascending: false }),
        "Sent enquiries",
        errors
      ),
      listingIds.length > 0
        ? readRows<EnquiryRow>(
            supabase
              .from("enquiries")
              .select(
                `
                  id,
                  listing_id,
                  user_id,
                  message,
                  status,
                  created_at,
                  updated_at,
                  listing:listings!listing_id(
                    id,
                    make,
                    model,
                    year,
                    seller_id,
                    dealer_id,
                    seller:profiles!seller_id(id, full_name, email),
                    dealer:dealers(id, name, profile_id)
                  )
                `
              )
              .in("listing_id", listingIds)
              .order("created_at", { ascending: false }),
            "Received enquiries",
            errors
          )
        : Promise.resolve([]),
      readRows<ConversationThreadRow>(
        supabase
          .from("conversation_threads")
          .select(
            `
              id,
              listing_id,
              buyer_id,
              seller_id,
              dealer_id,
              status,
              source,
              subject,
              last_message_at,
              last_message_preview,
              created_at,
              updated_at,
              buyer:profiles!buyer_id(id, full_name, email),
              seller:profiles!seller_id(id, full_name, email),
              listing:listings(id, make, model, year)
            `
          )
          .or(
            dealer
              ? `buyer_id.eq.${profileId},seller_id.eq.${profileId},created_by.eq.${profileId},dealer_id.eq.${dealer.id}`
              : `buyer_id.eq.${profileId},seller_id.eq.${profileId},created_by.eq.${profileId}`
          )
          .order("last_message_at", { ascending: false }),
        "Conversations",
        errors,
        true
      ),
      readRows<PaymentDetailRow>(
        supabase
          .from("payments")
          .select("id, reference, provider, amount, currency, status, purpose, metadata, created_at")
          .eq("user_id", profileId)
          .order("created_at", { ascending: false }),
        "Payments",
        errors
      ),
      readRows<FavoriteRow>(
        supabase
          .from("wishlists")
          .select("id, listing_id, created_at, listing:listings(id, make, model, year)")
          .eq("user_id", profileId)
          .order("created_at", { ascending: false }),
        "Favorites",
        errors
      ),
      readRows<ReviewRow>(
        supabase
          .from("listing_reviews")
          .select("id, listing_id, reviewer_id, seller_id, rating, body, created_at, updated_at, listing:listings(id, make, model, year)")
          .eq("reviewer_id", profileId)
          .order("created_at", { ascending: false }),
        "Reviews written",
        errors,
        true
      ),
      readRows<ReviewRow>(
        supabase
          .from("listing_reviews")
          .select("id, listing_id, reviewer_id, seller_id, rating, body, created_at, updated_at, listing:listings(id, make, model, year)")
          .eq("seller_id", profileId)
          .order("created_at", { ascending: false }),
        "Reviews received",
        errors,
        true
      ),
      readRows<OfferRow>(
        supabase
          .from("listing_offers")
          .select("id, listing_id, seller_id, dealer_id, dealer_profile_id, amount, currency, message, status, created_at, updated_at, listing:listings(id, make, model, year), dealer:dealers(id, name)")
          .eq("dealer_profile_id", profileId)
          .order("created_at", { ascending: false }),
        "Offers made",
        errors,
        true
      ),
      readRows<OfferRow>(
        supabase
          .from("listing_offers")
          .select("id, listing_id, seller_id, dealer_id, dealer_profile_id, amount, currency, message, status, created_at, updated_at, listing:listings(id, make, model, year), dealer:dealers(id, name)")
          .eq("seller_id", profileId)
          .order("created_at", { ascending: false }),
        "Offers received",
        errors,
        true
      ),
      readRows<EntitlementRow>(
        supabase
          .from("seller_package_entitlements")
          .select("id, plan_id, status, listing_limit, starts_at, ends_at, auto_renew, created_at, updated_at")
          .eq("user_id", profileId)
          .order("created_at", { ascending: false }),
        "Membership entitlements",
        errors,
        true
      ),
      readRows<AuditLogDetailRow>(
        supabase
          .from("audit_logs")
          .select("id, user_id, action, entity_type, entity_id, details, created_at")
          .eq("user_id", profileId)
          .order("created_at", { ascending: false })
          .limit(80),
        "Audit logs",
        errors
      ),
    ]);

    const threadIds = conversations.map((thread) => thread.id);
    const messages =
      threadIds.length > 0
        ? await readRows<ConversationMessageRow>(
            supabase
              .from("conversation_messages")
              .select(
                "id, thread_id, sender_id, body, visibility, message_type, created_at, sender:profiles!sender_id(id, full_name, email)"
              )
              .in("thread_id", threadIds)
              .order("created_at", { ascending: false })
              .limit(120),
            "Conversation messages",
            errors,
            true
          )
        : [];

    const [ticketsByUser, ticketsByThread, ticketsByListing, auditLogsByEntity] = await Promise.all([
      readRows<SupportTicketRow>(
        supabase
          .from("support_tickets")
          .select(
            "id, thread_id, listing_id, created_by, assigned_to, subject, category, priority, status, customer_summary, internal_note, resolution_note, created_at, updated_at"
          )
          .or(`created_by.eq.${profileId},assigned_to.eq.${profileId}`)
          .order("updated_at", { ascending: false }),
        "Support tickets",
        errors,
        true
      ),
      threadIds.length > 0
        ? readRows<SupportTicketRow>(
            supabase
              .from("support_tickets")
              .select(
                "id, thread_id, listing_id, created_by, assigned_to, subject, category, priority, status, customer_summary, internal_note, resolution_note, created_at, updated_at"
              )
              .in("thread_id", threadIds)
              .order("updated_at", { ascending: false }),
            "Support tickets by conversation",
            errors,
            true
          )
        : Promise.resolve([]),
      listingIds.length > 0
        ? readRows<SupportTicketRow>(
            supabase
              .from("support_tickets")
              .select(
                "id, thread_id, listing_id, created_by, assigned_to, subject, category, priority, status, customer_summary, internal_note, resolution_note, created_at, updated_at"
              )
              .in("listing_id", listingIds)
              .order("updated_at", { ascending: false }),
            "Support tickets by listing",
            errors,
            true
          )
        : Promise.resolve([]),
      [...listingIds, dealer?.id].filter(Boolean).length > 0
        ? readRows<AuditLogDetailRow>(
            supabase
              .from("audit_logs")
              .select("id, user_id, action, entity_type, entity_id, details, created_at")
              .in("entity_id", [...listingIds, dealer?.id].filter(Boolean) as string[])
              .order("created_at", { ascending: false })
              .limit(80),
            "Audit logs by entity",
            errors
          )
        : Promise.resolve([]),
    ]);

    const supportTickets = mergeById(ticketsByUser, ticketsByThread, ticketsByListing).sort(
      (left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
    );
    const auditLogs = mergeById(userAuditLogs, auditLogsByEntity).sort(
      (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    );

    const timeline: AdminUserActivityItem[] = [];

    addTimelineItem(timeline, {
      id: `profile-${profile.id}`,
      source: "profile",
      title: "Account created",
      detail: `${profile.role} profile${profile.email ? ` / ${profile.email}` : ""}`,
      occurredAt: profile.created_at,
      href: null,
    });

    if (dealer) {
      addTimelineItem(timeline, {
        id: `dealer-${dealer.id}`,
        source: "dealer",
        title: `Dealer profile ${dealer.status.toLowerCase()}`,
        detail: [dealer.name, dealer.business_name, dealer.city].filter(Boolean).join(" / ") || null,
        occurredAt: dealer.updated_at || dealer.created_at,
        href: "/admin/verification",
      });
    }

    for (const listing of listings) {
      addTimelineItem(timeline, {
        id: `listing-${listing.id}`,
        source: "listing",
        title: `Listing ${listing.status}: ${listingTitle(listing)}`,
        detail: `${listing.currency} ${Number(listing.price || 0).toLocaleString("en-KE")}`,
        occurredAt: listing.created_at,
        href: `/vehicle/${listing.id}`,
      });
    }

    for (const enquiry of sentEnquiries) {
      const listing = enquiryListing(enquiry);
      addTimelineItem(timeline, {
        id: `sent-enquiry-${enquiry.id}`,
        source: "enquiry_sent",
        title: `Sent enquiry on ${compactListingTitle(listing)}`,
        detail: truncate(enquiry.message),
        occurredAt: enquiry.created_at,
        href: "/admin/car-inquiries",
      });
    }

    for (const enquiry of receivedEnquiries) {
      const listing = enquiryListing(enquiry);
      addTimelineItem(timeline, {
        id: `received-enquiry-${enquiry.id}`,
        source: "enquiry_received",
        title: `Received enquiry on ${compactListingTitle(listing)}`,
        detail: truncate(enquiry.message),
        occurredAt: enquiry.created_at,
        href: "/admin/car-inquiries",
      });
    }

    for (const thread of conversations) {
      const listing = firstRelation(thread.listing);
      addTimelineItem(timeline, {
        id: `conversation-${thread.id}`,
        source: "conversation",
        title: `Conversation ${thread.status}: ${compactListingTitle(listing)}`,
        detail: truncate(thread.last_message_preview || thread.subject),
        occurredAt: thread.last_message_at,
        href: "/admin/car-inquiries",
      });
    }

    for (const message of messages) {
      const sender = firstRelation(message.sender);
      addTimelineItem(timeline, {
        id: `message-${message.id}`,
        source: "message",
        title: `${sender?.full_name || sender?.email || "User"} sent a ${message.message_type} message`,
        detail: truncate(message.body),
        occurredAt: message.created_at,
        href: "/admin/car-inquiries",
      });
    }

    for (const ticket of supportTickets) {
      addTimelineItem(timeline, {
        id: `ticket-${ticket.id}`,
        source: "support_ticket",
        title: `Support ticket ${ticket.status}: ${ticket.subject}`,
        detail: truncate(ticket.customer_summary || ticket.internal_note || ticket.resolution_note),
        occurredAt: ticket.updated_at,
        href: "/admin/reports",
      });
    }

    for (const payment of payments) {
      addTimelineItem(timeline, {
        id: `payment-${payment.id}`,
        source: "payment",
        title: `Payment ${payment.status}: ${payment.purpose.replace(/_/g, " ")}`,
        detail:
          readMetadataString(payment.metadata, "note") ||
          `${payment.currency} ${Number(payment.amount || 0).toLocaleString("en-KE")} via ${payment.provider}`,
        occurredAt: payment.created_at,
        href: "/admin/payments",
      });
    }

    for (const favorite of favorites) {
      addTimelineItem(timeline, {
        id: `favorite-${favorite.id}`,
        source: "favorite",
        title: `Saved ${compactListingTitle(firstRelation(favorite.listing))}`,
        detail: null,
        occurredAt: favorite.created_at,
        href: favorite.listing_id ? `/vehicle/${favorite.listing_id}` : null,
      });
    }

    for (const review of [...reviewsWritten, ...reviewsReceived]) {
      addTimelineItem(timeline, {
        id: `review-${review.id}-${review.reviewer_id === profileId ? "written" : "received"}`,
        source: "review",
        title:
          review.reviewer_id === profileId
            ? `Wrote ${review.rating}-star review`
            : `Received ${review.rating}-star review`,
        detail: truncate(review.body),
        occurredAt: review.created_at,
        href: review.listing_id ? `/vehicle/${review.listing_id}` : null,
      });
    }

    for (const offer of [...offersMade, ...offersReceived]) {
      addTimelineItem(timeline, {
        id: `offer-${offer.id}-${offer.dealer_profile_id === profileId ? "made" : "received"}`,
        source: "offer",
        title:
          offer.dealer_profile_id === profileId
            ? `Made ${offer.status} offer on ${compactListingTitle(firstRelation(offer.listing))}`
            : `Received ${offer.status} offer on ${compactListingTitle(firstRelation(offer.listing))}`,
        detail: `${offer.currency} ${Number(offer.amount || 0).toLocaleString("en-KE")}${
          offer.message ? ` / ${truncate(offer.message, 80)}` : ""
        }`,
        occurredAt: offer.updated_at || offer.created_at,
        href: "/admin/listings",
      });
    }

    for (const auditLog of auditLogs) {
      addTimelineItem(timeline, {
        id: `audit-${auditLog.id}`,
        source: "audit_log",
        title: `${auditLog.action.replace(/_/g, " ")} (${auditLog.entity_type})`,
        detail: auditLog.entity_id,
        occurredAt: auditLog.created_at,
        href: "/admin/audit-logs",
      });
    }

    return {
      profile,
      dealer: dealer || null,
      dealerDocuments,
      summary: summarizeAdminUserActivity({
        listings: listings.length,
        activeListings: listings.filter((listing) => listing.status === "active").length,
        sentEnquiries: sentEnquiries.length,
        receivedEnquiries: receivedEnquiries.length,
        conversations: conversations.length,
        supportTickets: supportTickets.length,
        payments: payments.length,
        favorites: favorites.length,
        reviewsWritten: reviewsWritten.length,
        reviewsReceived: reviewsReceived.length,
        offersMade: offersMade.length,
        offersReceived: offersReceived.length,
      }),
      timeline: sortAdminUserActivityTimeline(timeline),
      listings,
      sentEnquiries,
      receivedEnquiries,
      conversations,
      messages,
      supportTickets,
      payments,
      favorites,
      reviewsWritten,
      reviewsReceived,
      offersMade,
      offersReceived,
      entitlements,
      auditLogs,
      errors,
    };
  }
);
