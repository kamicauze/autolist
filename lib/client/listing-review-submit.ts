export const LISTING_REVIEW_RETRY_ERROR =
  "Your draft and uploads were saved, but we could not submit the listing for review. Try posting again; it will continue the same draft.";

export type ListingReviewSubmitResult = {
  success?: boolean;
  autoApproved?: boolean;
  alreadySubmitted?: boolean;
  error?: string;
};

export async function submitListingReviewWithRecovery(
  listingId: string,
  submit: (listingId: string) => Promise<ListingReviewSubmitResult>
): Promise<ListingReviewSubmitResult> {
  try {
    return await submit(listingId);
  } catch {
    try {
      return await submit(listingId);
    } catch {
      return { error: LISTING_REVIEW_RETRY_ERROR };
    }
  }
}
