import Link from "next/link";
import { Inbox } from "lucide-react";
import { CarCard } from "@/components/ui/car-card";
import { Button } from "@/components/ui/button";
import { Illustration3D } from "@/components/ui/icon-3d";
import type { Listing } from "@/lib/types/listing";
import { getListingCardProps } from "@/lib/utils/listing-card-props";

export function ListingsGrid({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return <EmptyState message="No listings available at the moment." />;
  }

  return (
    <div className="flex snap-x gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
      {listings.map((listing) => (
        <div key={listing.id} className="w-[82vw] max-w-full shrink-0 snap-start sm:w-auto">
          <CarCard {...getListingCardProps(listing)} />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Illustration3D
        asset="empty-listings"
        fallbackIcon={Inbox}
        size="xl"
        tone="neutral"
        className="mb-4 h-24 w-24 [&>svg]:h-12 [&>svg]:w-12"
      />
      <p className="text-muted-foreground">{message}</p>
      <Link href="/search" className="mt-4">
        <Button>Browse Vehicles</Button>
      </Link>
    </div>
  );
}
