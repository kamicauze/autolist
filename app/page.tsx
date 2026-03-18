import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSearch } from "@/components/home/hero-search";
import { ListingsSection, ListingsSectionSkeleton } from "@/components/home/listings-section";
import { BrandLogos } from "@/components/home/brand-logos";
import { HowItWorks } from "@/components/home/how-it-works";
import { DiscoverMore } from "@/components/home/discover-more";
import { SellVehicleSection } from "@/components/home/sell-vehicle-section";
import { VideoSection } from "@/components/home/video-section";
import { ServicesSection } from "@/components/home/services-section";
import { NewsSection } from "@/components/home/news-section";
import { SocialMediaSection } from "@/components/home/social-media-section";
import {
  countMatchingListings,
  getFeaturedListings,
  getNewestListings,
} from "@/lib/data/listings";
import { getAllMakeNames } from "@/lib/data/car-data";

async function RecentActivitiesData() {
  const [featuredListings, newestListings] = await Promise.all([
    getFeaturedListings(4),
    getNewestListings(4),
  ]);

  return (
    <ListingsSection
      title="Your recent activities"
      featuredListings={featuredListings}
      newestListings={newestListings}
    />
  );
}

async function HeroSearchWithData() {
  const [makes, totalCount] = await Promise.all([
    getAllMakeNames(),
    countMatchingListings(),
  ]);
  return <HeroSearch makes={makes} totalCount={totalCount} />;
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section with Search */}
        <Suspense fallback={<div className="h-[320px] sm:h-[400px] md:h-[460px]" aria-hidden />}>
          <HeroSearchWithData />
        </Suspense>

        {/* Recent Activities Section */}
        <Suspense fallback={<ListingsSectionSkeleton />}>
          <RecentActivitiesData />
        </Suspense>

        {/* How Autolist Works */}
        <HowItWorks />

        {/* Discover More from Autolist */}
        <DiscoverMore />

        {/* Sell Your Vehicle Section */}
        <SellVehicleSection />

        {/* Video/Reviews Section */}
        <VideoSection />

        {/* Services Section */}
        <ServicesSection />

        {/* News Section */}
        <NewsSection />

        {/* What would you like to find? */}
        <BrandLogos />

        {/* Follow us on social media */}
        <SocialMediaSection />
      </main>

      <Footer />
    </div>
  );
}
