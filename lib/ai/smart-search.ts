import { generateAiJson, getAiProviderConfig } from "@/lib/ai/provider";
import {
  buildSearchParams,
  parseQuickSearchRules,
  sanitizeSmartSearchParams,
  shouldUseSmartSearchFallback,
} from "@/lib/search/quick-search";
import type { SmartSearchParams, SmartSearchResult } from "@/lib/types/smart-search";
import { SEARCH_INTENTS, SEARCH_ORIGINS, SEARCH_USE_CASES } from "@/lib/search/vehicle-ontology";

const ALLOWED_BODY_TYPES = new Set([
  "Sedan",
  "SUV",
  "Hatchback",
  "Pickup",
  "Truck",
  "Van",
  "Coupe",
  "Convertible",
  "Wagon",
  "Crossover",
]);

const ALLOWED_FUEL_TYPES = new Set(["Petrol", "Diesel", "Hybrid", "Electric"]);
const ALLOWED_TRANSMISSIONS = new Set(["Automatic", "Manual"]);
const ALLOWED_SELLER_TYPES = new Set(["dealer", "private"]);
const ALLOWED_ORIGINS = new Set(SEARCH_ORIGINS);
const ALLOWED_USE_CASES = new Set(SEARCH_USE_CASES);
const ALLOWED_INTENTS = new Set(SEARCH_INTENTS);
const GENERIC_INTENT_QUERIES = new Set([
  "small car",
  "compact car",
  "city car",
  "town car",
  "family car",
  "family suv",
  "work car",
  "work vehicle",
  "daily car",
]);
const COMPLEX_SMART_SEARCH_MODEL =
  process.env.OPENAI_SMART_SEARCH_COMPLEX_MODEL ||
  process.env.OPENAI_COMPLEX_MODEL ||
  process.env.OPENAI_MODEL ||
  "gpt-4o-mini";
const SMART_SEARCH_TIMEOUT_MS = Number(process.env.OPENAI_SMART_SEARCH_TIMEOUT_MS || "8000");

function normalizeLocalResponse(input: Partial<SmartSearchParams>) {
  const params = sanitizeSmartSearchParams(input);

  if (params.bodyType) {
    const bodyTypes = params.bodyType
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .filter((value) => ALLOWED_BODY_TYPES.has(value));

    if (bodyTypes.length === 0) {
      delete params.bodyType;
    } else {
      params.bodyType = Array.from(new Set(bodyTypes)).join(",");
    }
  }
  if (params.fuelType && !ALLOWED_FUEL_TYPES.has(params.fuelType)) {
    delete params.fuelType;
  }
  if (params.transmission && !ALLOWED_TRANSMISSIONS.has(params.transmission)) {
    delete params.transmission;
  }
  if (params.sellerType && !ALLOWED_SELLER_TYPES.has(params.sellerType)) {
    delete params.sellerType;
  }
  if (params.origin && !ALLOWED_ORIGINS.has(params.origin as (typeof SEARCH_ORIGINS)[number])) {
    delete params.origin;
  }
  if (params.useCase && !ALLOWED_USE_CASES.has(params.useCase as (typeof SEARCH_USE_CASES)[number])) {
    delete params.useCase;
  }
  if (params.intent) {
    const intents = params.intent
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .filter((value) => ALLOWED_INTENTS.has(value as (typeof SEARCH_INTENTS)[number]));

    if (intents.length === 0) {
      delete params.intent;
    } else {
      params.intent = Array.from(new Set(intents)).join(",");
    }
  }

  return params;
}

function deriveConfidence(params: SmartSearchParams): SmartSearchResult["confidence"] {
  const count = Object.values(params).filter(Boolean).length;
  if (params.make && (params.model || params.bodyType || params.maxPrice || params.location)) {
    return "high";
  }
  if (count >= 2) {
    return "medium";
  }
  return "low";
}

function pruneBroadTextQuery(params: SmartSearchParams) {
  const structuredKeys = Object.entries(params).filter(
    ([key, value]) => key !== "q" && Boolean(value)
  );

  const normalizedQuery = params.q?.trim().toLowerCase();

  if (
    params.q &&
    (structuredKeys.length >= 2 ||
      (Boolean(params.origin) && normalizedQuery?.includes("european")) ||
      (Boolean(params.bodyType) && normalizedQuery && GENERIC_INTENT_QUERIES.has(normalizedQuery)))
  ) {
    delete params.q;
  }

  return params;
}

function mergeCsvValues(first?: string, second?: string) {
  const merged = [...(first || "").split(","), ...(second || "").split(",")]
    .map((value) => value.trim())
    .filter(Boolean);

  return merged.length > 0 ? Array.from(new Set(merged)).join(",") : undefined;
}

function hasAbstractSignals(query: string, ruleParams: SmartSearchParams) {
  const lower = query.trim().toLowerCase();
  if (!lower) return false;

  if (ruleParams.intent) {
    return true;
  }

  const abstractTerms = [
    "reliable",
    "comfortable",
    "classy",
    "executive",
    "daily",
    "traffic",
    "road trip",
    "spacious",
    "roomy",
    "not too expensive",
    "affordable",
  ];

  return abstractTerms.some((term) => lower.includes(term));
}

function mergeSmartSearchParams(
  ruleParams: SmartSearchParams,
  llmParams: SmartSearchParams,
  confidence: SmartSearchResult["confidence"]
) {
  const merged: SmartSearchParams = { ...ruleParams };

  const assignIfMissing = <K extends keyof SmartSearchParams>(key: K) => {
    if (!merged[key] && llmParams[key]) {
      merged[key] = llmParams[key];
    }
  };

  assignIfMissing("q");
  assignIfMissing("make");
  assignIfMissing("model");
  assignIfMissing("origin");
  assignIfMissing("useCase");
  assignIfMissing("minPrice");
  assignIfMissing("maxPrice");
  assignIfMissing("minYear");
  assignIfMissing("maxYear");
  assignIfMissing("transmission");
  assignIfMissing("fuelType");
  assignIfMissing("location");
  assignIfMissing("sellerType");

  merged.bodyType = mergeCsvValues(ruleParams.bodyType, llmParams.bodyType) || merged.bodyType;
  merged.intent = mergeCsvValues(ruleParams.intent, llmParams.intent) || merged.intent;

  if (confidence === "low") {
    if (llmParams.useCase) {
      merged.useCase = llmParams.useCase;
    }
    if (llmParams.origin && !ruleParams.make) {
      merged.origin = llmParams.origin;
    }
    if (llmParams.location && !ruleParams.location) {
      merged.location = llmParams.location;
    }
  }

  return sanitizeSmartSearchParams(merged);
}

function pickSmartSearchModel(query: string, ruleParams: SmartSearchParams) {
  return hasAbstractSignals(query, ruleParams) ? COMPLEX_SMART_SEARCH_MODEL : undefined;
}

export async function evaluateSmartSearch(query: string): Promise<SmartSearchResult> {
  const ruleResult = parseQuickSearchRules(query);
  const aiConfig = getAiProviderConfig();

  if (!aiConfig.enabled || !shouldUseSmartSearchFallback(query, ruleResult)) {
    return ruleResult;
  }

  try {
    const prompt = [
      "Extract vehicle marketplace search filters from the query.",
      "Return strict JSON only with keys: q, make, model, origin, useCase, intent, minPrice, maxPrice, minYear, maxYear, bodyType, transmission, fuelType, location, sellerType.",
      `Use origin only from: ${SEARCH_ORIGINS.join(", ")}.`,
      `Use useCase only from: ${SEARCH_USE_CASES.join(", ")}.`,
      `Use intent only from: ${SEARCH_INTENTS.join(", ")}.`,
      "Use sellerType only if the query clearly implies dealer or private.",
      "Use bodyType only from: Sedan, SUV, Hatchback, Pickup, Truck, Van, Coupe, Convertible, Wagon, Crossover.",
      "Use fuelType only from: Petrol, Diesel, Hybrid, Electric.",
      "Use transmission only from: Automatic, Manual.",
      "Use Kenyan city names when present.",
      "Use intent for abstract preferences that should guide ranking without hard-filtering everything out.",
      "If the query says something is expensive or affordable without a precise number, prefer intent=value instead of inventing a budget.",
      "If the query is intent-heavy or vague, keep q only when there is still meaningful leftover wording after extracting structured fields.",
      "Support spelling mistakes and mixed English/Swahili phrasing when possible.",
      "",
      `Query: ${query.trim()}`,
      `Rule extraction: ${JSON.stringify(ruleResult.params)}`,
    ].join("\n");

    const response = await generateAiJson<Partial<SmartSearchParams>>({
      prompt,
      maxTokens: 180,
      model: pickSmartSearchModel(query, ruleResult.params),
      timeoutMs: SMART_SEARCH_TIMEOUT_MS,
    });

    if (!response) {
      return ruleResult;
    }

    const llmParams = normalizeLocalResponse(response.data);
    const mergedParams = pruneBroadTextQuery(
      mergeSmartSearchParams(ruleResult.params, llmParams, ruleResult.confidence)
    );

    if (Object.keys(mergedParams).length === 0) {
      return ruleResult;
    }

    return {
      normalizedQuery: ruleResult.normalizedQuery,
      params: mergedParams,
      provider: response.provider === "openai" ? "openai" : "local_llm",
      model: response.model,
      confidence: deriveConfidence(mergedParams),
      note:
        response.provider === "openai"
          ? "OpenAI refined the search filters before routing to results."
          : "Local AI fallback refined the search filters before routing to results.",
    };
  } catch {
    return ruleResult;
  }
}

export function buildSmartSearchUrl(result: SmartSearchResult) {
  const params = buildSearchParams(result.params);
  return `/search?${params.toString()}`;
}
