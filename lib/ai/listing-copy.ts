import { generateAiJson, getAiProviderConfig } from "@/lib/ai/provider";
import type { ListingCopyInput, ListingCopySuggestion } from "@/lib/types/listing-copy";

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function titleCase(value: string | null | undefined) {
  if (!value) return "";
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(" ");
}

function buildRuleTitle(input: ListingCopyInput) {
  const parts = [
    input.year ? String(input.year) : "",
    titleCase(input.make),
    titleCase(input.model),
    titleCase(input.bodyType),
  ].filter(Boolean);

  const tail = [
    input.mileage ? `${input.mileage.toLocaleString()} km` : "",
    titleCase(input.transmission),
    input.condition === "foreign_used"
      ? "Foreign used"
      : input.condition === "locally_used"
        ? "Locally used"
        : titleCase(input.condition),
  ].filter(Boolean);

  return compactWhitespace([...parts, tail[0] ? `- ${tail.join(", ")}` : ""].join(" "));
}

function buildRuleDescription(input: ListingCopyInput) {
  const sentences: string[] = [];
  const heading = [
    input.year ? String(input.year) : "",
    titleCase(input.make),
    titleCase(input.model),
  ]
    .filter(Boolean)
    .join(" ");

  if (heading) {
    sentences.push(
      `${heading} available in ${input.locationArea || input.cityTown || "Kenya"} at ${new Intl.NumberFormat(
        "en-KE",
        { style: "currency", currency: "KES", maximumFractionDigits: 0 }
      ).format(input.price || 0)}.`
    );
  }

  const specBits = [
    input.bodyType ? `${titleCase(input.bodyType)} body` : "",
    input.fuelType ? `${titleCase(input.fuelType)} engine` : "",
    input.transmission ? `${titleCase(input.transmission)} transmission` : "",
    input.color ? `${titleCase(input.color)} finish` : "",
  ].filter(Boolean);

  if (specBits.length > 0) {
    sentences.push(`Key specs include ${specBits.join(", ")}.`);
  }

  if (input.mileage) {
    sentences.push(`Mileage stands at approximately ${input.mileage.toLocaleString()} km.`);
  }

  if (input.features.length > 0) {
    const featureSample = input.features.slice(0, 5).join(", ");
    sentences.push(`Notable features include ${featureSample}.`);
  }

  if (input.description.trim()) {
    sentences.push(compactWhitespace(input.description));
  } else {
    sentences.push(
      "Well-kept vehicle with clean presentation, ready for viewing and buyer inspection."
    );
  }

  sentences.push(
    "Contact the seller for viewing arrangements, ownership details, and any additional questions."
  );

  return compactWhitespace(sentences.join(" "));
}

function buildRuleTips(input: ListingCopyInput, suggestion: Omit<ListingCopySuggestion, "tips" | "provider" | "model">) {
  const tips: string[] = [];

  if (!input.title.trim() || input.title.trim().length < suggestion.title.length) {
    tips.push("Use the suggested title if you want a cleaner marketplace headline with stronger vehicle keywords.");
  }

  if (!input.description.trim() || input.description.trim().length < 120) {
    tips.push("Add ownership, service history, and accident status to make the description more trustworthy.");
  }

  if (!input.mileage) {
    tips.push("Mileage is still missing from the listing details, so add it before publishing.");
  }

  if (input.features.length < 3) {
    tips.push("Select a few confirmed features so the generated copy can speak more specifically about the vehicle.");
  }

  return tips.slice(0, 3);
}

function buildRuleSuggestion(input: ListingCopyInput): ListingCopySuggestion {
  const suggestion = {
    title: buildRuleTitle(input),
    description: buildRuleDescription(input),
  };

  return {
    ...suggestion,
    tips: buildRuleTips(input, suggestion),
    provider: "rules",
    model: null,
  };
}

export async function generateListingCopySuggestion(
  input: ListingCopyInput
): Promise<ListingCopySuggestion> {
  const base = buildRuleSuggestion(input);
  const aiConfig = getAiProviderConfig();

  if (!aiConfig.enabled) {
    return base;
  }

  try {
    const prompt = [
      "You improve vehicle marketplace listing copy.",
      "Return strict JSON only with keys: title, description, tips.",
      "Title rules: under 90 characters, factual, no hype, include make/model/year when available.",
      "Description rules: 80 to 160 words, plain language, no invented facts, no bullet points, no markdown.",
      "Tips rules: exactly 3 short actionable strings.",
      "Do not mention features that are not in the input.",
      "",
      `Category: ${input.category || "vehicle"}`,
      `Current title: ${input.title || "None"}`,
      `Current description: ${input.description || "None"}`,
      `Condition: ${input.condition || "Unknown"}`,
      `Price: ${input.price || 0}`,
      `Make: ${input.make || "Unknown"}`,
      `Model: ${input.model || "Unknown"}`,
      `Year: ${input.year || "Unknown"}`,
      `Transmission: ${input.transmission || "Unknown"}`,
      `Fuel type: ${input.fuelType || "Unknown"}`,
      `Body type: ${input.bodyType || "Unknown"}`,
      `Mileage: ${input.mileage || "Unknown"}`,
      `Color: ${input.color || "Unknown"}`,
      `Location: ${[input.locationArea, input.cityTown].filter(Boolean).join(", ") || "Unknown"}`,
      `Features: ${input.features.join(" | ") || "None"}`,
      `Rule title: ${base.title}`,
      `Rule description: ${base.description}`,
    ].join("\n");

    const response = await generateAiJson<{
      title?: string;
      description?: string;
      tips?: string[];
    }>({
      prompt,
      maxTokens: 320,
    });

    if (!response) {
      return base;
    }

    return {
      title: compactWhitespace(response.data.title || base.title).slice(0, 120) || base.title,
      description: compactWhitespace(response.data.description || base.description) || base.description,
      tips:
        response.data.tips?.map((tip) => compactWhitespace(tip)).filter(Boolean).slice(0, 3) ||
        base.tips,
      provider: response.provider === "openai" ? "openai" : "local_llm",
      model: response.model,
    };
  } catch {
    return base;
  }
}
