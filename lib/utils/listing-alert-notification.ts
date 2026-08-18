import type { ListingAlertMatchType } from "@/lib/types/listing-alerts";

type ListingAlertNotificationInput = {
  alertId: string;
  recipientId: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  previousPrice: number | null;
  matchType: ListingAlertMatchType;
  emailEnabled: boolean;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(price);
}

export function buildListingAlertNotification(input: ListingAlertNotificationInput) {
  const isPriceDrop = input.matchType === "price_drop";
  const title = isPriceDrop
    ? `Price dropped: ${input.listingTitle}`
    : `New match: ${input.listingTitle}`;
  const body = isPriceDrop
    ? `${input.listingTitle} is now ${formatPrice(input.listingPrice)}${
        input.previousPrice === null
          ? "."
          : `, down from ${formatPrice(input.previousPrice)}.`
      }`
    : `${input.listingTitle} matches your saved alert at ${formatPrice(input.listingPrice)}.`;
  const href = `/vehicle/${input.listingId}`;
  const metadata = {
    alert_id: input.alertId,
    match_type: input.matchType,
  };
  const inAppDelivery = {
    recipientId: input.recipientId,
    channel: undefined as "email" | undefined,
    title,
    body,
    href,
    metadata,
  };

  return {
    title,
    body,
    href,
    deliveries: [
      inAppDelivery,
      ...(input.emailEnabled
        ? [{ ...inAppDelivery, channel: "email" as const }]
        : []),
    ],
  };
}
