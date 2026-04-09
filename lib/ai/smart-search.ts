import { generateAiJson, getAiProviderConfig } from "@/lib/ai/provider";
import {
  buildSearchParams,
  parseQuickSearchRules,
  sanitizeSmartSearchParams,
  shouldUseSmartSearchFallback,
} from "@/lib/search/quick-search";
import type { SmartSearchParams, SmartSearchResult } from "@/lib/types/smart-search";

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

  if (params.q && structuredKeys.length >= 2) {
    delete params.q;
  }

  return params;
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
      "Return strict JSON only with keys: q, make, model, minPrice, maxPrice, minYear, maxYear, bodyType, transmission, fuelType, location, sellerType.",
      "Use sellerType only if the query clearly implies dealer or private.",
      "Use bodyType only from: Sedan, SUV, Hatchback, Pickup, Truck, Van, Coupe, Convertible, Wagon, Crossover.",
      "Use fuelType only from: Petrol, Diesel, Hybrid, Electric.",
      "Use transmission only from: Automatic, Manual.",
      "Use Kenyan city names when present.",
      "If the query is intent-heavy or vague, keep q with the cleaned query.",
      "Support spelling mistakes and mixed English/Swahili phrasing when possible.",
      "",
      `Query: ${query.trim()}`,
      `Rule extraction: ${JSON.stringify(ruleResult.params)}`,
    ].join("\n");

    const response = await generateAiJson<Partial<SmartSearchParams>>({
      prompt,
      maxTokens: 180,
    });

    if (!response) {
      return ruleResult;
    }

    const llmParams = normalizeLocalResponse(response.data);
    const mergedParams = pruneBroadTextQuery(
      sanitizeSmartSearchParams({
      ...llmParams,
      ...ruleResult.params,
      })
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
