import { KENYA_COUNTIES } from "@/lib/constants/filters";

export type DealerAddress = {
  address: string;
  town: string;
  county: string;
  area: string;
};

type PhotonAddress = {
  name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  district?: string;
  county?: string;
  state?: string;
  countrycode?: string;
};

function countyKey(name: string) {
  return name.toLowerCase().replace(/\bcounty\b/g, "").replace(/[^a-z]/g, "");
}

export function toDealerAddress(place: PhotonAddress): DealerAddress | null {
  if (place.countrycode !== "KE") return null;
  const street = [place.housenumber, place.street].filter(Boolean).join(" ");
  const address = [...new Set([place.name, street].filter(Boolean))].join(", ");
  if (!address) return null;
  const county = [place.state, place.county].flatMap((name) => name
    ? KENYA_COUNTIES.filter((known) => countyKey(known) === countyKey(name))
    : [])[0];
  return {
    address,
    town: place.city || "",
    county: county || "",
    area: place.district || "",
  };
}

export async function findDealerAddresses(query: string) {
  const url = new URL("https://photon.komoot.io/api/");
  url.search = new URLSearchParams({ q: query, countrycode: "KE", limit: "6", lang: "en" }).toString();
  const response = await fetch(url, { signal: AbortSignal.timeout(5_000), cache: "no-store" });
  if (!response.ok) throw new Error("Address search is unavailable.");
  const result: { features: { properties: PhotonAddress }[] } = await response.json();
  const seen = new Set<string>();
  return result.features.flatMap(({ properties }) => {
    const location = toDealerAddress(properties);
    if (!location) return [];
    const key = JSON.stringify(location);
    if (seen.has(key)) return [];
    seen.add(key);
    return [location];
  });
}
