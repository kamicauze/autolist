import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { publicPageMetadata } from "@/lib/seo";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DealerPageClient } from "@/components/dealers/dealer-page-client";
import {
  getDealerById,
  getDealerInventory,
} from "@/lib/data/dealers";
import {
  DEALER_INVENTORY_PAGE_SIZE,
  getDealerInventoryHref,
  parseDealerInventorySort,
} from "@/lib/dealers/inventory";
import { buildDealerPublicLinks } from "@/lib/dealers/public-links";
import { getNewestListings } from "@/lib/data/listings";
import { getPublicSellerReviewsData } from "@/lib/data/reviews";
import { getGoogleMapsApiKey } from "@/lib/server/google-maps";

interface DealerDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ page?: string; sortBy?: string | string[] }>;
}

const getPublicDealer = cache(getDealerById);

export async function generateMetadata({ params, searchParams }: DealerDetailPageProps) {
  const dealer = await getPublicDealer((await params).id);
  if (!dealer) notFound();
  const query = await searchParams;
  const page = Number(query?.page);
  const sorted = parseDealerInventorySort(query?.sortBy) !== "newest";
  const suffix = Number.isSafeInteger(page) && page > 1 ? `?page=${page}` : "";
  const location = dealer.city || "Kenya";
  return publicPageMetadata({
    title: `${dealer.name} — Vehicles for Sale in ${location}${suffix ? `, Page ${page}` : ""}`,
    description: dealer.about_text || `Browse available vehicles from ${dealer.name} in ${location}. View dealership details and contact this approved Autolist dealer.`,
    path: sorted ? null : `/dealers/${dealer.id}${suffix}`, noIndex: sorted, image: dealer.logo_url,
  });
}

export default async function DealerDetailPage({ params, searchParams }: DealerDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const requestedPage = Number(query?.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const sortBy = parseDealerInventorySort(query?.sortBy);
  const googleMapsApiKey = getGoogleMapsApiKey();

  const [dealer, inventory, newestListings] = await Promise.all([
    getPublicDealer(id),
    getDealerInventory(id, page, sortBy),
    getNewestListings(12),
  ]);

  if (!dealer) {
    notFound();
  }

  const totalPages = Math.max(1, Math.ceil(inventory.total / DEALER_INVENTORY_PAGE_SIZE));
  if (page > totalPages) {
    redirect(getDealerInventoryHref(id, totalPages, sortBy));
  }

  // Dealer listings are owned by the dealer's profile, so reviews key off it.
  const reviewsData = await getPublicSellerReviewsData(dealer.profile_id);
  const publicLinks = buildDealerPublicLinks(dealer);

  // The client receives validated public links instead of raw link fields.
  const publicDealer = {
    ...dealer,
    website: null,
    social_links: dealer.social_links
      ? Object.fromEntries(Object.entries(dealer.social_links).filter(([key]) =>
          !["facebook", "instagram", "linkedin", "x", "tiktok", "other"].includes(key)
        ))
      : null,
  };

  const recommendedListings = newestListings.filter(
    (listing) => listing.dealer?.id !== dealer.id
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Used cars for sale", href: "/search" },
              { label: "Dealers", href: "/dealers" },
              { label: dealer.name },
            ]}
            className="mb-4"
          />

          <DealerPageClient
            dealer={publicDealer}
            publicLinks={publicLinks}
            inventory={inventory.listings}
            inventoryTotal={inventory.total}
            inventoryPage={page}
            inventorySort={sortBy}
            recommendedListings={recommendedListings}
            googleMapsApiKey={googleMapsApiKey}
            reviewsData={reviewsData}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
