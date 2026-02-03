import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getListingById, getSimilarListings } from "@/lib/data/listings";
import { VehiclePageClient } from "@/components/vehicle/vehicle-page-client";

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

  const title = `${listing.year} ${listing.make} ${listing.model}`;
  const location = listing.dealer?.city || "Kenya";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Used cars for sale", href: "/search" },
              { label: listing.body_type || "Vehicle", href: `/search?bodyType=${listing.body_type}` },
              { label: listing.make, href: `/search?make=${listing.make}` },
              { label: title },
            ]}
            className="mb-4"
          />

          {/* Page Content */}
          <VehiclePageClient
            listing={listing}
            similarListings={similarListings}
            title={title}
            location={location}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
