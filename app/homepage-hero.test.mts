import assert from "node:assert/strict";
import { isValidElement, type ReactElement } from "react";
import { mock, test } from "node:test";

type Block = { block_key: string; status: string; published_content: unknown; draft_content?: unknown };
let blocks: Block[] = [];
let banners: Array<{ id: string }> = [];

mock.module("server-only", { namedExports: {} });
mock.module("next/cache", { namedExports: { unstable_cache: (fn: unknown) => fn } });
mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
  const url = new URL(input instanceof Request ? input.url : input);
  assert.equal(url.pathname, "/rest/v1/cms_blocks");
  assert.equal(url.searchParams.get("status"), "eq.published");
  return Response.json(blocks.filter((block) => block.status === "published"));
});
mock.module("@/lib/supabase/config", { namedExports: {
  getSupabasePublicEnv: () => ({ url: "https://homepage.example", anonKey: "public-key" }),
} });
mock.module("@/lib/supabase/server", { namedExports: {
  createClient: () => {}, getAuthUser: async () => ({ data: { user: null } }),
} });
mock.module("@/lib/data/listings", { namedExports: { countMatchingListings: async () => 0, getNewestListings: async () => [] } });
mock.module("@/lib/data/featured-listing-pins", { namedExports: { getHomepageFeaturedListings: async () => [] } });
mock.module("@/lib/data/favorites", { namedExports: { getDashboardFavoritesData: async () => [] } });
mock.module("@/lib/data/car-data", { namedExports: {
  getAllMakeNames: async () => [], getPopularMakes: async () => [], getPopularModels: async () => [],
} });
mock.module("@/lib/data/cms-banners", { namedExports: { getActiveCmsBanners: async () => banners } });

for (const [path, names] of Object.entries({
  "layout/header": ["Header"], "layout/footer": ["Footer"],
  "home/hero-search": ["HeroSearch"], "home/advertising-banner": ["AdvertisingBanner"],
  "home/listings-section": ["ListingsSection", "ListingsSectionSkeleton"],
  "home/brand-logos": ["BrandLogos"], "home/how-it-works": ["HowItWorks"],
  "home/discover-more": ["DiscoverMore"], "home/popular-searches": ["PopularSearches"],
  "home/sell-vehicle-section": ["SellVehicleSection"], "home/video-section": ["VideoSection"],
  "home/services-section": ["ServicesSection"], "home/news-section": ["NewsSection"],
  "cms/public-cms-banners": ["PublicCmsBannerPlacement"], "cms/public-special-offers": ["PublicSpecialOffers"],
})) {
  mock.module(new URL(`../components/${path}.tsx`, import.meta.url).href, { namedExports: Object.fromEntries(names.map((name) => [name, () => null])) });
}

const { default: Home } = await import("./page");
const { HeroSearch } = await import("@/components/home/hero-search");
const { DEFAULT_HOME_HERO_CMS_CONTENT } = await import("@/lib/types/cms");

function findHeroLoader(node: unknown): ReactElement<{ content: unknown; hasPublishedHero: boolean }> | undefined {
  if (Array.isArray(node)) return node.map(findHeroLoader).find(Boolean);
  if (!isValidElement<Record<string, unknown>>(node)) return;
  if ("hasPublishedHero" in node.props) return node as ReturnType<typeof findHeroLoader>;
  return findHeroLoader(node.props.children);
}

async function loadHero() {
  const loader = findHeroLoader(await Home());
  assert.ok(loader);
  const loaderProps = loader.props;
  const render = loader.type as (props: typeof loaderProps) => Promise<ReactElement<Record<string, unknown>>>;
  const hero = await render(loaderProps);
  assert.equal(hero.type, HeroSearch);
  return hero.props;
}

test("published hero changes reach the homepage instead of the fixed advertising artwork", async () => {
  const content = { ...DEFAULT_HOME_HERO_CMS_CONTENT, headline: "Fresh homepage headline", backgroundImageUrl: "/published-hero.webp",
    carouselEnabled: true, slides: [{ id: "primary", imageUrl: "/published-hero.webp", altText: "Published hero" }], quickSearchEnabled: false };
  blocks = [{ block_key: "home_hero", status: "published", published_content: content, draft_content: { ...content, headline: "Unpublished edit" } }];
  const hero = await loadHero();
  assert.equal(hero.heroArtwork, undefined);
  assert.deepEqual(hero.content, content);
});

test("an unpublished hero keeps the advertising fallback", async () => {
  blocks = [{ block_key: "home_hero", status: "draft", published_content: null, draft_content: DEFAULT_HOME_HERO_CMS_CONTENT }];
  assert.ok((await loadHero()).heroArtwork);
  blocks = [];
  assert.ok((await loadHero()).heroArtwork);
});

test("an active sponsored hero is not hidden by the advertising fallback", async () => {
  blocks = [];
  banners = [{ id: "homepage-sponsor" }];
  const hero = await loadHero();
  assert.equal(hero.heroArtwork, undefined);
  assert.equal(hero.heroBanner, banners[0]);
  banners = [];
});
