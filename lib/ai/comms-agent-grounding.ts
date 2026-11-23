import { FAQ_CATEGORIES, type FaqCategory } from "@/lib/constants/faqs";
import { LISTING_FEATURE_INDEX } from "@/lib/constants/marketplace";
import type { CommsAgentFaqExcerpt } from "@/lib/types/comms-agent";
import type { Listing } from "@/lib/types/listing";
import { formatListingLabel } from "@/lib/utils/listing-details";
import { getListingDisplayLocation } from "@/lib/utils/vehicle-display";

const MAX_FEATURES = 25;
const MAX_DESCRIPTION_CHARS = 600;
const MAX_FAQ_ANSWER_CHARS = 420;

const STOPWORDS = new Set(
  "a an and are as at be but by can do does for from have how i if in is it its me my of on or our so that the this to was we what when where which who why will with you your yes no please hi hello thanks thank".split(
    " "
  )
);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function formatAmount(value: number) {
  return value.toLocaleString("en-KE", { maximumFractionDigits: 0 });
}

/**
 * Seller-provided facts for the exact advertised unit. These are the only
 * vehicle facts the reply assistant may state (ADR-0008 keeps them separate
 * from typical model-year research).
 */
export function buildListingFacts(listing: Listing | null): string[] {
  if (!listing) return [];

  const facts: string[] = [];
  const push = (label: string, value: string | number | null | undefined) => {
    if (value === null || value === undefined) return;
    const text = String(value).trim();
    if (text) facts.push(`${label}: ${text}`);
  };

  push("Vehicle", [listing.year, listing.make, listing.model].filter(Boolean).join(" "));
  if (listing.price > 0) push("Asking price", `${listing.currency || "KES"} ${formatAmount(listing.price)}`);
  if (listing.mileage !== null && listing.mileage >= 0) push("Mileage", `${formatAmount(listing.mileage)} km`);
  push("Condition", listing.condition ? formatListingLabel(listing.condition) : null);
  push("Body type", listing.body_type);
  push("Transmission", listing.transmission);
  push("Fuel", listing.fuel_type);
  push("Drive", listing.drive_type);
  push("Colour", listing.color);
  push("Seats", listing.seats);
  push("Location", getListingDisplayLocation(listing, { fallback: "" }));

  if (listing.dealer?.name) {
    push("Seller", `${listing.dealer.name} (dealer)`);
    push("Dealer address", listing.dealer.address);
  }

  const features = (listing.features || [])
    .map((feature) => LISTING_FEATURE_INDEX[feature]?.label ?? formatListingLabel(feature))
    .filter(Boolean)
    .slice(0, MAX_FEATURES);
  if (features.length > 0) push("Seller-listed features", features.join(", "));

  const description = listing.description?.replace(/\s+/g, " ").trim();
  if (description) {
    push(
      "Seller description",
      description.length > MAX_DESCRIPTION_CHARS
        ? `${description.slice(0, MAX_DESCRIPTION_CHARS).trimEnd()}…`
        : description
    );
  }

  return facts;
}

function flattenAnswer(answer: FaqCategory["items"][number]["answer"]) {
  const text = answer
    .map((block) => ("p" in block ? block.p : block.ul.join("; ")))
    .join(" ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > MAX_FAQ_ANSWER_CHARS ? `${text.slice(0, MAX_FAQ_ANSWER_CHARS).trimEnd()}…` : text;
}

/**
 * Lexical retrieval over the in-code FAQ (ADR-0031). The corpus is ~50 entries,
 * so IDF-weighted token overlap is enough; question matches count double.
 */
export function retrieveRelevantFaqs(
  query: string,
  { limit = 3, categories = FAQ_CATEGORIES }: { limit?: number; categories?: FaqCategory[] } = {}
): CommsAgentFaqExcerpt[] {
  const queryTokens = Array.from(new Set(tokenize(query)));
  if (queryTokens.length === 0) return [];

  const entries = categories.flatMap((category) =>
    category.items.map((item) => {
      const answer = flattenAnswer(item.answer);
      return {
        question: item.question,
        answer,
        questionTokens: new Set(tokenize(item.question)),
        answerTokens: new Set(tokenize(answer)),
      };
    })
  );
  if (entries.length === 0) return [];

  const documentFrequency = new Map<string, number>();
  for (const entry of entries) {
    for (const token of new Set([...entry.questionTokens, ...entry.answerTokens])) {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    }
  }

  return entries
    .map((entry) => {
      let score = 0;
      let questionHits = 0;
      let matched = 0;
      for (const token of queryTokens) {
        const df = documentFrequency.get(token);
        if (!df) continue;
        const idf = Math.log(1 + entries.length / df);
        if (entry.questionTokens.has(token)) {
          score += 2 * idf;
          questionHits += 1;
          matched += 1;
        } else if (entry.answerTokens.has(token)) {
          score += idf;
          matched += 1;
        }
      }
      return { entry, score, questionHits, matched };
    })
    .filter(({ questionHits, matched }) => questionHits >= 1 && matched >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => ({ question: entry.question, answer: entry.answer }));
}
