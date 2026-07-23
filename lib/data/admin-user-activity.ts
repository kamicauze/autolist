export type AdminUserActivitySource =
  | "profile"
  | "dealer"
  | "listing"
  | "enquiry_sent"
  | "enquiry_received"
  | "conversation"
  | "message"
  | "support_ticket"
  | "payment"
  | "favorite"
  | "review"
  | "offer"
  | "audit_log";

export type AdminUserActivityItem = {
  id: string;
  source: AdminUserActivitySource;
  title: string;
  detail: string | null;
  occurredAt: string;
  href?: string | null;
};

export type AdminUserActivitySummaryCounts = {
  listings: number;
  activeListings: number;
  sentEnquiries: number;
  receivedEnquiries: number;
  conversations: number;
  supportTickets: number;
  payments: number;
  favorites: number;
  reviewsWritten: number;
  reviewsReceived: number;
  offersMade: number;
  offersReceived: number;
};

export type AdminUserActivitySummaryItem = {
  label: string;
  value: number;
  note: string;
};

export type AdminUserActivityModuleCounts = {
  timeline: number;
  listings: number;
  dealerDocuments: number;
  sentEnquiries: number;
  receivedEnquiries: number;
  conversations: number;
  messages: number;
  supportTickets: number;
  payments: number;
  entitlements: number;
  favorites: number;
  reviewsWritten: number;
  reviewsReceived: number;
  offersMade: number;
  offersReceived: number;
  auditLogs: number;
};

export type AdminUserActivityModule = {
  key:
    | "timeline"
    | "listings"
    | "dealer"
    | "enquiries"
    | "messages"
    | "commerce"
    | "engagement"
    | "audit";
  label: string;
  description: string;
  count: number;
  meta: string;
  href: string;
};

export type AdminUserActivityDayGroup = {
  dateKey: string;
  items: AdminUserActivityItem[];
};

export function sortAdminUserActivityTimeline(items: AdminUserActivityItem[]) {
  return items
    .slice()
    .sort((left, right) => {
      const timeDelta =
        new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime();

      if (timeDelta !== 0) {
        return timeDelta;
      }

      return left.id.localeCompare(right.id);
    });
}

export function groupAdminUserActivityTimelineByDay(
  items: AdminUserActivityItem[],
  timeZone = "Africa/Nairobi"
): AdminUserActivityDayGroup[] {
  const dateFormatter = new Intl.DateTimeFormat("en-KE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return sortAdminUserActivityTimeline(items).reduce<AdminUserActivityDayGroup[]>(
    (groups, item) => {
      const parts = dateFormatter.formatToParts(new Date(item.occurredAt));
      const year = parts.find((part) => part.type === "year")?.value;
      const month = parts.find((part) => part.type === "month")?.value;
      const day = parts.find((part) => part.type === "day")?.value;
      const dateKey = `${year}-${month}-${day}`;
      const currentGroup = groups.at(-1);

      if (currentGroup?.dateKey === dateKey) {
        currentGroup.items.push(item);
      } else {
        groups.push({ dateKey, items: [item] });
      }

      return groups;
    },
    []
  );
}

export function summarizeAdminUserActivity(
  counts: AdminUserActivitySummaryCounts
): AdminUserActivitySummaryItem[] {
  const totalEnquiries = counts.sentEnquiries + counts.receivedEnquiries;
  const totalOffers = counts.offersMade + counts.offersReceived;
  const totalReviews = counts.reviewsWritten + counts.reviewsReceived;

  return [
    {
      label: "Listings",
      value: counts.listings,
      note: `${counts.activeListings} active`,
    },
    {
      label: "Enquiries",
      value: totalEnquiries,
      note: `${counts.sentEnquiries} sent / ${counts.receivedEnquiries} received`,
    },
    {
      label: "Conversations",
      value: counts.conversations,
      note: `${counts.supportTickets} support tickets`,
    },
    {
      label: "Commerce",
      value: counts.payments + totalOffers,
      note: `${counts.payments} payments / ${totalOffers} offers`,
    },
    {
      label: "Engagement",
      value: counts.favorites + totalReviews,
      note: `${counts.favorites} favorites / ${totalReviews} reviews`,
    },
  ];
}

export function buildAdminUserActivityModules(
  counts: AdminUserActivityModuleCounts
): AdminUserActivityModule[] {
  const enquiryCount = counts.sentEnquiries + counts.receivedEnquiries;
  const messageCount = counts.conversations + counts.messages;
  const commerceCount =
    counts.payments + counts.entitlements + counts.offersMade + counts.offersReceived;
  const engagementCount =
    counts.favorites +
    counts.reviewsWritten +
    counts.reviewsReceived +
    counts.offersMade +
    counts.offersReceived;

  return [
    {
      key: "timeline",
      label: "Timeline",
      description: "Newest events across the account.",
      count: counts.timeline,
      meta: "events",
      href: "#timeline",
    },
    {
      key: "listings",
      label: "Listings",
      description: "Owned inventory and listing states.",
      count: counts.listings,
      meta: "records",
      href: "#listings",
    },
    {
      key: "dealer",
      label: "Dealer / KYC",
      description: "Dealer record and verification documents.",
      count: counts.dealerDocuments,
      meta: "documents",
      href: "#dealer-verification",
    },
    {
      key: "enquiries",
      label: "Enquiries",
      description: "Inbound and outbound buyer interest.",
      count: enquiryCount,
      meta: `${counts.sentEnquiries} sent / ${counts.receivedEnquiries} received`,
      href: "#enquiries",
    },
    {
      key: "messages",
      label: "Messages",
      description: "Threads, support context, and recent messages.",
      count: messageCount,
      meta: `${counts.conversations} threads`,
      href: "#messages",
    },
    {
      key: "commerce",
      label: "Commerce",
      description: "Payments, membership, offers, and tickets.",
      count: commerceCount,
      meta: `${counts.payments} payments`,
      href: "#commerce",
    },
    {
      key: "engagement",
      label: "Engagement",
      description: "Favorites, reviews, and dealer offers.",
      count: engagementCount,
      meta: `${counts.favorites} saved`,
      href: "#engagement",
    },
    {
      key: "audit",
      label: "Audit",
      description: "Operational logs tied to the user and entities.",
      count: counts.auditLogs,
      meta: "logs",
      href: "#audit",
    },
  ];
}
