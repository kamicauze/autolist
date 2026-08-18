import type { ListingStatus } from "@/lib/constants/marketplace";

export type OwnerListingCandidate = {
  id: string;
  price: number;
  status: ListingStatus;
};

export type CompletedListingSubmission = {
  success: true;
  autoApproved: boolean;
  alreadySubmitted: true;
};

export function getCompletedListingSubmission(
  status: ListingStatus
): CompletedListingSubmission | null {
  if (status === "active") {
    return { success: true, autoApproved: true, alreadySubmitted: true };
  }

  if (status === "pending") {
    return { success: true, autoApproved: false, alreadySubmitted: true };
  }

  return null;
}

export function findMatchingOwnerListing(
  candidates: OwnerListingCandidate[],
  price: number
) {
  const matches = candidates.filter((existing) => {
    if (existing.price <= 0) return existing.price === price;
    const priceDiff = Math.abs(existing.price - price);
    return priceDiff / existing.price < 0.01;
  });

  // Never resume a draft when another non-draft listing already represents
  // the same vehicle. Duplicate protection still wins in that situation.
  return matches.find((existing) => existing.status !== "draft") ?? matches[0] ?? null;
}
