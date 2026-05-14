import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSearch } from "@/components/home/hero-search";
import { ListingsSection, ListingsSectionSkeleton } from "@/components/home/listings-section";
import { BrandLogos } from "@/components/home/brand-logos";
import { HowItWorks } from "@/components/home/how-it-works";
import { DiscoverMore } from "@/components/home/discover-more";
import { PopularSearches } from "@/components/home/popular-searches";
import { SellVehicleSection } from "@/components/home/sell-vehicle-section";
import { VideoSection } from "@/components/home/video-section";
import { ServicesSection } from "@/components/home/services-section";
import { NewsSection } from "@/components/home/news-section";
import { SocialMediaSection } from "@/components/home/social-media-section";
import { PublicCmsBannerPlacement } from "@/components/cms/public-cms-banners";
import { PublicSpecialOffers } from "@/components/cms/public-special-offers";
import {
  countMatchingListings,
  getNewestListings,
} from "@/lib/data/listings";
import { getHomepageFeaturedListings } from "@/lib/data/featured-listing-pins";
import { getAllMakeNames, getPopularMakes } from "@/lib/data/car-data";
import { getHomepageCmsContent } from "@/lib/data/cms";
import { getActiveCmsBanners } from "@/lib/data/cms-banners";
import type { HomepageCmsContent } from "@/lib/types/cms";

async function RecentActivitiesData({
  content,
}: {
  content: HomepageCmsContent["featuredListings"];
}) {
  const [featuredListings, newestListings] = await Promise.all([
    getHomepageFeaturedListings(content.featuredLimit),
    getNewestListings(content.recentLimit),
  ]);

  return (
    <ListingsSection
      title={content.title}
      featuredListings={featuredListings}
      newestListings={newestListings}
      content={content}
    />
  );
}

async function HeroSearchWithData({ content }: { content: HomepageCmsContent["hero"] }) {
  const [makes, totalCount, heroBanners] = await Promise.all([
    getAllMakeNames(),
    countMatchingListings(),
    getActiveCmsBanners("home_hero", 1),
  ]);
  return (
    <HeroSearch
      makes={makes}
      totalCount={totalCount}
      content={content}
      heroBanner={heroBanners[0] ?? null}
    />
  );
}

const POPULAR_SEARCH_FALLBACKS = [
  "Toyota",
  "Nissan",
  "Mazda",
  "Subaru",
  "Honda",
  "Mercedes-Benz",
  "BMW",
  "Volkswagen",
];

async function PopularSearchesData() {
  const popularMakes = await getPopularMakes();
  const searches = (popularMakes.length > 0
    ? popularMakes.map((make) => make.name)
    : POPULAR_SEARCH_FALLBACKS
  )
    .slice(0, 8)
    .map((make) => ({
      label: make,
      href: `/search?make=${encodeURIComponent(make)}`,
    }));

  return <PopularSearches searches={searches} />;
}

export default async function Home() {
  const cmsContent = await getHomepageCmsContent();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section with Search */}
        <Suspense fallback={<div className="h-[320px] sm:h-[400px] md:h-[460px]" aria-hidden />}>
          <HeroSearchWithData content={cmsContent.hero} />
        </Suspense>

        <PublicCmsBannerPlacement placement="home_top" variant="full" />

        {/* Recent Activities Section */}
        <Suspense fallback={<ListingsSectionSkeleton />}>
          <RecentActivitiesData content={cmsContent.featuredListings} />
        </Suspense>

        <PublicCmsBannerPlacement placement="home_featured" variant="compact" />

        <PublicSpecialOffers />

        {/* How Autolist Works */}
        {cmsContent.sections.showHowItWorks ? <HowItWorks /> : null}

        {/* Discover More from Autolist */}
        {cmsContent.sections.showDiscoverMore ? <DiscoverMore /> : null}

        <Suspense fallback={<div className="h-[260px]" aria-hidden />}>
          <PopularSearchesData />
        </Suspense>

        {/* Sell Your Vehicle Section */}
        {cmsContent.sections.showSellVehicle ? <SellVehicleSection /> : null}

        {/* Video/Reviews Section */}
        {cmsContent.sections.showVideoReviews ? <VideoSection /> : null}

        {/* Services Section */}
        {cmsContent.sections.showServices ? <ServicesSection /> : null}

        {/* News Section */}
        {cmsContent.sections.showNews ? <NewsSection /> : null}

        {/* What would you like to find? */}
        {cmsContent.sections.showBrandLogos ? <BrandLogos /> : null}

        {/* Follow us on social media */}
        {cmsContent.sections.showSocialMedia ? <SocialMediaSection /> : null}
      </main>

      <Footer />
    </div>
  );
}
