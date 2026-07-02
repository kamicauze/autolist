import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IconChevronRight } from "@/components/ui/icons";
import type { Listing } from "@/lib/types/listing";
import {
  DEFAULT_HOME_FEATURED_LISTINGS_CMS_CONTENT,
  type HomepageFeaturedListingsCmsContent,
} from "@/lib/types/cms";
import { EmptyState, ListingsGrid } from "./listings-grid";
import { RecentlyViewedListings } from "./recently-viewed-listings";

interface ListingsSectionProps {
  title: string;
  featuredListings: Listing[];
  newestListings: Listing[];
  favoriteListings?: Listing[];
  isAuthenticated?: boolean;
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
  favoriteListings = [],
  isAuthenticated = false,
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
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="h4">{title}</h2>
          <Link href="/search" className="self-start sm:self-auto">
            <Button variant="ghost" className="gap-2">
              {sectionContent.viewAllLabel}
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {tabsEnabled ? (
          <Tabs defaultValue="featured" className="w-full">
            <div className="-mx-4 mb-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mb-6 sm:px-0 sm:pb-0">
              <TabsList className="h-auto min-w-max justify-start gap-2 bg-transparent p-0">
                <TabsTrigger
                  value="featured"
                  className="rounded-full border border-border px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white sm:px-6"
                >
                  Featured
                </TabsTrigger>
                <TabsTrigger
                  value="viewed"
                  className="rounded-full border border-border px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white sm:px-6"
                >
                  Recently viewed
                </TabsTrigger>
                <TabsTrigger
                  value="recent"
                  className="rounded-full border border-border px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white sm:px-6"
                >
                  Recently added
                </TabsTrigger>
                {sectionContent.showFavoritesTab ? (
                  <TabsTrigger
                    value="favorites"
                    className="rounded-full border border-border px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white sm:px-6"
                  >
                    Favourites
                  </TabsTrigger>
                ) : null}
              </TabsList>
            </div>

            <TabsContent value="featured">
              <ListingsGrid listings={rotatedFeatured} />
            </TabsContent>

            <TabsContent value="viewed">
              <RecentlyViewedListings limit={sectionContent.recentLimit} />
            </TabsContent>

            <TabsContent value="recent">
              <ListingsGrid listings={newestListings.slice(0, sectionContent.recentLimit)} />
            </TabsContent>

            {sectionContent.showFavoritesTab ? (
              <TabsContent value="favorites">
                {favoriteListings.length > 0 ? (
                  <ListingsGrid listings={favoriteListings.slice(0, sectionContent.recentLimit)} />
                ) : (
                  <EmptyState
                    message={
                      isAuthenticated
                        ? "Tap the heart on a listing to save it here."
                        : "Log in and tap the heart on a listing to save it here."
                    }
                  />
                )}
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
