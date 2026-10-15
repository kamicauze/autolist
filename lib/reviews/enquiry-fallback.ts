export const ENQUIRY_REVIEW_PREFIX = "[[AUTOLIST_REVIEW rating=";

export function serializeEnquiryReviewMessage(input: { rating: number; body: string }) {
  return `${ENQUIRY_REVIEW_PREFIX}${input.rating}]]\n${input.body.trim()}`;
}

export function parseEnquiryReviewMessage(message: string | null | undefined) {
  if (!message?.startsWith(ENQUIRY_REVIEW_PREFIX)) {
    return null;
  }

  const match = message.match(/^\[\[AUTOLIST_REVIEW rating=(\d)\]\]\n?([\s\S]*)$/);
  if (!match) {
    return null;
  }

  const rating = Number(match[1]);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return null;
  }

  return {
    rating,
    body: match[2].trim(),
  };
}
