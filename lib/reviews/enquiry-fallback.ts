const REVIEW_PREFIX = "[[AUTOLIST_REVIEW rating=";

export function serializeEnquiryReviewMessage(input: { rating: number; body: string }) {
  return `${REVIEW_PREFIX}${input.rating}]]\n${input.body.trim()}`;
}

export function parseEnquiryReviewMessage(message: string | null | undefined) {
  if (!message?.startsWith(REVIEW_PREFIX)) {
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
