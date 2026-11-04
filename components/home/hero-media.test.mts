import assert from "node:assert/strict";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mock, test } from "node:test";
import type { CmsBanner } from "@/lib/types/cms-banners";

const imageCalls: Array<Record<string, unknown>> = [];
mock.module("next/image", { defaultExport: (props: Record<string, unknown>) => {
  imageCalls.push(props);
  return createElement("img", { src: props.src as string, alt: props.alt as string });
} });
mock.module("next/link", { defaultExport: ({ href, children }: { href: string; children: ReactNode }) => createElement("a", { href }, children) });
mock.module("next/navigation", { namedExports: { useRouter: () => ({ push: () => {} }), notFound: () => { throw new Error("Not found"); } } });
mock.module("@/hooks/use-car-models", { namedExports: { useCarModels: () => ({ models: [], isLoading: false }) } });
mock.module("@/components/ui/searchable-select", { namedExports: { SearchableSelect: () => null } });
mock.module("@/components/ui/numeric-combo-input", { namedExports: { NumericComboInput: () => null } });
mock.module("@/components/search/filter-sheet", { namedExports: { FilterSheet: () => null } });
mock.module("./quick-search-dialog", { namedExports: { QuickSearchDialog: () => null } });
mock.module("@/components/cms/cms-tracking", { namedExports: { trackCmsBannerClick: () => {}, useCmsBannerImpressions: () => null } });
mock.module("@/components/layout/header", { namedExports: { Header: () => null } });
mock.module("@/components/layout/footer", { namedExports: { Footer: () => null } });
mock.module("@/components/cms/public-cms-banners", { namedExports: {
  PublicCmsBannerPlacement: () => null,
  PublicCmsAdGrid: ({ children }: { children: ReactNode }) => children,
} });
let detailCampaign: CmsBanner;
mock.module("@/lib/data/cms-banners", { namedExports: { getActiveCmsBannerBySlug: async () => detailCampaign } });
const { HeroSearch } = await import("./hero-search");
const { default: AdDetailPage } = await import("../../app/ads/[slug]/page");
const { DEFAULT_HOME_HERO_CMS_CONTENT } = await import("@/lib/types/cms");

const campaign: CmsBanner = {
  id: "42584788-16db-4e3e-bc8a-faa10ccb999b", title: "Sample sponsor", slug: "sample-sponsor",
  placement: "home_hero", categoryTargets: [], status: "active", desktopImageUrl: "/sample-desktop.webp",
  mobileImageUrl: "/sample-mobile.webp", altText: "Sample sponsor creative", summary: null, body: null,
  ctaLabel: null, targetUrl: null, startsAt: null, endsAt: null, sortOrder: 0, impressionCount: 0,
  clickCount: 0, createdBy: null, createdAt: "2026-11-04T00:00:00Z", updatedAt: "2026-11-04T00:00:00Z", isCurrentlyLive: true,
};
const carousel = {
  ...DEFAULT_HOME_HERO_CMS_CONTENT,
  carouselEnabled: true,
  slides: [
    { id: "first", imageUrl: "/normal-first.webp", altText: "First normal slide" },
    { id: "second", imageUrl: "/normal-second.webp", altText: "Second normal slide" },
  ],
};

function pictureMarkup(html: string) {
  return html.match(/<picture>.*?<\/picture>/)?.[0] ?? "";
}

test("sponsored homepage hero renders optional mobile source and retains Image priority props", () => {
  imageCalls.length = 0;
  const html = renderToStaticMarkup(createElement(HeroSearch, { makes: [], totalCount: 0, content: carousel, heroBanner: campaign }));
  assert.match(pictureMarkup(html), /<picture><source srcSet="\/sample-mobile.webp" media="\(max-width: 640px\)"\/><img src="\/sample-desktop.webp"/);
  assert.deepEqual(imageCalls.filter(({ src }) => src === campaign.desktopImageUrl).map(({ src, fill, priority, quality, sizes }) => ({ src, fill, priority, quality, sizes })), [
    { src: "/sample-desktop.webp", fill: true, priority: true, quality: 95, sizes: "(min-width: 1280px) 1280px, 100vw" },
  ]);
  assert.doesNotMatch(html, /Show next hero image/);
});

test("sponsored homepage hero without mobile creative retains the desktop fallback", () => {
  const html = renderToStaticMarkup(createElement(HeroSearch, { makes: [], totalCount: 0, heroBanner: { ...campaign, mobileImageUrl: null } }));
  assert.match(html, /<img src="\/sample-desktop.webp"/);
  assert.doesNotMatch(html, /<source /);
});

test("ordinary homepage carousel keeps its first image, priority and navigation controls", () => {
  imageCalls.length = 0;
  const html = renderToStaticMarkup(createElement(HeroSearch, { makes: [], totalCount: 0, content: carousel }));
  assert.equal(imageCalls[0]?.src, "/normal-first.webp");
  assert.equal(imageCalls[0]?.priority, true);
  assert.match(html, /Show previous hero image/);
  assert.match(html, /Show next hero image/);
  assert.match(html, /Show hero image 2/);
  assert.doesNotMatch(html, /<source /);
});

test("ad detail renders its mobile creative with desktop fallback when configured", async () => {
  detailCampaign = campaign;
  const html = renderToStaticMarkup(await AdDetailPage({ params: Promise.resolve({ slug: campaign.slug! }) }));
  assert.match(pictureMarkup(html), /<picture><source srcSet="\/sample-mobile.webp" media="\(max-width: 640px\)"\/><img src="\/sample-desktop.webp"/);
  detailCampaign = { ...campaign, mobileImageUrl: null };
  const fallback = renderToStaticMarkup(await AdDetailPage({ params: Promise.resolve({ slug: campaign.slug! }) }));
  assert.match(fallback, /<img src="\/sample-desktop.webp"/);
  assert.doesNotMatch(fallback, /<source /);
});
