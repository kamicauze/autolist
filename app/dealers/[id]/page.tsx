import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DealerPageClient } from "@/components/dealers/dealer-page-client";
import {
  getDealerById,
  getDealerInventory,
} from "@/lib/data/dealers";
import { getNewestListings } from "@/lib/data/listings";
import { getGoogleMapsApiKey } from "@/lib/server/google-maps";

interface DealerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DealerDetailPage({ params }: DealerDetailPageProps) {
  const { id } = await params;
  const googleMapsApiKey = getGoogleMapsApiKey();

  const [dealer, inventory, newestListings] = await Promise.all([
    getDealerById(id),
    getDealerInventory(id, 8),
    getNewestListings(12),
  ]);

  if (!dealer) {
    notFound();
  }

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
            dealer={dealer}
            inventory={inventory}
            recommendedListings={recommendedListings}
            googleMapsApiKey={googleMapsApiKey}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
