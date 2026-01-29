import Link from "next/link";
import { CarCard } from "@/components/ui/car-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IconChevronRight } from "@/components/ui/icons";
import type { Listing } from "@/lib/types/listing";
import { getImageUrl } from "@/lib/data/listings";

interface ListingsSectionProps {
  title: string;
  featuredListings: Listing[];
  newestListings: Listing[];
}

export function ListingsSection({
  title,
  featuredListings,
  newestListings,
}: ListingsSectionProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="h4">{title}</h2>
          <Link href="/search">
            <Button variant="ghost" className="gap-2">
              View all
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="recent">Recent Viewed</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="featured">
            <ListingsGrid listings={featuredListings} />
          </TabsContent>

          <TabsContent value="recent">
            <ListingsGrid listings={newestListings} />
          </TabsContent>

          <TabsContent value="favorites">
            <EmptyState message="No favorites yet. Start browsing to save your favorite vehicles." />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function ListingsGrid({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return <EmptyState message="No listings available at the moment." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {listings.map((listing) => {
        // Sort images by order and convert to URLs
        const sortedImages = (listing.images || [])
          .sort((a, b) => a.image_order - b.image_order)
          .map((img) => getImageUrl(img.r2_key));

        const sellerName =
          listing.dealer?.name ||
          listing.seller?.full_name ||
          "Private Seller";

        return (
          <CarCard
            key={listing.id}
            id={listing.id}
            title={`${listing.year} ${listing.make} ${listing.model}`}
            bodyType={listing.body_type || "Vehicle"}
            year={listing.year}
            mileage={listing.mileage ? `${listing.mileage.toLocaleString()} kms` : "N/A"}
            fuelType={listing.fuel_type || "N/A"}
            transmission={listing.transmission || "N/A"}
            price={listing.price}
            currency={listing.currency}
            images={sortedImages.length > 0 ? sortedImages : ["/placeholder-car.jpg"]}
            isFeatured={true}
            seller={{
              name: sellerName,
              avatarUrl: listing.dealer?.logo_url || listing.seller?.avatar_url || undefined,
            }}
            href={`/vehicle/${listing.id}`}
          />
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
          {Array.from({ length: 8 }).map((_, i) => (
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
