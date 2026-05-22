"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompare } from "@/lib/hooks/use-compare";
import { Listing } from "@/lib/types/listing";
import { COMPARE_MAX_ITEMS } from "@/lib/utils/compare";
import { getImageUrl } from "@/lib/utils/listings";
import { LISTING_FEATURE_INDEX } from "@/lib/constants/marketplace";
import { formatListingCondition, formatListingLabel } from "@/lib/utils/listing-details";
import {
  getListingDisplayLocation,
  getListingDisplayTitle,
  getListingEngineDisplacement,
  getListingTrim,
  getListingVariant,
} from "@/lib/utils/vehicle-display";

interface ComparePageClientProps {
  initialIds: string[];
}

type RowDefinition = {
  label: string;
  getValue: (listing: Listing) => string;
};

const numberFormatter = new Intl.NumberFormat("en-KE");

function listingTitle(listing: Listing): string {
  return getListingDisplayTitle(listing);
}

function listingImage(listing: Listing): string {
  const firstImage = [...(listing.images || [])]
    .sort((a, b) => a.image_order - b.image_order)
    .at(0);

  if (!firstImage) {
    return "/placeholder-car.jpg";
  }

  return getImageUrl(firstImage.r2_key, "card");
}

function formatUnknownValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number") {
    return numberFormatter.format(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item) => formatUnknownValue(item))
      .filter((item): item is string => Boolean(item));

    return items.length > 0 ? items.join(", ") : null;
  }

  return null;
}

function metadataValue(listing: Listing, keys: string[]): string | null {
  const metadata = listing.metadata;

  if (!metadata) {
    return null;
  }

  for (const key of keys) {
    const value = formatUnknownValue(metadata[key]);

    if (value) {
      return value;
    }
  }

  return null;
}

function valueOrDash(value: string | null): string {
  if (!value) {
    return "-";
  }

  return value;
}

function getFeatureLabels(listing: Listing) {
  const features = listing.features || [];
  return features
    .map((feature) => LISTING_FEATURE_INDEX[feature]?.label ?? formatListingLabel(feature))
    .filter(Boolean);
}

function ComparisonTable({
  sectionTitle,
  rows,
  listings,
}: {
  sectionTitle: string;
  rows: RowDefinition[];
  listings: Listing[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <div className="min-w-[860px]">
        <div className="grid grid-cols-[220px_repeat(3,minmax(0,1fr))] border-b border-gray-200 bg-gray-50">
          <div className="px-5 py-3 text-sm font-semibold text-gray-900">{sectionTitle}</div>
          {Array.from({ length: COMPARE_MAX_ITEMS }).map((_, index) => {
            const listing = listings[index];

            return (
              <div
                key={`${sectionTitle}-header-${index}`}
                className="px-5 py-3 text-center text-xs font-medium text-gray-600"
              >
                {listing ? `${listing.make} ${listing.model}` : `Vehicle ${index + 1}`}
              </div>
            );
          })}
        </div>

        {rows.map((row, rowIndex) => {
          return (
            <div
              key={row.label}
              className={`grid grid-cols-[220px_repeat(3,minmax(0,1fr))] border-b border-gray-100 last:border-b-0 ${
                rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50/40"
              }`}
            >
              <div className="px-5 py-4 text-sm font-medium text-gray-900">{row.label}</div>
              {Array.from({ length: COMPARE_MAX_ITEMS }).map((_, index) => {
                const listing = listings[index];
                const value = listing ? row.getValue(listing) : "-";

                return (
                  <div
                    key={`${row.label}-${index}`}
                    className="px-5 py-4 text-center text-sm text-gray-700"
                  >
                    {value}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeatureTagsComparison({ listings }: { listings: Listing[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <div className="grid min-w-[860px] grid-cols-3 divide-x divide-gray-100">
        {Array.from({ length: COMPARE_MAX_ITEMS }).map((_, index) => {
          const listing = listings[index];
          const features = listing ? getFeatureLabels(listing) : [];

          return (
            <div key={`features-${index}`} className="p-5">
              <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                {listing ? `${listing.make} ${listing.model}` : `Vehicle ${index + 1}`}
              </p>
              {features.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {features.map((feature) => (
                    <span
                      key={`${listing?.id}-${feature}`}
                      className="rounded-full border border-[#d8e3ff] bg-[#f8fbff] px-3 py-1.5 text-xs font-medium text-[#3157c8]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500">No features listed.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ComparePageClient({ initialIds }: ComparePageClientProps) {
  const {
    ids,
    isLoaded,
    maxItems,
    setCompareIds,
    removeFromCompare,
    clearCompare,
  } = useCompare();
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const hasInitialized = React.useRef(false);

  React.useEffect(() => {
    if (!isLoaded || hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    if (initialIds.length === 0) {
      return;
    }

    const currentIds = ids.slice(0, COMPARE_MAX_ITEMS);
    const sameIds =
      currentIds.length === initialIds.length &&
      currentIds.every((id, index) => id === initialIds[index]);

    if (!sameIds) {
      setCompareIds(initialIds);
    }
  }, [ids, initialIds, isLoaded, setCompareIds]);

  React.useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (ids.length === 0) {
      setListings([]);
      setFetchError(null);
      return;
    }

    let isCancelled = false;

    async function loadListings() {
      setIsFetching(true);
      setFetchError(null);

      try {
        const response = await fetch(`/api/listings/compare?ids=${encodeURIComponent(ids.join(","))}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load comparison vehicles");
        }

        const payload = (await response.json()) as { listings?: Listing[] };
        const fetchedListings = Array.isArray(payload.listings) ? payload.listings : [];

        if (!isCancelled) {
          setListings(fetchedListings);
        }
      } catch {
        if (!isCancelled) {
          setListings([]);
          setFetchError("Unable to load selected vehicles right now.");
        }
      } finally {
        if (!isCancelled) {
          setIsFetching(false);
        }
      }
    }

    void loadListings();

    return () => {
      isCancelled = true;
    };
  }, [ids, isLoaded]);

  const selectedListings = React.useMemo(() => {
    const map = new Map(listings.map((listing) => [listing.id, listing]));

    return ids
      .map((id) => map.get(id))
      .filter((listing): listing is Listing => Boolean(listing));
  }, [ids, listings]);

  const overviewRows = React.useMemo<RowDefinition[]>(
    () => [
      {
        label: "Price",
        getValue: (listing) => `${listing.currency} ${numberFormatter.format(listing.price)}`,
      },
      {
        label: "Fuel Type",
        getValue: (listing) => valueOrDash(listing.fuel_type),
      },
      {
        label: "Kms Driven",
        getValue: (listing) =>
          listing.mileage !== null ? `${numberFormatter.format(listing.mileage)} kms` : "-",
      },
      {
        label: "Ownership",
        getValue: (listing) =>
          valueOrDash(metadataValue(listing, ["ownership", "owner_type", "number_of_owners"])),
      },
      {
        label: "Registration Year",
        getValue: (listing) => String(listing.year),
      },
      {
        label: "Trim",
        getValue: (listing) => valueOrDash(getListingTrim(listing)),
      },
      {
        label: "Model Variant",
        getValue: (listing) => valueOrDash(getListingVariant(listing)),
      },
      {
        label: "Transmission",
        getValue: (listing) => valueOrDash(listing.transmission),
      },
      {
        label: "Insurance Type",
        getValue: (listing) =>
          valueOrDash(metadataValue(listing, ["insurance_type", "insurance", "insurance_cover"])),
      },
      {
        label: "Seats",
        getValue: (listing) => valueOrDash(metadataValue(listing, ["seats"])),
      },
      {
        label: "Engine Displacement",
        getValue: (listing) => valueOrDash(getListingEngineDisplacement(listing)),
      },
      {
        label: "Car location",
        getValue: (listing) => valueOrDash(getListingDisplayLocation(listing)),
      },
    ],
    []
  );

  const specificationRows = React.useMemo<RowDefinition[]>(
    () => [
      {
        label: "Engine and transmission",
        getValue: (listing) => {
          const engine = metadataValue(listing, ["engine_displacement", "engine_capacity", "engine_cc"]);
          const transmission = valueOrDash(listing.transmission);
          const variant = getListingVariant(listing);
          if (variant) {
            return transmission !== "-" ? `${variant} / ${transmission}` : variant;
          }
          return engine ? `${engine} / ${transmission}` : transmission;
        },
      },
      {
        label: "Dimensions & capacity",
        getValue: (listing) => {
          const seats = metadataValue(listing, ["seats"]);
          const bodyType = listing.body_type || "Vehicle";
          return seats ? `${bodyType}, ${seats} seats` : bodyType;
        },
      },
      {
        label: "Miscellaneous",
        getValue: (listing) => {
          const condition = listing.condition || "-";
          const color = listing.color || "-";
          return `${formatListingCondition(condition)}, ${formatListingLabel(color) || "-"}`;
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Compare Vehicles</h1>
            <p className="mt-1 text-sm text-gray-600">
              Add up to {maxItems} vehicles to compare key specs side by side.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/search">Add vehicles</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearCompare}
              disabled={ids.length === 0}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: maxItems }).map((_, index) => {
            const listing = selectedListings[index];

            if (!listing) {
              return (
                <Link
                  key={`slot-${index}`}
                  href="/search"
                  className="flex h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center transition-colors hover:border-primary hover:bg-blue-50"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500">
                    <Plus className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Add vehicle to compare</p>
                  <p className="mt-1 text-xs text-gray-500">Slot {index + 1} of {COMPARE_MAX_ITEMS}</p>
                </Link>
              );
            }

            return (
              <div key={listing.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="relative h-40 w-full bg-gray-100">
                  <Image
                    src={listingImage(listing)}
                    alt={listingTitle(listing)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <button
                    type="button"
                    onClick={() => removeFromCompare(listing.id)}
                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-sm transition-colors hover:bg-white"
                    aria-label={`Remove ${listingTitle(listing)} from compare`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <p className="text-xs text-gray-500">{listing.body_type || "Vehicle"}</p>
                    <h3 className="line-clamp-1 text-sm font-semibold text-gray-900">{listingTitle(listing)}</h3>
                    <p className="mt-1 text-base font-semibold text-primary">
                      {listing.currency} {numberFormatter.format(listing.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/vehicle/${listing.id}`}>View vehicle</Link>
                    </Button>
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-700">
                      <Check className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {fetchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {fetchError}
        </div>
      )}

      {isFetching && (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600">
          Loading selected vehicles...
        </div>
      )}

      {!isFetching && selectedListings.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center">
          <p className="text-base font-medium text-gray-900">No vehicles selected for comparison yet.</p>
          <p className="mt-2 text-sm text-gray-600">Add vehicles from listing cards or the vehicle details page.</p>
          <Button asChild className="mt-4">
            <Link href="/search">Browse vehicles</Link>
          </Button>
        </div>
      )}

      {!isFetching && selectedListings.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          {selectedListings.length < 2 && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              Add at least one more vehicle for a meaningful side-by-side comparison.
            </div>
          )}

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-gray-100 p-1">
              <TabsTrigger
                value="overview"
                className="rounded-lg py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="rounded-lg py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Features
              </TabsTrigger>
              <TabsTrigger
                value="specification"
                className="rounded-lg py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Specification
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-5">
              <ComparisonTable
                sectionTitle="Car Overview"
                rows={overviewRows}
                listings={selectedListings}
              />
            </TabsContent>

            <TabsContent value="features" className="mt-5">
              <FeatureTagsComparison listings={selectedListings} />
            </TabsContent>

            <TabsContent value="specification" className="mt-5">
              <ComparisonTable
                sectionTitle="Specification"
                rows={specificationRows}
                listings={selectedListings}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
