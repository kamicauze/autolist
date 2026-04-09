import { generateAiJson, getAiProviderConfig } from "@/lib/ai/provider";
import type { DuplicateCandidate, DuplicateReviewSuggestion } from "@/lib/types/duplicate-review";
import type { Listing } from "@/lib/types/listing";

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function tokenizeDescription(value: string | null | undefined) {
  return new Set(
    normalize(value)
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((token) => token.length >= 4)
  );
}

function getDescriptionOverlap(a: string | null | undefined, b: string | null | undefined) {
  const tokensA = tokenizeDescription(a);
  const tokensB = tokenizeDescription(b);

  if (tokensA.size === 0 || tokensB.size === 0) {
    return 0;
  }

  let matches = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) {
      matches += 1;
    }
  });

  return matches / Math.max(tokensA.size, tokensB.size);
}

function buildCandidateReason(reasons: string[]) {
  if (reasons.length === 0) {
    return "Weak duplicate signal.";
  }
  return reasons.join(", ");
}

function getSeverity(score: number): DuplicateCandidate["severity"] {
  if (score >= 70) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function getConfidenceLabel(score: number) {
  if (score >= 70) return "Strong match";
  if (score >= 50) return "Moderate match";
  return "Weak match";
}

export function scoreDuplicateCandidate(listing: Listing, candidate: Listing): DuplicateCandidate | null {
  let score = 0;
  const reasons: string[] = [];
  const pricePercent =
    listing.price > 0 && candidate.price > 0
      ? (Math.abs(candidate.price - listing.price) / Math.max(listing.price, candidate.price)) * 100
      : null;
  const mileageDelta =
    listing.mileage != null && candidate.mileage != null
      ? Math.abs(listing.mileage - candidate.mileage)
      : null;
  const yearDelta = Math.abs((listing.year || 0) - (candidate.year || 0));
  const descriptionOverlap = getDescriptionOverlap(listing.description, candidate.description);

  if (normalize(listing.make) === normalize(candidate.make)) {
    score += 18;
    reasons.push("same make");
  }

  if (normalize(listing.model) === normalize(candidate.model)) {
    score += 20;
    reasons.push("same model");
  }

  if (listing.year === candidate.year) {
    score += 16;
    reasons.push("same year");
  } else if (yearDelta === 1) {
    score += 8;
    reasons.push("year is within 1");
  }

  if (pricePercent != null) {
    if (pricePercent <= 1) {
      score += 22;
      reasons.push("price within 1%");
    } else if (pricePercent <= 3) {
      score += 16;
      reasons.push("price within 3%");
    } else if (pricePercent <= 7) {
      score += 8;
      reasons.push("price still close");
    }
  }

  if (mileageDelta != null) {
    if (mileageDelta <= 10_000) {
      score += 10;
      reasons.push("mileage is very close");
    } else if (mileageDelta <= 25_000) {
      score += 5;
      reasons.push("mileage is reasonably close");
    }
  }

  if (normalize(listing.body_type) && normalize(listing.body_type) === normalize(candidate.body_type)) {
    score += 5;
    reasons.push("same body type");
  }

  if (normalize(listing.transmission) && normalize(listing.transmission) === normalize(candidate.transmission)) {
    score += 4;
    reasons.push("same transmission");
  }

  if (normalize(listing.fuel_type) && normalize(listing.fuel_type) === normalize(candidate.fuel_type)) {
    score += 4;
    reasons.push("same fuel");
  }

  if (listing.seller_id === candidate.seller_id) {
    score += 12;
    reasons.push("same seller");
  }

  if (descriptionOverlap >= 0.6) {
    score += 8;
    reasons.push("description wording is very similar");
  } else if (descriptionOverlap >= 0.35) {
    score += 4;
    reasons.push("description wording overlaps");
  }

  if (score < 35) {
    return null;
  }

  return {
    listingId: listing.id,
    score,
    severity: getSeverity(score),
    confidenceLabel: getConfidenceLabel(score),
    reason: buildCandidateReason(reasons),
    distance: {
      pricePercent: pricePercent == null ? null : Number(pricePercent.toFixed(1)),
      mileageDelta,
    },
    candidate: {
      id: candidate.id,
      make: candidate.make,
      model: candidate.model,
      year: candidate.year,
      price: candidate.price,
      mileage: candidate.mileage,
      status: candidate.status,
      body_type: candidate.body_type,
      fuel_type: candidate.fuel_type,
      transmission: candidate.transmission,
      created_at: candidate.created_at,
      seller_id: candidate.seller_id,
    },
  };
}

function buildBaseSuggestion(
  listing: Listing,
  candidates: DuplicateCandidate[]
): DuplicateReviewSuggestion {
  if (candidates.length === 0) {
    return {
      listingId: listing.id,
      status: "clear",
      severity: "low",
      headline: "No strong duplicate signal",
      summary: "No nearby active or pending listing crossed the duplicate review threshold.",
      reviewerNote: "Proceed with normal moderation checks unless there is off-platform evidence of reposting.",
      candidates: [],
      provider: "rules",
      model: null,
    };
  }

  const topCandidate = candidates[0];
  const severity = topCandidate.severity;

  return {
    listingId: listing.id,
    status: "review",
    severity,
    headline:
      severity === "high"
        ? "High duplicate risk"
        : severity === "medium"
          ? "Possible duplicate listing"
          : "Weak duplicate overlap",
    summary: `Top match is ${topCandidate.confidenceLabel.toLowerCase()} against a ${topCandidate.candidate.status} listing with ${topCandidate.reason}.`,
    reviewerNote:
      severity === "high"
        ? "Check whether this is a repost or duplicate inventory entry before approving."
        : "Review the top match and confirm whether the differences are enough to justify a separate listing.",
    candidates,
    provider: "rules",
    model: null,
  };
}

export async function buildDuplicateReviewSuggestion(
  listing: Listing,
  matches: Listing[]
): Promise<DuplicateReviewSuggestion> {
  const candidates = matches
    .map((candidate) => scoreDuplicateCandidate(listing, candidate))
    .filter((candidate): candidate is DuplicateCandidate => Boolean(candidate))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const base = buildBaseSuggestion(listing, candidates);
  const aiConfig = getAiProviderConfig();

  if (!aiConfig.enabled || candidates.length === 0) {
    return base;
  }

  try {
    const prompt = [
      "You are assisting an admin reviewing vehicle listing duplicates.",
      "Return strict JSON only with keys: headline, summary, reviewerNote.",
      "Do not approve or reject. Only suggest what the human reviewer should verify.",
      "Keep headline under 6 words.",
      "Keep summary under 30 words.",
      "Keep reviewerNote under 25 words.",
      "",
      `Listing: ${listing.year} ${listing.make} ${listing.model}, price ${listing.price}, seller ${listing.seller_id}`,
      `Candidates: ${candidates
        .map(
          (candidate) =>
            `${candidate.candidate.status} ${candidate.candidate.year} ${candidate.candidate.make} ${candidate.candidate.model}, score ${candidate.score}, reason ${candidate.reason}`
        )
        .join(" | ")}`,
    ].join("\n");

    const response = await generateAiJson<{
      headline?: string;
      summary?: string;
      reviewerNote?: string;
    }>({
      prompt,
      maxTokens: 120,
    });

    if (!response) {
      return base;
    }

    return {
      ...base,
      headline: response.data.headline?.trim() || base.headline,
      summary: response.data.summary?.trim() || base.summary,
      reviewerNote: response.data.reviewerNote?.trim() || base.reviewerNote,
      provider: response.provider === "openai" ? "openai" : "local_llm",
      model: response.model,
    };
  } catch {
    return base;
  }
}
