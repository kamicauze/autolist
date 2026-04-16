import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getListingById, getSimilarListings } from "@/lib/data/listings";
import { getListingPricePositioning } from "@/lib/data/market-insights";
import { VehiclePageClient } from "@/components/vehicle/vehicle-page-client";
import { getListingDisplayTitle } from "@/lib/utils/vehicle-display";

interface VehiclePageProps {
  params: Promise<{ id: string }>;
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  const similarListings = await getSimilarListings(listing, 4);
  const pricePositioning = await getListingPricePositioning(listing);

  const title = getListingDisplayTitle(listing);
  const location = listing.dealer?.city || "Kenya";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "All car listings", href: "/search" },
            ]}
            className="mb-4"
          />

          {/* Page Content */}
          <Suspense fallback={<div className="h-[1200px] animate-pulse rounded-2xl bg-white" aria-hidden />}>
            <VehiclePageClient
              listing={listing}
              similarListings={similarListings}
              pricePositioning={pricePositioning}
              title={title}
              location={location}
            />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
