import Link from "next/link";
import { CarCard } from "@/components/ui/car-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IconChevronRight } from "@/components/ui/icons";
import type { Listing } from "@/lib/types/listing";
import {
  DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT,
  type HomepageFeaturedListingsCmsContent,
} from "@/lib/types/cms";
import { getImageUrl } from "@/lib/utils/listings";
import {
  getListingDisplayTitle,
  getListingSubtitle,
} from "@/lib/utils/vehicle-display";
import { formatListingLabel } from "@/lib/utils/listing-details";

interface ListingsSectionProps {
  title: string;
  featuredListings: Listing[];
  newestListings: Listing[];
  showTabs?: boolean;
  content?: HomepageFeaturedListingsCmsContent;
}

/**
 * Picks which 4 featured listings to display based on the current time.
 * Rotates to a different set of 4 every 8 hours (3 rotations per day).
 * Uses a deterministic shuffle so every visitor sees the same set during
 * the same 8-hour window.
 */
function getRotatedFeatured(listings: Listing[], count: number): Listing[] {
  if (listings.length <= count) return listings;

  // 8-hour rotation window: 0-7, 8-15, 16-23
  const hoursPerWindow = 8;
  const currentWindow = Math.floor(Date.now() / (hoursPerWindow * 60 * 60 * 1000));

  // Deterministic shuffle using the window as seed
  const shuffled = [...listings];
  let seed = currentWindow;
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    const j = seed % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

export function ListingsSection({
  title,
  featuredListings,
  newestListings,
  showTabs = true,
  content,
}: ListingsSectionProps) {
  const sectionContent = content ?? DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT;
  const displayListings =
    featuredListings.length > 0 ? featuredListings : newestListings;

  const rotatedFeatured = getRotatedFeatured(featuredListings, sectionContent.featuredLimit);
  const tabsEnabled = showTabs && sectionContent.showTabs;

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="h4">{title}</h2>
          <Link href="/search">
            <Button variant="ghost" className="gap-2">
              {sectionContent.viewAllLabel}
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {tabsEnabled ? (
          <Tabs defaultValue="featured" className="w-full">
            <TabsList className="mb-6 bg-transparent p-0 gap-2">
              <TabsTrigger
                value="featured"
                className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white border border-border data-[state=active]:border-primary"
              >
                Recently viewed
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white border border-border data-[state=active]:border-primary"
              >
                Recently added
              </TabsTrigger>
              {sectionContent.showFavoritesTab ? (
                <TabsTrigger
                  value="favorites"
                  className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white border border-border data-[state=active]:border-primary"
                >
                  Favourites
                </TabsTrigger>
              ) : null}
            </TabsList>

            {/* Recently viewed placeholder uses the rotated featured set until personalized activity is available. */}
            <TabsContent value="featured">
              <ListingsGrid listings={rotatedFeatured} />
            </TabsContent>

            {/* Recent — shows 4 */}
            <TabsContent value="recent">
              <ListingsGrid listings={newestListings.slice(0, sectionContent.recentLimit)} />
            </TabsContent>

            {/* Favorites — shows 4 */}
            {sectionContent.showFavoritesTab ? (
              <TabsContent value="favorites">
                <ListingsGrid listings={newestListings.slice(0, sectionContent.recentLimit)} />
              </TabsContent>
            ) : null}
          </Tabs>
        ) : (
          <ListingsGrid listings={displayListings} />
        )}
      </div>
    </section>
  );
}

function ListingsGrid({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return <EmptyState message="No listings available at the moment." />;
  }

  return (
    <div className="flex snap-x gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
      {listings.map((listing) => {
        const sortedImages = (listing.images || [])
          .sort((a, b) => a.image_order - b.image_order)
          .map((img) => getImageUrl(img.r2_key, "card"));

        const sellerName =
          listing.dealer?.name ||
          listing.seller?.full_name ||
          "Private Seller";

        return (
          <div key={listing.id} className="w-[82vw] shrink-0 snap-start sm:w-auto">
            <CarCard
              id={listing.id}
              title={getListingDisplayTitle(listing)}
              subtitle={getListingSubtitle(listing)}
              bodyType={formatListingLabel(listing.body_type) || "Vehicle"}
              year={listing.year}
              mileage={
                listing.mileage
                  ? `${listing.mileage.toLocaleString()} kms`
                  : "N/A"
              }
              fuelType={formatListingLabel(listing.fuel_type) || "N/A"}
              transmission={formatListingLabel(listing.transmission) || "N/A"}
              price={listing.price}
              currency={listing.currency}
              images={
                sortedImages.length > 0 ? sortedImages : ["/placeholder-car.jpg"]
              }
              isFeatured={true}
              seller={{
                name: sellerName,
                avatarUrl:
                  listing.dealer?.logo_url ||
                  listing.seller?.avatar_url ||
                  undefined,
              }}
              href={`/vehicle/${listing.id}`}
            />
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <svg
          className="h-12 w-12 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <p className="text-muted-foreground">{message}</p>
      <Link href="/search" className="mt-4">
        <Button>Browse Vehicles</Button>
      </Link>
    </div>
  );
}

// Loading skeleton component
export function ListingsSectionSkeleton() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
        </div>

        <div className="h-10 w-64 bg-muted rounded mb-6 animate-pulse" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-muted animate-pulse">
              <div className="h-56 bg-muted-foreground/10 rounded-t-xl" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-16 bg-muted-foreground/10 rounded" />
                <div className="h-5 w-full bg-muted-foreground/10 rounded" />
                <div className="h-4 w-3/4 bg-muted-foreground/10 rounded" />
                <div className="h-6 w-1/2 bg-muted-foreground/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
