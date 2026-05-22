import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  PublicCmsAdGrid,
  PublicCmsBannerPlacement,
} from "@/components/cms/public-cms-banners";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserFavoriteListingIds } from "@/lib/data/favorites";
import { getListingById, getSimilarListings } from "@/lib/data/listings";
import { getListingPricePositioning } from "@/lib/data/market-insights";
import { getListingReviewsData } from "@/lib/data/reviews";
import { getGoogleMapsApiKey } from "@/lib/server/google-maps";
import { VehiclePageClient } from "@/components/vehicle/vehicle-page-client";
import { getListingDisplayLocation, getListingDisplayTitle } from "@/lib/utils/vehicle-display";

interface VehiclePageProps {
  params: Promise<{ id: string }>;
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [similarListings, pricePositioning, listingReviewsData] = await Promise.all([
    getSimilarListings(listing, 4),
    getListingPricePositioning(listing),
    getListingReviewsData(listing.id),
  ]);

  const favoriteListingIds = user
    ? await getCurrentUserFavoriteListingIds([
        listing.id,
        ...similarListings.map((item) => item.id),
      ])
    : [];

  const viewerProfile = user
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", user.id)
        .maybeSingle<{ id: string; full_name: string | null }>()
    : { data: null, error: null };

  const googleMapsApiKey = getGoogleMapsApiKey();
  const title = getListingDisplayTitle(listing);
  const location = getListingDisplayLocation(listing);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <PublicCmsAdGrid placement="vehicle_detail" contentClassName="py-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "All car listings", href: "/search" },
            ]}
            className="mb-4"
          />
          <PublicCmsBannerPlacement
            placement="listing_global_top"
            variant="compact"
            className="mb-6 max-w-none px-0 py-0"
          />

          <Suspense fallback={<div className="h-[1200px] animate-pulse rounded-2xl bg-white" aria-hidden />}>
            <VehiclePageClient
              listing={listing}
              similarListings={similarListings}
              pricePositioning={pricePositioning}
              listingReviewsData={listingReviewsData}
              viewer={
                user
                  ? {
                      id: user.id,
                      email: user.email ?? null,
                      fullName: viewerProfile.data?.full_name ?? null,
                    }
                  : null
              }
              initialIsFavorited={favoriteListingIds.includes(listing.id)}
              favoriteListingIds={favoriteListingIds}
              title={title}
              location={location}
              googleMapsApiKey={googleMapsApiKey}
            />
          </Suspense>
        </PublicCmsAdGrid>
      </main>

      <Footer />
    </div>
  );
}
