import { generateAiJson, getAiProviderConfig } from "@/lib/ai/provider";
import type {
  ListingQualityInput,
  ListingQualityIssue,
  ListingQualityResult,
} from "@/lib/types/listing-quality";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getGrade(score: number): ListingQualityResult["grade"] {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

function defaultHeadline(grade: ListingQualityResult["grade"]) {
  if (grade === "excellent") return "Strong listing quality";
  if (grade === "good") return "Good listing foundation";
  if (grade === "fair") return "Listing needs refinement";
  return "Listing quality is too weak";
}

function normalizeText(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function referencesUnexpectedVehicle(
  text: string | undefined,
  input: ListingQualityInput
) {
  const normalized = normalizeText(text).toLowerCase();
  if (!normalized) return false;

  const allowedParts: string[] = [String(input.year || "").trim(), input.make, input.model]
    .map((value) => normalizeText(value).toLowerCase())
    .filter(Boolean);

  const vehicleTokens: string[] = normalized.match(/\b[a-z0-9-]+\b/g) || [];
  const disallowedSignals: string[] = ["toyota", "mazda", "honda", "subaru", "nissan", "bmw", "mercedes", "audi", "ford", "isuzu", "prado", "civic", "cx-5", "x5", "forester"];

  return disallowedSignals.some((token) => {
    if (!vehicleTokens.includes(token)) return false;
    return !allowedParts.includes(token);
  });
}

function buildRuleEvaluation(input: ListingQualityInput) {
  let score = 100;
  const issues: ListingQualityIssue[] = [];
  const strengths: string[] = [];

  const descriptionLength = input.description.trim().length;

  if (!input.make || !input.model || !input.year) {
    score -= 18;
    issues.push({
      severity: "high",
      title: "Core vehicle identity is incomplete",
      detail: "Make, model and year should all be filled to make the listing searchable and trustworthy.",
    });
  } else {
    strengths.push("Make, model and year are complete.");
  }

  if (!input.title.trim()) {
    score -= 18;
    issues.push({
      severity: "high",
      title: "Title is missing",
      detail: "Add a specific title so buyers can identify the vehicle at a glance.",
    });
  } else if (input.title.trim().length < 20) {
    score -= 8;
    issues.push({
      severity: "medium",
      title: "Title is too short",
      detail: "Include trim, condition or a key selling point to make the title more compelling.",
    });
  } else {
    strengths.push("Title is descriptive enough for marketplace cards.");
  }

  if (!Number.isFinite(input.price) || input.price <= 0) {
    score -= 20;
    issues.push({
      severity: "high",
      title: "Price is missing or invalid",
      detail: "A clear price is required for ranking, filtering and buyer trust.",
    });
  } else {
    strengths.push("Price is present and ready for comparison tools.");
  }

  if (descriptionLength < 80) {
    score -= 16;
    issues.push({
      severity: "high",
      title: "Description is too short",
      detail: "Add condition, service history, mileage context and notable features so buyers can evaluate the car properly.",
    });
  } else if (descriptionLength < 160) {
    score -= 8;
    issues.push({
      severity: "medium",
      title: "Description could be richer",
      detail: "Expand the description with ownership history, accident status, and standout selling points.",
    });
  } else {
    strengths.push("Description has enough detail to answer common buyer questions.");
  }

  if (input.imageCount < 3) {
    score -= 20;
    issues.push({
      severity: "high",
      title: "Too few images",
      detail: "Listings need at least 3 strong photos to feel credible.",
    });
  } else if (input.imageCount < 6) {
    score -= 8;
    issues.push({
      severity: "medium",
      title: "Add more photos",
      detail: "Aim for 6 or more images covering exterior angles, interior, dashboard and mileage.",
    });
  } else {
    strengths.push("Photo count is healthy for marketplace conversion.");
  }

  if (!input.mileage || input.mileage <= 0) {
    score -= 10;
    issues.push({
      severity: "medium",
      title: "Mileage is missing",
      detail: "Mileage is a key pricing and trust signal for buyers.",
    });
  } else {
    strengths.push("Mileage is included.");
  }

  if (!input.transmission) {
    score -= 5;
    issues.push({
      severity: "low",
      title: "Transmission is missing",
      detail: "Add transmission to improve filtering and buyer confidence.",
    });
  }

  if (!input.fuelType) {
    score -= 5;
    issues.push({
      severity: "low",
      title: "Fuel type is missing",
      detail: "Fuel type helps buyers compare running costs and filter accurately.",
    });
  }

  if (input.featuresCount === 0) {
    score -= 10;
    issues.push({
      severity: "medium",
      title: "No features selected",
      detail: "Select important comfort, safety and infotainment features to make the listing competitive.",
    });
  } else if (input.featuresCount < 5) {
    score -= 4;
    issues.push({
      severity: "low",
      title: "Feature list is thin",
      detail: "Add more confirmed features so buyers can compare value faster.",
    });
  } else {
    strengths.push("Feature selection is broad enough to improve discovery.");
  }

  if (!input.cityTown.trim() || !input.locationArea.trim()) {
    score -= 8;
    issues.push({
      severity: "medium",
      title: "Location details are incomplete",
      detail: "City and area help buyers judge convenience and route planning.",
    });
  } else {
    strengths.push("Location details are clear.");
  }

  if (!input.contactName.trim() || !input.phoneNumber.trim()) {
    score -= 12;
    issues.push({
      severity: "high",
      title: "Seller contact is incomplete",
      detail: "Contact name and phone number must be present so buyers can enquire confidently.",
    });
  } else {
    strengths.push("Seller contact details are present.");
  }

  const finalScore = clampScore(score);
  const grade = getGrade(finalScore);

  const orderedIssues = [...issues].sort((a, b) => {
    const weight = { high: 3, medium: 2, low: 1 };
    return weight[b.severity] - weight[a.severity];
  });

  const topImprovements = orderedIssues.slice(0, 3).map((issue) => issue.detail);
  const sellerTip =
    grade === "excellent"
      ? "This listing is strong enough to submit. Focus on keeping the photos and facts fully accurate."
      : "Fix the high-severity gaps first, then improve the description and photo coverage before submission.";

  return {
    score: finalScore,
    grade,
    headline: defaultHeadline(grade),
    summary:
      orderedIssues.length === 0
        ? "The listing is complete, descriptive and conversion-ready."
        : `The listing is usable but still has ${orderedIssues.length} quality gap${orderedIssues.length === 1 ? "" : "s"} affecting trust and conversion.`,
    topImprovements,
    sellerTip,
    strengths,
    issues: orderedIssues,
  };
}

export async function evaluateListingQuality(
  input: ListingQualityInput
): Promise<ListingQualityResult> {
  const base = buildRuleEvaluation(input);
  const aiConfig = getAiProviderConfig();

  if (!aiConfig.enabled) {
    return {
      ...base,
      provider: "rules",
      model: null,
    };
  }

  try {
    const prompt = [
      "You are an assistant helping a seller improve a vehicle marketplace listing.",
      "Return strict JSON only with keys: headline, summary, topImprovements, sellerTip.",
      "Keep headline under 6 words.",
      "Keep summary under 35 words.",
      "Return exactly 3 topImprovements strings, each one sentence and actionable.",
      "Use direct, practical language.",
      "",
      `Score: ${base.score}/100`,
      `Grade: ${base.grade}`,
      `Strengths: ${base.strengths.join(" | ") || "None"}`,
      `Issues: ${base.issues.map((issue) => `${issue.severity}: ${issue.title} - ${issue.detail}`).join(" | ") || "None"}`,
    ].join("\n");

    const response = await generateAiJson<{
      headline?: string;
      summary?: string;
      topImprovements?: string[];
      sellerTip?: string;
    }>({ prompt });

    if (!response) {
      return {
        ...base,
        provider: "rules",
        model: null,
      };
    }

    return {
      ...base,
      headline: base.headline,
      summary: referencesUnexpectedVehicle(response.data.summary, input)
        ? base.summary
        : response.data.summary?.trim() || base.summary,
      topImprovements:
        response.data.topImprovements?.filter(Boolean).slice(0, 3) || base.topImprovements,
      sellerTip: response.data.sellerTip?.trim() || base.sellerTip,
      provider: response.provider === "openai" ? "openai" : "local_llm",
      model: response.model,
    };
  } catch {
    return {
      ...base,
      provider: "rules",
      model: null,
    };
  }
}
