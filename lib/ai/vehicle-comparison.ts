import {
  generateAiJson,
  generateOpenAiWebJson,
  getAiProviderConfig,
} from "@/lib/ai/provider";
import { LISTING_FEATURE_INDEX } from "@/lib/constants/marketplace";
import type { Listing } from "@/lib/types/listing";
import type {
  VehicleComparisonResult,
  VehicleModelInsight,
} from "@/lib/types/vehicle-comparison";
import {
  formatListingCondition,
  formatListingLabel,
} from "@/lib/utils/listing-details";
import {
  getListingDisplayLocation,
  getListingDisplayTitle,
  getListingEngineDisplacement,
  getListingTrim,
  getListingVariant,
} from "@/lib/utils/vehicle-display";

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-KE");
const VEHICLE_COMPARISON_TIMEOUT_MS = Number(
  process.env.OPENAI_VEHICLE_COMPARISON_TIMEOUT_MS || "20000",
);
const VEHICLE_WEB_RESEARCH_TIMEOUT_MS = Number(
  process.env.OPENAI_VEHICLE_RESEARCH_TIMEOUT_MS || "30000",
);
const RESEARCHED_SPECIFICATION_LABELS = [
  "Engine & powertrain",
  "Power & torque",
  "Drivetrain",
  "Dimensions",
  "Seating & cargo",
  "Fuel economy",
  "Safety",
  "Typical equipment",
] as const;

function buildWebResearchSchema(vehicleIds: string[]) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      modelInsights: {
        type: "array",
        minItems: vehicleIds.length,
        maxItems: vehicleIds.length,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            vehicleId: { type: "string", enum: vehicleIds },
            modelSummary: { type: "string" },
            buyerFit: { type: "string" },
            knownConsiderations: { type: "array", items: { type: "string" } },
            researchedSpecs: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  label: {
                    type: "string",
                    enum: RESEARCHED_SPECIFICATION_LABELS,
                  },
                  value: { type: "string" },
                },
                required: ["label", "value"],
              },
            },
          },
          required: [
            "vehicleId",
            "modelSummary",
            "buyerFit",
            "knownConsiderations",
            "researchedSpecs",
          ],
        },
      },
    },
    required: ["modelInsights"],
  } as const;
}

function compactWhitespace(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function limitedText(value: string | null | undefined, maxLength: number) {
  const text = compactWhitespace(value);
  return text.length > maxLength
    ? `${text.slice(0, maxLength - 1).trim()}...`
    : text;
}

function formatPrice(listing: Listing) {
  if (listing.currency === "KES") {
    return currencyFormatter.format(listing.price);
  }

  return `${listing.currency} ${numberFormatter.format(listing.price)}`;
}

function vehicleTitle(listing: Listing) {
  return getListingDisplayTitle(listing);
}

function featureLabels(listing: Listing) {
  return (listing.features || [])
    .map(
      (feature) =>
        LISTING_FEATURE_INDEX[feature]?.label ?? formatListingLabel(feature),
    )
    .filter(Boolean)
    .slice(0, 8);
}

function buildVehicleFacts(listing: Listing) {
  return {
    id: listing.id,
    title: vehicleTitle(listing),
    year: listing.year,
    make: listing.make,
    model: listing.model,
    price: listing.price,
    priceLabel: formatPrice(listing),
    mileage: listing.mileage,
    mileageLabel:
      listing.mileage == null
        ? "Unknown"
        : `${numberFormatter.format(listing.mileage)} km`,
    bodyType: listing.body_type || "Unknown",
    transmission: listing.transmission || "Unknown",
    fuelType: listing.fuel_type || "Unknown",
    condition: formatListingCondition(listing.condition),
    trim: getListingTrim(listing) || "Unknown",
    variant: getListingVariant(listing) || "Unknown",
    engine: getListingEngineDisplacement(listing) || "Unknown",
    seats: listing.seats,
    driveType: listing.drive_type || "Unknown",
    location: getListingDisplayLocation(listing),
    features: featureLabels(listing),
    description: limitedText(listing.description, 220),
  };
}

function byLowestPrice(listings: Listing[]) {
  return [...listings].sort((left, right) => left.price - right.price)[0];
}

function byNewestYear(listings: Listing[]) {
  return [...listings].sort(
    (left, right) => right.year - left.year || left.price - right.price,
  )[0];
}

function byLowestMileage(listings: Listing[]) {
  return listings
    .filter((listing) => listing.mileage != null)
    .sort((left, right) => (left.mileage || 0) - (right.mileage || 0))[0];
}

function uniqueByVehicleAndReason(items: VehicleComparisonResult["bestFor"]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.vehicleId}:${item.reason}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildRuleModelInsights(listings: Listing[]): VehicleModelInsight[] {
  return listings.map((listing) => {
    const title = vehicleTitle(listing);
    const specBits = [
      listing.body_type ? `${formatListingLabel(listing.body_type)} body` : "",
      listing.fuel_type ? `${formatListingLabel(listing.fuel_type)} fuel` : "",
      listing.transmission
        ? `${formatListingLabel(listing.transmission)} transmission`
        : "",
    ].filter(Boolean);

    return {
      vehicleId: listing.id,
      title,
      modelSummary:
        specBits.length > 0
          ? `${title} sits in the comparison as a ${specBits.join(", ")}. From the listing alone, the useful model-level read is about the type of ownership experience it appears to target: space, running-cost profile, comfort expectations, and day-to-day practicality. Treat this as a starting point rather than a verdict on the exact unit, then use the seller conversation and inspection to confirm service history, condition, paperwork, and equipment.`
          : `${title} needs richer listing details before model-level fit can be judged confidently. The model may still be worth comparing, but buyers should first ask the seller to confirm core specifications, equipment, service history, and condition before leaning on model reputation or broad ownership expectations.`,
      buyerFit:
        listing.body_type || listing.seats
          ? `Best suited to buyers whose use case matches the listed ${[listing.body_type, listing.seats ? `${listing.seats}-seat` : ""].filter(Boolean).join(", ")} configuration and who are ready to verify the exact unit carefully.`
          : "Use the seller conversation and inspection to confirm whether this model fits your daily use case.",
      knownConsiderations: [
        "Confirm service history and ownership paperwork.",
        "Inspect actual features against the listing.",
        "Use a mechanic for final condition checks.",
      ],
      researchedSpecs: [],
    };
  });
}

function buildRuleModelComparisons(listings: Listing[]) {
  if (listings.length < 2) {
    return [];
  }

  const classLine = listings
    .map(
      (listing) =>
        `${vehicleTitle(listing)}: ${formatListingLabel(listing.body_type) || "body type not listed"}`,
    )
    .join(" | ");
  const fuelLine = listings
    .map(
      (listing) =>
        `${vehicleTitle(listing)}: ${formatListingLabel(listing.fuel_type) || "fuel type not listed"}`,
    )
    .join(" | ");

  return [
    `Model classes differ across this set: ${classLine}.`,
    `Compare running-cost expectations from the listed fuel types: ${fuelLine}.`,
  ];
}

function buildRuleComparison(listings: Listing[]): VehicleComparisonResult {
  const selected = listings.slice(0, 3);
  const cheapest = byLowestPrice(selected);
  const newest = byNewestYear(selected);
  const lowestMileage = byLowestMileage(selected);
  const years = selected.map((listing) => listing.year);
  const prices = selected.map((listing) => listing.price);
  const comparedTitles = selected.map(vehicleTitle);

  const bestFor = uniqueByVehicleAndReason(
    [
      cheapest
        ? {
            vehicleId: cheapest.id,
            title: vehicleTitle(cheapest),
            reason: `Best upfront value at ${formatPrice(cheapest)}.`,
          }
        : null,
      newest
        ? {
            vehicleId: newest.id,
            title: vehicleTitle(newest),
            reason: `Newest model year in this comparison (${newest.year}).`,
          }
        : null,
      lowestMileage
        ? {
            vehicleId: lowestMileage.id,
            title: vehicleTitle(lowestMileage),
            reason: `Lowest listed mileage at ${numberFormatter.format(lowestMileage.mileage || 0)} km.`,
          }
        : null,
    ].filter((item): item is VehicleComparisonResult["bestFor"][number] =>
      Boolean(item),
    ),
  ).slice(0, 3);

  const priceSpread = Math.max(...prices) - Math.min(...prices);
  const yearSpread = Math.max(...years) - Math.min(...years);
  const tradeoffs = [
    priceSpread > 0
      ? `Price gap is ${currencyFormatter.format(priceSpread)}, so compare equipment and condition before choosing only on price.`
      : "Prices are closely matched, so mileage, condition, and seller confidence matter more.",
    yearSpread > 0
      ? `Model years differ by ${yearSpread} year${yearSpread === 1 ? "" : "s"}, which can affect resale value and feature expectations.`
      : "All selected vehicles share the same model year, making mileage and condition easier to compare.",
  ];

  const watchouts = selected
    .flatMap((listing) => {
      const missing = [
        listing.mileage == null ? "mileage" : "",
        !listing.transmission ? "transmission" : "",
        !listing.fuel_type ? "fuel type" : "",
        !listing.description ? "description" : "",
      ].filter(Boolean);

      return missing.length > 0
        ? [`${vehicleTitle(listing)} is missing ${missing.join(", ")}.`]
        : [];
    })
    .slice(0, 3);

  return {
    headline: `Vehicle comparison for ${comparedTitles.join(" vs ")}`,
    summary:
      selected.length < 2
        ? "Add another vehicle to compare model year, pricing, mileage, features, and seller details side by side."
        : `Compared by model year, price, mileage, and core specs, ${vehicleTitle(cheapest)} has the lowest listed price while ${vehicleTitle(newest)} has the newest model year.`,
    bestFor,
    modelInsights: buildRuleModelInsights(selected),
    modelComparisons: buildRuleModelComparisons(selected),
    tradeoffs,
    watchouts:
      watchouts.length > 0
        ? watchouts
        : [
            "Confirm service history, ownership documents, accident history, and final availability directly with the seller.",
          ],
    provider: "rules",
    model: null,
    researchMode: "listing_only",
    sources: [],
  };
}

function sanitizeStringArray(
  value: unknown,
  fallback: string[],
  limit: number,
) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value
    .map((item) => compactWhitespace(String(item ?? "")))
    .filter(Boolean)
    .slice(0, limit);

  return items.length > 0 ? items : fallback;
}

function sanitizeModelInsights(
  value: unknown,
  fallback: VehicleModelInsight[],
  listings: Listing[],
) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const validIds = new Set(listings.map((listing) => listing.id));
  const titleById = new Map(
    listings.map((listing) => [listing.id, vehicleTitle(listing)]),
  );
  const fallbackById = new Map(fallback.map((item) => [item.vehicleId, item]));
  const insights = value
    .map((item) => {
      const vehicleId = compactWhitespace(item?.vehicleId);
      const fallbackInsight = fallbackById.get(vehicleId);
      const title = titleById.get(vehicleId) || compactWhitespace(item?.title);
      const modelSummary = limitedText(item?.modelSummary, 1200);
      const buyerFit = limitedText(item?.buyerFit, 520);
      const knownConsiderations = sanitizeStringArray(
        item?.knownConsiderations,
        fallbackInsight?.knownConsiderations || [],
        4,
      );
      const researchedSpecs = Array.isArray(item?.researchedSpecs)
        ? item.researchedSpecs
            .map((specification: { label?: string; value?: string }) => ({
              label: limitedText(specification?.label, 48),
              value: limitedText(specification?.value, 180),
            }))
            .filter((specification: { label: string; value: string }) =>
              Boolean(specification.label && specification.value),
            )
            .slice(0, 8)
        : fallbackInsight?.researchedSpecs || [];

      return {
        vehicleId,
        title,
        modelSummary,
        buyerFit,
        knownConsiderations,
        researchedSpecs,
      };
    })
    .filter(
      (item) =>
        validIds.has(item.vehicleId) && item.modelSummary && item.buyerFit,
    )
    .slice(0, 3);

  return insights.length > 0 ? insights : fallback;
}

function mentionsAnyModelYear(
  value: string | null | undefined,
  listings: Listing[],
) {
  const text = compactWhitespace(value);
  return listings.some((listing) => text.includes(String(listing.year)));
}

function sanitizeAiComparison(
  data: Partial<VehicleComparisonResult>,
  base: VehicleComparisonResult,
  listings: Listing[],
): Omit<
  VehicleComparisonResult,
  "provider" | "model" | "researchMode" | "sources"
> {
  const validIds = new Set(listings.map((listing) => listing.id));
  const titleById = new Map(
    listings.map((listing) => [listing.id, vehicleTitle(listing)]),
  );
  const bestFor = Array.isArray(data.bestFor)
    ? data.bestFor
        .map((item) => ({
          vehicleId: compactWhitespace(item?.vehicleId),
          title: compactWhitespace(item?.title),
          reason: compactWhitespace(item?.reason),
        }))
        .filter((item) => validIds.has(item.vehicleId) && item.reason)
        .map((item) => ({
          vehicleId: item.vehicleId,
          title: titleById.get(item.vehicleId) || item.title,
          reason: item.reason,
        }))
        .slice(0, 3)
    : [];

  return {
    headline: mentionsAnyModelYear(data.headline, listings)
      ? limitedText(data.headline, 120) || base.headline
      : base.headline,
    summary: limitedText(data.summary, 420) || base.summary,
    bestFor: bestFor.length > 0 ? bestFor : base.bestFor,
    modelInsights: sanitizeModelInsights(
      data.modelInsights,
      base.modelInsights,
      listings,
    ),
    modelComparisons: sanitizeStringArray(
      data.modelComparisons,
      base.modelComparisons,
      4,
    ),
    tradeoffs: sanitizeStringArray(data.tradeoffs, base.tradeoffs, 4),
    watchouts: sanitizeStringArray(data.watchouts, base.watchouts, 4),
  };
}

async function researchVehicleModels(listings: Listing[]) {
  const researchContext = listings.map((listing) => ({
    vehicleId: listing.id,
    title: vehicleTitle(listing),
    year: listing.year,
    make: listing.make,
    model: listing.model,
    trim: getListingTrim(listing) || "Unknown",
    variant: getListingVariant(listing) || "Unknown",
    bodyType: listing.body_type || "Unknown",
    fuelType: listing.fuel_type || "Unknown",
    transmission: listing.transmission || "Unknown",
  }));
  const prompt = [
    "Research every vehicle below for a Kenyan used-car buyer.",
    "Search the web before answering.",
    "Prioritize manufacturer brochures/manuals, government or safety authorities, and established automotive publications.",
    "Do not use marketplace advertisements as authoritative specification sources.",
    "Return exactly one modelInsights entry for each supplied vehicleId.",
    "Write a 60 to 90 word modelSummary covering ownership character, practical strengths, and inspection priorities.",
    "Keep buyerFit under 35 words and provide exactly 3 knownConsiderations under 14 words each.",
    `For researchedSpecs, use only these exact labels and include only fields supported by sources: ${RESEARCHED_SPECIFICATION_LABELS.join(", ")}.`,
    "Label market- or trim-dependent details clearly. Typical model-year information must not be presented as proof about the exact seller vehicle.",
    `Vehicle identities from the seller listings: ${JSON.stringify(researchContext)}`,
  ].join("\n");

  const response = await generateOpenAiWebJson<{
    modelInsights: VehicleModelInsight[];
  }>({
    prompt,
    schema: buildWebResearchSchema(listings.map((listing) => listing.id)),
    maxTokens: 2600,
    timeoutMs: Math.max(VEHICLE_WEB_RESEARCH_TIMEOUT_MS, 60000),
  });

  if (!response || response.sources.length === 0) return null;

  const fallback = buildRuleModelInsights(listings);
  const insights = sanitizeModelInsights(
    response.data.modelInsights,
    fallback,
    listings,
  );

  return {
    insights,
    model: response.model,
    sources: response.sources,
  };
}

export async function generateVehicleComparison(
  listings: Listing[],
): Promise<VehicleComparisonResult> {
  const selected = listings.slice(0, 3);
  const base = buildRuleComparison(selected);

  if (selected.length < 2) {
    return base;
  }

  const aiConfig = getAiProviderConfig();
  if (!aiConfig.enabled) {
    return base;
  }

  if (aiConfig.provider === "openai") {
    try {
      const research = await researchVehicleModels(selected);

      if (research) {
        const insightByVehicle = new Map(
          research.insights.map((insight) => [insight.vehicleId, insight]),
        );

        return {
          ...base,
          modelInsights: base.modelInsights.map(
            (insight) => insightByVehicle.get(insight.vehicleId) || insight,
          ),
          provider: "openai",
          model: research.model,
          researchMode: "web",
          sources: research.sources,
        };
      }
    } catch {
      // Continue to the unsourced model comparison, then rules, if web research is unavailable.
    }
  }

  const facts = selected.map(buildVehicleFacts);
  const prompt = [
    "You help Kenyan car buyers compare selected marketplace vehicle listings.",
    "Return strict JSON only with keys: headline, summary, bestFor, modelInsights, modelComparisons, tradeoffs, watchouts.",
    "bestFor must be an array of objects with keys: vehicleId, title, reason.",
    "modelInsights must be an array of objects with keys: vehicleId, title, modelSummary, buyerFit, knownConsiderations.",
    "modelComparisons must be exactly 2 to 4 short strings comparing the model lines against each other, not just the exact listed units.",
    "Every vehicle reference must include the model year with make and model.",
    "Use supplied facts for exact listing claims and mention uncertainty when details are missing.",
    "Never present general model knowledge as proof about this exact listed unit.",
    "Do not invent market prices, service history, accident history, ownership history, or financing.",
    "Keep summary under 75 words and other list items under 24 words.",
    `Vehicles: ${JSON.stringify(facts)}`,
    `Rule baseline: ${JSON.stringify({
      summary: base.summary,
      bestFor: base.bestFor,
      tradeoffs: base.tradeoffs,
      watchouts: base.watchouts,
    })}`,
  ].join("\n");

  try {
    const response = await generateAiJson<Partial<VehicleComparisonResult>>({
      prompt,
      maxTokens: 1500,
      timeoutMs: VEHICLE_COMPARISON_TIMEOUT_MS,
    });

    if (!response) {
      return base;
    }

    const sanitized = sanitizeAiComparison(response.data, base, selected);

    return {
      ...sanitized,
      modelInsights: sanitized.modelInsights.map((insight) => ({
        ...insight,
        researchedSpecs: [],
      })),
      provider: response.provider === "openai" ? "openai" : "local_llm",
      model: response.model,
      researchMode: "model",
      sources: [],
    };
  } catch {
    return base;
  }
}

export const buildRuleVehicleComparisonForTest = buildRuleComparison;
