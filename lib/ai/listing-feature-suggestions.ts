import {
  LISTING_CATEGORY_OPTIONS,
  LISTING_FEATURE_GROUPS_BY_CATEGORY,
  LISTING_FEATURES_BY_CATEGORY,
  type ListingCategory,
  type ListingFeatureOption,
} from "@/lib/constants/marketplace";
import { generateAiJson, getAiProviderConfig } from "@/lib/ai/provider";
import type {
  ListingFeatureSuggestionInput,
  ListingFeatureSuggestionResult,
} from "@/lib/types/listing-feature-suggestions";

const MAX_SUGGESTED_FEATURES = 12;

type AiFeatureSuggestionPayload = {
  featureIds?: string[];
  features?: string[];
  reason?: string;
};

type AiGenerationResult = {
  data: AiFeatureSuggestionPayload;
  provider: "openai" | "local";
  model: string | null;
};

type SuggestionOptions = {
  generateJson?: (input: {
    prompt: string;
    maxTokens?: number;
  }) => Promise<AiGenerationResult | null>;
};

const LISTING_CATEGORY_SET = new Set(
  LISTING_CATEGORY_OPTIONS.map((option) => option.value)
);

function compactWhitespace(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function normalizeLookupValue(value: string) {
  return compactWhitespace(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isListingCategory(value: string): value is ListingCategory {
  return LISTING_CATEGORY_SET.has(value as ListingCategory);
}

function getCategoryFeatures(category: ListingCategory | "") {
  if (!isListingCategory(category)) return [];

  const groups = LISTING_FEATURES_BY_CATEGORY[category];
  const groupDefinition = LISTING_FEATURE_GROUPS_BY_CATEGORY[category];
  return groupDefinition.order.flatMap((groupKey) => groups[groupKey] ?? []);
}

function getSuggestionAnchor(input: ListingFeatureSuggestionInput) {
  if (
    input.category === "plant_construction" ||
    input.category === "farm_agricultural"
  ) {
    return compactWhitespace(input.equipmentType);
  }

  return [input.make, input.model].map(compactWhitespace).filter(Boolean).join(" ");
}

function buildRuleFeatureKeywords(input: ListingFeatureSuggestionInput) {
  const year = Number(input.year);
  const detailText = [
    input.make,
    input.model,
    input.trim,
    input.variant,
    input.fuelType,
    input.bodyType,
  ].join(" ").toLowerCase();
  const keywords = new Set<string>();

  if (input.category === "car" || input.category === "van" || input.category === "truck") {
    ["abs", "airbag", "air conditioning", "bluetooth"].forEach((keyword) => keywords.add(keyword));

    if (Number.isFinite(year) && year >= 2016) {
      ["rear parking camera", "parking sensors", "traction control", "stability control"].forEach((keyword) => keywords.add(keyword));
    }

    if (Number.isFinite(year) && year >= 2020) {
      ["lane departure", "lane keep", "automatic emergency braking", "android auto", "apple carplay"].forEach((keyword) => keywords.add(keyword));
    }

    if (detailText.includes("hybrid") || detailText.includes("electric")) {
      ["regenerative braking", "eco mode"].forEach((keyword) => keywords.add(keyword));
    }
  } else if (input.category === "motorbike") {
    ["abs", "traction control", "led", "digital display"].forEach((keyword) => keywords.add(keyword));
  } else if (input.category === "plant_construction" || input.category === "farm_agricultural") {
    ["hydraulic", "rops", "monitor", "gps", "traction"].forEach((keyword) => keywords.add(keyword));
  }

  return Array.from(keywords);
}

function pickMatchingFeature(
  keyword: string,
  features: ListingFeatureOption[],
  selected: Set<string>
) {
  const normalizedKeyword = normalizeLookupValue(keyword);
  if (!normalizedKeyword) return null;

  return features.find((feature) => {
    if (selected.has(feature.id)) return false;
    return [feature.label, feature.id, ...(feature.aliases ?? [])]
      .map(normalizeLookupValue)
      .some((value) => value.includes(normalizedKeyword));
  }) ?? null;
}

function buildRuleFeatureSuggestionIds(input: ListingFeatureSuggestionInput) {
  const features = getCategoryFeatures(input.category);
  const selected = new Set<string>();

  if (!getSuggestionAnchor(input)) return [];

  for (const keyword of buildRuleFeatureKeywords(input)) {
    const match = pickMatchingFeature(keyword, features, selected);

    if (match) {
      selected.add(match.id);
    }

    if (selected.size >= MAX_SUGGESTED_FEATURES) break;
  }

  return Array.from(selected);
}

function buildFeatureLookups(features: ListingFeatureOption[]) {
  const byId = new Map(features.map((feature) => [feature.id, feature]));
  const byText = new Map<string, ListingFeatureOption>();

  for (const feature of features) {
    [feature.label, feature.id, ...(feature.aliases ?? [])].forEach((value) => {
      const normalized = normalizeLookupValue(value);
      if (normalized && !byText.has(normalized)) {
        byText.set(normalized, feature);
      }
    });
  }

  return { byId, byText };
}

function sanitizeAiFeatureIds(
  response: AiFeatureSuggestionPayload,
  features: ListingFeatureOption[]
) {
  const { byId, byText } = buildFeatureLookups(features);
  const selected = new Set<string>();
  const candidates = [
    ...(Array.isArray(response.featureIds) ? response.featureIds : []),
    ...(Array.isArray(response.features) ? response.features : []),
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;

    const exact = byId.get(candidate.trim());
    const normalized = byText.get(normalizeLookupValue(candidate));
    const match = exact ?? normalized;

    if (match) {
      selected.add(match.id);
    }

    if (selected.size >= MAX_SUGGESTED_FEATURES) break;
  }

  return Array.from(selected);
}

function buildPrompt(input: ListingFeatureSuggestionInput, features: ListingFeatureOption[]) {
  const catalog = features
    .map((feature) => `${feature.id}: ${feature.label}`)
    .join("\n");

  return [
    "You help a seller preselect likely vehicle listing features after make and model are chosen.",
    "Return strict JSON only with keys: featureIds, reason.",
    `Choose at most ${MAX_SUGGESTED_FEATURES} featureIds from the allowed catalog only.`,
    "Only suggest features that are commonly expected for this vehicle identity and year; the seller will confirm them manually.",
    "Do not invent IDs or claim certainty.",
    "",
    `Category: ${input.category || "vehicle"}`,
    `Make: ${input.make || "Unknown"}`,
    `Model: ${input.model || "Unknown"}`,
    `Trim: ${input.trim || "Unknown"}`,
    `Variant: ${input.variant || "Unknown"}`,
    `Year: ${input.year || "Unknown"}`,
    `Body type: ${input.bodyType || "Unknown"}`,
    `Fuel type: ${input.fuelType || "Unknown"}`,
    `Transmission: ${input.transmission || "Unknown"}`,
    `Equipment type: ${input.equipmentType || "Unknown"}`,
    "",
    "Allowed feature catalog:",
    catalog,
  ].join("\n");
}

export async function suggestListingFeatureIds(
  input: ListingFeatureSuggestionInput,
  options: SuggestionOptions = {}
): Promise<ListingFeatureSuggestionResult> {
  const features = getCategoryFeatures(input.category);
  const fallbackFeatureIds = buildRuleFeatureSuggestionIds(input);
  const fallback: ListingFeatureSuggestionResult = {
    featureIds: fallbackFeatureIds,
    provider: "rules",
    model: null,
    reason:
      fallbackFeatureIds.length > 0
        ? "Preselected common features from the local rule set. Confirm the exact equipment before publishing."
        : "No reliable feature suggestions are available yet. Select the confirmed equipment manually.",
  };

  if (features.length === 0 || !getSuggestionAnchor(input)) {
    return fallback;
  }

  const aiConfig = getAiProviderConfig();
  const generateJson = options.generateJson ?? generateAiJson<AiFeatureSuggestionPayload>;

  if (!options.generateJson && !aiConfig.enabled) {
    return fallback;
  }

  try {
    const response = await generateJson({
      prompt: buildPrompt(input, features),
      maxTokens: 260,
    });

    if (!response) return fallback;

    const featureIds = sanitizeAiFeatureIds(response.data, features);
    if (featureIds.length === 0) return fallback;

    return {
      featureIds,
      provider: response.provider === "openai" ? "openai" : "local_llm",
      model: response.model,
      reason:
        compactWhitespace(response.data.reason).slice(0, 180) ||
        "AI preselected likely features. Confirm the exact equipment before publishing.",
    };
  } catch {
    return fallback;
  }
}

export function buildRuleListingFeatureSuggestionIdsForTest(
  input: ListingFeatureSuggestionInput
) {
  return buildRuleFeatureSuggestionIds(input);
}
