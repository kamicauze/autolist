import { KENYA_COUNTIES } from "@/lib/constants/filters";

export type DealerAddress = {
  address: string;
  town: string;
  county: string;
  area: string;
};

export type DealerAddressSuggestion = {
  placeId: string;
  label: string;
  detail: string;
};

export type GoogleAddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

type GooglePrediction = {
  placeId?: string;
  structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } };
};

const PLACES_URL = "https://places.googleapis.com/v1";
const administrativeUnit = /\b(?:division|ward|sub[-\s]?county|location|constituency)$/i;

function countyKey(name: string) {
  return name.toLowerCase().replace(/\bcounty\b/g, "").replace(/[^a-z]/g, "");
}

function placesHeaders(fieldMask?: string) {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) throw new Error("Address search is not configured.");
  return {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": key,
    ...(fieldMask ? { "X-Goog-FieldMask": fieldMask } : {}),
  };
}

export function toDealerAddress(label: string, components: GoogleAddressComponent[]): DealerAddress | null {
  const part = (type: string) => components.find((component) => component.types?.includes(type))?.longText?.trim() || "";
  if (components.find((component) => component.types?.includes("country"))?.shortText !== "KE") return null;
  const street = [part("street_number"), part("route")].filter(Boolean).join(" ");
  const address = [...new Set([label.trim(), street].filter(Boolean))].join(", ");
  if (!address) return null;
  const countyName = part("administrative_area_level_1");
  const county = countyName ? KENYA_COUNTIES.find((known) => countyKey(known) === countyKey(countyName)) : undefined;
  const area = ["sublocality_level_1", "sublocality", "neighborhood"]
    .map(part)
    .find((name) => name && !administrativeUnit.test(name));
  return {
    address,
    town: part("locality") || part("postal_town"),
    county: county || "",
    area: area || "",
  };
}

export async function findDealerAddresses(query: string, sessionToken: string): Promise<DealerAddressSuggestion[]> {
  const response = await fetch(`${PLACES_URL}/places:autocomplete`, {
    method: "POST",
    headers: placesHeaders(),
    body: JSON.stringify({ input: query, includedRegionCodes: ["ke"], languageCode: "en", sessionToken }),
    signal: AbortSignal.timeout(5_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Address search is unavailable.");
  const result: { suggestions?: { placePrediction?: GooglePrediction }[] } = await response.json();
  return (result.suggestions ?? []).flatMap(({ placePrediction }) => {
    const label = placePrediction?.structuredFormat?.mainText?.text?.trim();
    if (!placePrediction?.placeId || !label) return [];
    return [{ placeId: placePrediction.placeId, label, detail: placePrediction.structuredFormat?.secondaryText?.text?.trim() || "" }];
  });
}

export async function getDealerAddress(placeId: string, label: string, sessionToken: string) {
  const url = new URL(`${PLACES_URL}/places/${encodeURIComponent(placeId)}`);
  url.search = new URLSearchParams({ sessionToken, languageCode: "en", regionCode: "ke" }).toString();
  const response = await fetch(url, {
    headers: placesHeaders("addressComponents"),
    signal: AbortSignal.timeout(5_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Address lookup is unavailable.");
  const place: { addressComponents?: GoogleAddressComponent[] } = await response.json();
  return toDealerAddress(label, place.addressComponents ?? []);
}
