import { LISTING_FEATURE_INDEX } from "@/lib/constants/marketplace";

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const definitions = Object.values(LISTING_FEATURE_INDEX);

/** Match only equipment from the seller's feature catalog, never inferred equipment. */
export function requestedListingFeatures(query: string): string[] {
  const text = ` ${normalize(query)} `;
  const matches = definitions.flatMap((feature) =>
    [feature.label, ...(feature.label === "Bluetooth Connectivity" ? ["Bluetooth"] : []), ...(feature.aliases ?? [])].flatMap((name) => {
      const phrase = normalize(name);
      if (phrase.length < 3 || !text.includes(` ${phrase} `)) return [];
      if (["without", "no", "not"].some((prefix) => text.includes(` ${prefix} ${phrase} `))) return [];
      return [{ label: feature.label, phrase }];
    })
  ).sort((a, b) => b.phrase.length - a.phrase.length);
  const accepted: typeof matches = [];
  for (const match of matches) {
    if (!accepted.some((other) => other.label === match.label || other.phrase.includes(match.phrase))) accepted.push(match);
  }
  return accepted.map((match) => match.label);
}

export function featureOnlyQuery(query?: string | string[]): string[] {
  const terms = (Array.isArray(query) ? query : [query ?? ""]).flatMap((value) => value.split(",")).map(normalize).filter(Boolean);
  const labels = terms.map((term) => definitions.find((feature) => normalize(feature.label) === term)?.label);
  return terms.length && labels.every(Boolean) ? [...new Set(labels as string[])] : [];
}

export function listingHasRequestedFeatures(features: string[] | null, requested: string[]): boolean {
  const provided = new Set((features ?? []).map(normalize));
  return requested.every((label) => {
    const definition = definitions.find((feature) => feature.label === label);
    return [label, definition?.id ?? "", ...(definition?.aliases ?? [])].some((value) => value && provided.has(normalize(value)));
  });
}
