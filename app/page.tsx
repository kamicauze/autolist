import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSearch } from "@/components/home/hero-search";
import { ListingsSection, ListingsSectionSkeleton } from "@/components/home/listings-section";
import { BrandLogos } from "@/components/home/brand-logos";
import { FeaturesSection } from "@/components/home/features-section";
import { getFeaturedListings, getNewestListings } from "@/lib/data/listings";

async function ListingsData() {
  const [featuredListings, newestListings] = await Promise.all([
    getFeaturedListings(8),
    getNewestListings(8),
  ]);

  return (
    <ListingsSection
      title="Your recent activities"
      featuredListings={featuredListings}
      newestListings={newestListings}
    />
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section with Search */}
        <HeroSearch />

        {/* Listings Section with Suspense for loading state */}
        <Suspense fallback={<ListingsSectionSkeleton />}>
          <ListingsData />
        </Suspense>

        {/* Brand Logos */}
        <BrandLogos />

        {/* Features Section */}
        <FeaturesSection />
      </main>

      <Footer />
    </div>
  );
}
