import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSearch } from "@/components/home/hero-search";
import { ListingsSection, ListingsSectionSkeleton } from "@/components/home/listings-section";
import { BrandLogos } from "@/components/home/brand-logos";
import { HowItWorks } from "@/components/home/how-it-works";
import { DiscoverMore } from "@/components/home/discover-more";
import { SellVehicleSection } from "@/components/home/sell-vehicle-section";
import { SpecialTools } from "@/components/home/special-tools";
import { VideoSection } from "@/components/home/video-section";
import { ServicesSection } from "@/components/home/services-section";
import { NewsSection } from "@/components/home/news-section";
import { getFeaturedListings, getNewestListings } from "@/lib/data/listings";

async function RecentActivitiesData() {
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

        {/* Recent Activities Section */}
        <Suspense fallback={<ListingsSectionSkeleton />}>
          <RecentActivitiesData />
        </Suspense>

        {/* Brand Logos - What would you like to find? */}
        <BrandLogos />

        {/* How Autolist Works */}
        <HowItWorks />

        {/* Discover More from Autolist */}
        <DiscoverMore />

        {/* Sell Your Vehicle Section */}
        <SellVehicleSection />

        {/* Special Tools */}
        <SpecialTools />

        {/* Video/Reviews Section */}
        <VideoSection />

        {/* Services Section */}
        <ServicesSection />

        {/* News Section */}
        <NewsSection />
      </main>

      <Footer />
    </div>
  );
}
