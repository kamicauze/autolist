import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DealerPageClient } from "@/components/dealers/dealer-page-client";
import {
  getDealerById,
  getDealerInventory,
  getDealerPublicLinks,
} from "@/lib/data/dealers";
import { getNewestListings } from "@/lib/data/listings";
import { getPublicSellerReviewsData } from "@/lib/data/reviews";
import { getGoogleMapsApiKey } from "@/lib/server/google-maps";

interface DealerDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export default async function DealerDetailPage({ params, searchParams }: DealerDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const requestedPage = Number(query?.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const googleMapsApiKey = getGoogleMapsApiKey();

  const [dealer, inventory, newestListings] = await Promise.all([
    getDealerById(id),
    getDealerInventory(id, page),
    getNewestListings(12),
  ]);

  if (!dealer) {
    notFound();
  }

  if (page > Math.max(1, Math.ceil(inventory.total / 12))) {
    redirect(`/dealers/${id}?page=${Math.max(1, Math.ceil(inventory.total / 12))}#inventory`);
  }

  // Dealer listings are owned by the dealer's profile, so reviews key off it.
  const [reviewsData, publicLinks] = await Promise.all([
    getPublicSellerReviewsData(dealer.profile_id),
    getDealerPublicLinks(dealer),
  ]);

  // Public URLs are supplied only through the entitlement-checked links above.
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
