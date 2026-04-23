export type SeedListingLocation = {
  cityTown: string;
  locationArea: string;
};

const SEED_LISTING_LOCATIONS: SeedListingLocation[] = [
  { cityTown: "Nairobi", locationArea: "Westlands" },
  { cityTown: "Nairobi", locationArea: "Karen" },
  { cityTown: "Nairobi", locationArea: "Kilimani" },
  { cityTown: "Mombasa", locationArea: "Nyali" },
  { cityTown: "Mombasa", locationArea: "Bamburi" },
  { cityTown: "Kisumu", locationArea: "Milimani" },
  { cityTown: "Nakuru", locationArea: "Lanet" },
  { cityTown: "Eldoret", locationArea: "Elgon View" },
  { cityTown: "Kiambu", locationArea: "Ruaka" },
  { cityTown: "Thika", locationArea: "Makongeni" },
  { cityTown: "Naivasha", locationArea: "Lake View" },
  { cityTown: "Machakos", locationArea: "Athi River" },
];

function hashSeed(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function pickSeedListingLocation(seed: string | number): SeedListingLocation {
  const normalizedSeed = String(seed).trim() || "autolist-seed";
  const index = hashSeed(normalizedSeed) % SEED_LISTING_LOCATIONS.length;
  return SEED_LISTING_LOCATIONS[index];
}

export function mergeSeedListingLocationMetadata(
  metadata: Record<string, unknown> | null | undefined,
  seed: string | number
) {
  const location = pickSeedListingLocation(seed);

  return {
    ...(metadata && typeof metadata === "object" ? metadata : {}),
    cityTown: location.cityTown,
    locationArea: location.locationArea,
  };
}
