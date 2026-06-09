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
