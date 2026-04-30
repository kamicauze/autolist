"use client";

import * as React from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Clock3,
  Eye,
  FileText,
  Globe,
  Home,
  ImageIcon,
  LayoutTemplate,
  Save,
  Settings2,
} from "lucide-react";
import { saveCmsBlock } from "@/lib/actions/cms";
import { saveContentPage } from "@/lib/actions/content-pages";
import {
  AdminCmsMediaField,
  AdminCmsMediaLibrary,
} from "@/components/admin/admin-cms-media-library";
import {
  CMS_BLOCK_DEFINITIONS,
  type AdminHomepageCmsData,
  type CmsBlockKey,
  type CmsBlockRecord,
  type HomepageFeaturedListingsCmsContent,
  type HomepageHeroCmsContent,
  type HomepageSectionsCmsContent,
} from "@/lib/types/cms";
import {
  CONTENT_PAGE_DEFINITIONS,
  type AdminContentPagesData,
  type ContentPageRecord,
  type ContentPageStatus,
} from "@/lib/types/content-pages";
import type { AdminCmsMediaData, CmsMediaAsset } from "@/lib/types/cms-media";
import { cn } from "@/lib/utils";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
  adminGhostButtonClass,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSelectClass,
  adminSurfaceClass,
  adminTextareaClass,
} from "./admin-ui";

type FeedbackState =
  | {
      status: "success" | "error";
      message: string;
    }
  | null;

type ContentEditorState = {
  title: string;
  summary: string;
  body: string;
  status: ContentPageStatus;
  seoTitle: string;
  seoDescription: string;
};

type CmsArea = "homepage" | "pages" | "media";
type BlockPendingAction = "draft" | "publish" | null;

type BlockEditorMap = {
  home_hero: HomepageHeroCmsContent;
  home_featured_listings: HomepageFeaturedListingsCmsContent;
  home_sections: HomepageSectionsCmsContent;
};

const SECTION_TOGGLE_FIELDS: Array<{
  key: keyof HomepageSectionsCmsContent;
  label: string;
  description: string;
}> = [
  {
    key: "showHowItWorks",
    label: "How it works",
    description: "Buyer and seller process explanation.",
  },
  {
    key: "showDiscoverMore",
    label: "Discover more",
    description: "Secondary discovery modules below the listing rail.",
  },
  {
    key: "showSellVehicle",
    label: "Sell vehicle",
    description: "Seller acquisition section on the landing page.",
  },
  {
    key: "showVideoReviews",
    label: "Video and reviews",
    description: "Review/social proof media module.",
  },
  {
    key: "showServices",
    label: "Services",
    description: "Services and assistance blocks.",
  },
  {
    key: "showNews",
    label: "News",
    description: "Latest news/content strip.",
  },
  {
    key: "showBrandLogos",
    label: "Brand logos",
    description: "Popular makes and brand discovery.",
  },
  {
    key: "showSocialMedia",
    label: "Social media",
    description: "Follow/social channel footer module.",
  },
];

function toContentEditorState(page: ContentPageRecord): ContentEditorState {
  return {
    title: page.title,
    summary: page.summary ?? "",
    body: page.body,
    status: page.status,
    seoTitle: page.seoTitle ?? "",
    seoDescription: page.seoDescription ?? "",
  };
}

function formatDateTime(value: string | null) {
  if (!value) return "Not published yet";

  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusTone(status: ContentPageStatus) {
  return status === "published" ? ("green" as const) : ("amber" as const);
}

function getPageStats(pages: ContentPageRecord[]) {
  const publishedPages = pages.filter((page) => page.status === "published");
  const latestPublishedAt =
    publishedPages
      .map((page) => page.publishedAt)
      .filter((value): value is string => Boolean(value))
      .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] ?? null;

  return {
    total: pages.length,
    published: publishedPages.length,
    drafts: pages.filter((page) => page.status === "draft").length,
    latestPublishedAt,
  };
}

function getHomepageStats(blocks: CmsBlockRecord[]) {
  return {
    total: blocks.length,
    published: blocks.filter((block) => block.status === "published").length,
    drafts: blocks.filter((block) => block.status === "draft").length,
    changes: blocks.filter((block) => block.hasUnpublishedChanges).length,
  };
}

function createBlockEditorMap(blocks: CmsBlockRecord[]): BlockEditorMap {
  const fallback: BlockEditorMap = {
    home_hero: CMS_BLOCK_DEFINITIONS.home_hero.defaultContent as HomepageHeroCmsContent,
    home_featured_listings: CMS_BLOCK_DEFINITIONS.home_featured_listings
      .defaultContent as HomepageFeaturedListingsCmsContent,
    home_sections: CMS_BLOCK_DEFINITIONS.home_sections.defaultContent as HomepageSectionsCmsContent,
  };

  return blocks.reduce<BlockEditorMap>((current, block) => {
    switch (block.key) {
      case "home_hero":
        current.home_hero = block.draftContent as HomepageHeroCmsContent;
        break;
      case "home_featured_listings":
        current.home_featured_listings =
          block.draftContent as HomepageFeaturedListingsCmsContent;
        break;
      case "home_sections":
        current.home_sections = block.draftContent as HomepageSectionsCmsContent;
        break;
    }

    return current;
  }, fallback);
}

function getBlockTone(block: CmsBlockRecord) {
  if (block.hasUnpublishedChanges) return "amber" as const;
  return block.status === "published" ? ("green" as const) : ("slate" as const);
}

function getBlockLabel(block: CmsBlockRecord) {
  if (block.hasUnpublishedChanges) return "Draft changes";
  return block.status === "published" ? "Published" : "Draft";
}

function getBackgroundPreviewStyle(imageUrl: string): React.CSSProperties {
  return {
    backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.16), rgba(15, 23, 42, 0.68)), url("${imageUrl.replace(/"/g, '\\"')}")`,
  };
}

export function AdminCmsLive({
  pagesData,
  homepageData,
  mediaData,
}: {
  pagesData: AdminContentPagesData;
  homepageData: AdminHomepageCmsData;
  mediaData: AdminCmsMediaData;
}) {
  const [activeArea, setActiveArea] = React.useState<CmsArea>("homepage");
  const [pages, setPages] = React.useState(pagesData.pages);
  const [blocks, setBlocks] = React.useState(homepageData.blocks);
  const [mediaAssets, setMediaAssets] = React.useState(mediaData.assets);
  const [selectedSlug, setSelectedSlug] = React.useState(pagesData.pages[0]?.slug ?? "about");
  const [selectedBlockKey, setSelectedBlockKey] = React.useState<CmsBlockKey>("home_hero");
  const [pageFeedback, setPageFeedback] = React.useState<FeedbackState>(null);
  const [blockFeedback, setBlockFeedback] = React.useState<FeedbackState>(null);
  const [blockPendingAction, setBlockPendingAction] = React.useState<BlockPendingAction>(null);
  const [isSavingPage, startPageTransition] = React.useTransition();
  const [isSavingBlock, startBlockTransition] = React.useTransition();
  const [blockEditors, setBlockEditors] = React.useState<BlockEditorMap>(() =>
    createBlockEditorMap(homepageData.blocks)
  );

  const selectedPage = pages.find((page) => page.slug === selectedSlug) ?? pages[0];
  const selectedBlock =
    blocks.find((block) => block.key === selectedBlockKey) ?? blocks[0] ?? null;
  const [contentEditor, setContentEditor] = React.useState<ContentEditorState>(
    toContentEditorState(selectedPage)
  );

  React.useEffect(() => {
    if (!selectedPage) return;
    setContentEditor(toContentEditorState(selectedPage));
    setPageFeedback(null);
  }, [selectedPage]);

  const pageStats = getPageStats(pages);
  const homepageStats = getHomepageStats(blocks);

  const updateContentEditor = (patch: Partial<ContentEditorState>) => {
    setContentEditor((current) => ({
      ...current,
      ...patch,
    }));
  };

  const updateBlockEditor = <Key extends CmsBlockKey>(
    key: Key,
    patch: Partial<BlockEditorMap[Key]>
  ) => {
    setBlockEditors((current) => ({
      ...current,
      [key]: {
        ...(current[key] as Record<string, unknown>),
        ...patch,
      } as BlockEditorMap[Key],
    }));
    setBlockFeedback(null);
  };

  const addMediaAsset = (asset: CmsMediaAsset) => {
    setMediaAssets((current) => {
      if (current.some((item) => item.id === asset.id)) {
        return current.map((item) => (item.id === asset.id ? asset : item));
      }

      return [asset, ...current];
    });
  };

  const runPageSave = (nextStatus?: ContentPageStatus) => {
    if (!selectedPage) return;

    startPageTransition(async () => {
      setPageFeedback(null);

      const result = await saveContentPage({
        slug: selectedPage.slug,
        title: contentEditor.title,
        summary: contentEditor.summary,
        body: contentEditor.body,
        status: nextStatus ?? contentEditor.status,
        seoTitle: contentEditor.seoTitle,
        seoDescription: contentEditor.seoDescription,
      });

      if (!result.success) {
        setPageFeedback({
          status: "error",
          message: result.error,
        });
        return;
      }

      setPages((current) =>
        current.map((page) => (page.slug === result.page.slug ? result.page : page))
      );
      setContentEditor(toContentEditorState(result.page));
      setPageFeedback({
        status: "success",
        message: result.message,
      });
    });
  };

  const runBlockSave = (publish: boolean) => {
    if (!selectedBlock) return;

    startBlockTransition(async () => {
      setBlockPendingAction(publish ? "publish" : "draft");
      setBlockFeedback(null);

      try {
        const result = await saveCmsBlock({
          blockKey: selectedBlock.key,
          content: blockEditors[selectedBlock.key],
          publish,
        });

        if (!result.success) {
          setBlockFeedback({
            status: "error",
            message: result.error,
          });
          return;
        }

        setBlocks((current) =>
          current.map((block) => (block.key === result.block.key ? result.block : block))
        );
        setBlockEditors((current) => ({
          ...current,
          [result.block.key]: result.block.draftContent,
        }));
        setBlockFeedback({
          status: "success",
          message: result.message,
        });
      } finally {
        setBlockPendingAction(null);
      }
    });
  };

  const renderSchemaWarning = () => {
    if (activeArea === "homepage" && !homepageData.schemaReady) {
      return (
        <div className="rounded-[16px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-[13px] text-[#991b1b]">
          The <span className="font-mono">cms_blocks</span> table is not available yet. Apply the
          latest Supabase migration before publishing homepage CMS changes.
        </div>
      );
    }

    if (activeArea === "pages" && !pagesData.schemaReady) {
      return (
        <div className="rounded-[16px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-[13px] text-[#991b1b]">
          The <span className="font-mono">content_pages</span> table is not available yet. Apply
          the latest Supabase migration before publishing page changes.
        </div>
      );
    }

    return null;
  };

  const renderFeedback = (feedback: FeedbackState) => {
    if (!feedback) return null;

    return (
      <div
        className={cn(
          adminSurfaceClass,
          "px-5 py-4 text-[13px]",
          feedback.status === "success"
            ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
            : "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
        )}
      >
        {feedback.message}
      </div>
    );
  };

  const renderHeroEditor = () => {
    const editor = blockEditors.home_hero as HomepageHeroCmsContent;

    return (
      <div className="grid gap-5">
        <div
          className="min-h-[220px] rounded-[16px] bg-cover bg-center px-6 py-8 text-white"
          style={getBackgroundPreviewStyle(editor.backgroundImageUrl)}
        >
          <p className="max-w-xl text-[30px] font-semibold leading-[1.08]">{editor.headline}</p>
          <p className="mt-3 max-w-xl text-[14px] leading-6 text-white/86">{editor.subheading}</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[13px] font-medium text-[#111827]">Hero headline</span>
            <input
              value={editor.headline}
              onChange={(event) =>
                updateBlockEditor("home_hero", { headline: event.target.value })
              }
              className={adminInputClass}
              placeholder="Find your perfect vehicle."
            />
          </label>
          <AdminCmsMediaField
            assets={mediaAssets}
            schemaReady={mediaData.schemaReady}
            value={editor.backgroundImageUrl}
            label="Background image"
            description="Upload or pick a reusable hero image."
            placeholder="/hero-car.jpg"
            usageContext="homepage_hero"
            blockKey="home_hero"
            onChange={(backgroundImageUrl) =>
              updateBlockEditor("home_hero", { backgroundImageUrl })
            }
            onAssetUploaded={addMediaAsset}
            onFeedback={(feedback) =>
              setBlockFeedback(
                feedback
                  ? {
                      status: feedback.tone === "success" ? "success" : "error",
                      message: feedback.message,
                    }
                  : null
              )
            }
          />
        </div>

        <label className="space-y-2">
          <span className="text-[13px] font-medium text-[#111827]">Hero subheading</span>
          <textarea
            value={editor.subheading}
            onChange={(event) =>
              updateBlockEditor("home_hero", { subheading: event.target.value })
            }
            className={cn(adminTextareaClass, "min-h-[88px]")}
            placeholder="Short homepage hero support copy."
          />
        </label>

        <label className="flex items-start gap-3 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4 text-[13px] text-[#374151]">
          <input
            type="checkbox"
            checked={editor.quickSearchEnabled}
            onChange={(event) =>
              updateBlockEditor("home_hero", { quickSearchEnabled: event.target.checked })
            }
            className="mt-0.5 h-4 w-4 rounded border-[#d1d5db]"
          />
          <span>
            <span className="block font-semibold text-[#111827]">Show quick-search button</span>
            <span className="mt-1 block text-[#6b7280]">
              Controls the compact AI quick-search entry above the landing search form.
            </span>
          </span>
        </label>
      </div>
    );
  };

  const renderFeaturedListingsEditor = () => {
    const editor = blockEditors.home_featured_listings as HomepageFeaturedListingsCmsContent;

    return (
      <div className="grid gap-5">
        <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[18px] font-semibold text-[#111827]">{editor.title}</p>
              <p className="mt-1 text-[13px] text-[#6b7280]">
                {editor.featuredLimit} featured and {editor.recentLimit} recent listings requested.
              </p>
            </div>
            <span className="rounded-[999px] border border-[#dbeafe] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#2563eb]">
              {editor.showTabs ? "Tabs enabled" : "Single rail"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[13px] font-medium text-[#111827]">Section title</span>
            <input
              value={editor.title}
              onChange={(event) =>
                updateBlockEditor("home_featured_listings", { title: event.target.value })
              }
              className={adminInputClass}
              placeholder="Featured listings"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[13px] font-medium text-[#111827]">View all label</span>
            <input
              value={editor.viewAllLabel}
              onChange={(event) =>
                updateBlockEditor("home_featured_listings", { viewAllLabel: event.target.value })
              }
              className={adminInputClass}
              placeholder="View all"
            />
          </label>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <label className="space-y-2">
            <span className="text-[13px] font-medium text-[#111827]">Featured tab</span>
            <input
              value={editor.featuredTabLabel}
              onChange={(event) =>
                updateBlockEditor("home_featured_listings", {
                  featuredTabLabel: event.target.value,
                })
              }
              className={adminInputClass}
            />
          </label>
          <label className="space-y-2">
            <span className="text-[13px] font-medium text-[#111827]">Recent tab</span>
            <input
              value={editor.recentTabLabel}
              onChange={(event) =>
                updateBlockEditor("home_featured_listings", {
                  recentTabLabel: event.target.value,
                })
              }
              className={adminInputClass}
            />
          </label>
          <label className="space-y-2">
            <span className="text-[13px] font-medium text-[#111827]">Favorites tab</span>
            <input
              value={editor.favoritesTabLabel}
              onChange={(event) =>
                updateBlockEditor("home_featured_listings", {
                  favoritesTabLabel: event.target.value,
                })
              }
              className={adminInputClass}
            />
          </label>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[13px] font-medium text-[#111827]">Featured item limit</span>
            <input
              type="number"
              min={1}
              max={12}
              value={editor.featuredLimit}
              onChange={(event) =>
                updateBlockEditor("home_featured_listings", {
                  featuredLimit: Number(event.target.value),
                })
              }
              className={adminInputClass}
            />
          </label>
          <label className="space-y-2">
            <span className="text-[13px] font-medium text-[#111827]">Recent item limit</span>
            <input
              type="number"
              min={1}
              max={12}
              value={editor.recentLimit}
              onChange={(event) =>
                updateBlockEditor("home_featured_listings", {
                  recentLimit: Number(event.target.value),
                })
              }
              className={adminInputClass}
            />
          </label>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          <label className="flex items-start gap-3 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4 text-[13px] text-[#374151]">
            <input
              type="checkbox"
              checked={editor.showTabs}
              onChange={(event) =>
                updateBlockEditor("home_featured_listings", { showTabs: event.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-[#d1d5db]"
            />
            <span>
              <span className="block font-semibold text-[#111827]">Show listing tabs</span>
              <span className="mt-1 block text-[#6b7280]">
                Switch between featured, recent, and favorites rails.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4 text-[13px] text-[#374151]">
            <input
              type="checkbox"
              checked={editor.showFavoritesTab}
              onChange={(event) =>
                updateBlockEditor("home_featured_listings", {
                  showFavoritesTab: event.target.checked,
                })
              }
              className="mt-0.5 h-4 w-4 rounded border-[#d1d5db]"
            />
            <span>
              <span className="block font-semibold text-[#111827]">Show favorites tab</span>
              <span className="mt-1 block text-[#6b7280]">
                Keeps the favorites tab visible in the landing listing module.
              </span>
            </span>
          </label>
        </div>
      </div>
    );
  };

  const renderSectionsEditor = () => {
    const editor = blockEditors.home_sections as HomepageSectionsCmsContent;

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {SECTION_TOGGLE_FIELDS.map((field) => (
          <label
            key={field.key}
            className="flex items-start gap-3 rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4 text-[13px] text-[#374151]"
          >
            <input
              type="checkbox"
              checked={editor[field.key]}
              onChange={(event) =>
                updateBlockEditor("home_sections", { [field.key]: event.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-[#d1d5db]"
            />
            <span>
              <span className="block font-semibold text-[#111827]">{field.label}</span>
              <span className="mt-1 block text-[#6b7280]">{field.description}</span>
            </span>
          </label>
        ))}
      </div>
    );
  };

  const renderSelectedBlockEditor = () => {
    switch (selectedBlockKey) {
      case "home_hero":
        return renderHeroEditor();
      case "home_featured_listings":
        return renderFeaturedListingsEditor();
      case "home_sections":
        return renderSectionsEditor();
    }
  };

  const renderHomepageArea = () => {
    if (!selectedBlock) {
      return (
        <div className={cn(adminSurfaceClass, "px-6 py-8 text-[14px] text-[#6b7280]")}>
          No homepage CMS blocks are configured yet.
        </div>
      );
    }

    return (
      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <AdminSectionCard
          title="Homepage Blocks"
          description="Edit draft content, then publish it when it is ready for the public landing page."
          bodyClassName="p-0"
        >
          <div className="divide-y divide-[#eef2f7]">
            {blocks.map((block) => {
              const isActive = block.key === selectedBlockKey;

              return (
                <button
                  key={block.key}
                  type="button"
                  onClick={() => {
                    setSelectedBlockKey(block.key);
                    setBlockFeedback(null);
                  }}
                  className={cn(
                    "w-full px-5 py-4 text-left transition",
                    isActive ? "bg-[#f8fbff]" : "bg-white hover:bg-[#fafcff]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#111827]">{block.label}</p>
                      <p className="mt-1 text-[12px] text-[#6b7280]">{block.key}</p>
                    </div>
                    <AdminStatusPill label={getBlockLabel(block)} tone={getBlockTone(block)} />
                  </div>
                  <p className="mt-3 text-[12px] leading-5 text-[#475467]">
                    {block.description}
                  </p>
                  <p className="mt-3 text-[11px] text-[#94a3b8]">
                    Published: {formatDateTime(block.publishedAt)}
                  </p>
                </button>
              );
            })}
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          title={selectedBlock.label}
          description={selectedBlock.description}
          action={
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                className={cn(adminGhostButtonClass, "gap-2")}
              >
                <Eye className="h-4 w-4" />
                Preview home
              </Link>
              <button
                type="button"
                onClick={() => runBlockSave(false)}
                disabled={isSavingBlock}
                className={cn(
                  adminGhostButtonClass,
                  "gap-2",
                  isSavingBlock && "cursor-not-allowed opacity-60"
                )}
              >
                <Save className="h-4 w-4" />
                {blockPendingAction === "draft" ? "Saving..." : "Save draft"}
              </button>
              <button
                type="button"
                onClick={() => runBlockSave(true)}
                disabled={isSavingBlock}
                className={cn(
                  adminPrimaryButtonClass,
                  "gap-2",
                  isSavingBlock && "cursor-not-allowed opacity-60"
                )}
              >
                <BadgeCheck className="h-4 w-4" />
                {blockPendingAction === "publish" ? "Publishing..." : "Publish"}
              </button>
            </div>
          }
        >
          {renderSelectedBlockEditor()}
        </AdminSectionCard>
      </div>
    );
  };

  const renderPagesArea = () => {
    if (!selectedPage) {
      return (
        <div className={cn(adminSurfaceClass, "px-6 py-8 text-[14px] text-[#6b7280]")}>
          No managed pages are configured yet.
        </div>
      );
    }

    return (
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <AdminSectionCard
          title="Pages"
          description="Static public routes with managed page copy and SEO metadata."
          bodyClassName="p-0"
        >
          <div className="divide-y divide-[#eef2f7]">
            {pages.map((page) => {
              const definition = CONTENT_PAGE_DEFINITIONS[page.slug];
              const isActive = page.slug === selectedSlug;

              return (
                <button
                  key={page.slug}
                  type="button"
                  onClick={() => setSelectedSlug(page.slug)}
                  className={cn(
                    "w-full px-5 py-4 text-left transition",
                    isActive ? "bg-[#f8fbff]" : "bg-white hover:bg-[#fafcff]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#111827]">{page.title}</p>
                      <p className="mt-1 text-[12px] text-[#6b7280]">{definition.path}</p>
                    </div>
                    <AdminStatusPill label={page.status} tone={statusTone(page.status)} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-[12px] leading-5 text-[#475467]">
                    {page.summary || "No summary set yet."}
                  </p>
                  <p className="mt-3 text-[11px] text-[#94a3b8]">
                    Published: {formatDateTime(page.publishedAt)}
                  </p>
                </button>
              );
            })}
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          title={selectedPage.title}
          description="Edit the live copy, save it as draft, or publish it to the linked public route."
          action={
            <div className="flex flex-wrap gap-3">
              <Link
                href={CONTENT_PAGE_DEFINITIONS[selectedPage.slug].path}
                target="_blank"
                rel="noreferrer"
                className={cn(adminGhostButtonClass, "gap-2")}
              >
                <Eye className="h-4 w-4" />
                Preview
              </Link>
              <button
                type="button"
                onClick={() => runPageSave()}
                disabled={isSavingPage}
                className={cn(
                  adminGhostButtonClass,
                  "gap-2",
                  isSavingPage && "cursor-not-allowed opacity-60"
                )}
              >
                <Save className="h-4 w-4" />
                {isSavingPage ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => runPageSave("published")}
                disabled={isSavingPage}
                className={cn(
                  adminPrimaryButtonClass,
                  "gap-2",
                  isSavingPage && "cursor-not-allowed opacity-60"
                )}
              >
                <BadgeCheck className="h-4 w-4" />
                Publish now
              </button>
            </div>
          }
        >
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-[#111827]">Route</span>
                <input
                  value={CONTENT_PAGE_DEFINITIONS[selectedPage.slug].path}
                  readOnly
                  className={cn(adminInputClass, "bg-[#f8fafc] text-[#6b7280]")}
                />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-[#111827]">Status</span>
                <select
                  value={contentEditor.status}
                  onChange={(event) =>
                    updateContentEditor({
                      status: event.target.value as ContentPageStatus,
                    })
                  }
                  className={adminSelectClass}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-[13px] font-medium text-[#111827]">Title</span>
              <input
                value={contentEditor.title}
                onChange={(event) => updateContentEditor({ title: event.target.value })}
                className={adminInputClass}
                placeholder="Page title"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[13px] font-medium text-[#111827]">Summary</span>
              <textarea
                value={contentEditor.summary}
                onChange={(event) => updateContentEditor({ summary: event.target.value })}
                className={cn(adminTextareaClass, "min-h-[96px]")}
                placeholder="Optional summary shown near the top of the public page."
              />
            </label>

            <label className="space-y-2">
              <span className="text-[13px] font-medium text-[#111827]">Body</span>
              <textarea
                value={contentEditor.body}
                onChange={(event) => updateContentEditor({ body: event.target.value })}
                className={cn(adminTextareaClass, "min-h-[280px]")}
                placeholder="Plain text content. Separate paragraphs with blank lines."
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-[#111827]">SEO title</span>
                <input
                  value={contentEditor.seoTitle}
                  onChange={(event) => updateContentEditor({ seoTitle: event.target.value })}
                  className={adminInputClass}
                  placeholder="Optional metadata title"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-[#111827]">SEO description</span>
                <textarea
                  value={contentEditor.seoDescription}
                  onChange={(event) =>
                    updateContentEditor({ seoDescription: event.target.value })
                  }
                  className={cn(adminTextareaClass, "min-h-[96px]")}
                  placeholder="Optional metadata description"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3">
                <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#6b7280]">
                  Slug
                </p>
                <p className="mt-2 text-[14px] font-semibold text-[#111827]">
                  {selectedPage.slug}
                </p>
              </div>
              <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3">
                <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#6b7280]">
                  Last published
                </p>
                <p className="mt-2 text-[14px] font-semibold text-[#111827]">
                  {formatDateTime(selectedPage.publishedAt)}
                </p>
              </div>
            </div>
          </div>
        </AdminSectionCard>
      </div>
    );
  };

  const renderMediaArea = () => (
    <AdminCmsMediaLibrary
      assets={mediaAssets}
      schemaReady={mediaData.schemaReady}
      onAssetUploaded={addMediaAsset}
    />
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="CMS"
        action={
          <div className="inline-flex rounded-[12px] border border-[#d1d5db] bg-white p-1">
            {[
              { key: "homepage" as const, label: "Homepage", icon: Home },
              { key: "pages" as const, label: "Pages", icon: FileText },
              { key: "media" as const, label: "Media", icon: ImageIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.key === activeArea;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveArea(item.key)}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-[9px] px-3 text-[13px] font-semibold transition",
                    isActive ? "bg-[#2563eb] text-white" : "text-[#4b5563] hover:bg-[#f8fafc]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        }
      />

      {renderSchemaWarning()}
      {activeArea === "homepage" ? renderFeedback(blockFeedback) : null}
      {activeArea === "pages" ? renderFeedback(pageFeedback) : null}

      {activeArea !== "media" ? (
        <div className="grid gap-4 xl:grid-cols-4">
          {activeArea === "homepage" ? (
            <>
              <AdminStatCard
                label="Homepage blocks"
                value={homepageStats.total.toLocaleString("en-KE")}
                icon={<LayoutTemplate className="h-5 w-5" />}
              />
              <AdminStatCard
                label="Published blocks"
                value={homepageStats.published.toLocaleString("en-KE")}
                icon={<BadgeCheck className="h-5 w-5" />}
              />
              <AdminStatCard
                label="Draft-only blocks"
                value={homepageStats.drafts.toLocaleString("en-KE")}
                icon={<Clock3 className="h-5 w-5" />}
              />
              <AdminStatCard
                label="Unpublished changes"
                value={homepageStats.changes.toLocaleString("en-KE")}
                icon={<Settings2 className="h-5 w-5" />}
              />
            </>
          ) : (
            <>
              <AdminStatCard
                label="Managed pages"
                value={pageStats.total.toLocaleString("en-KE")}
                icon={<FileText className="h-5 w-5" />}
              />
              <AdminStatCard
                label="Published pages"
                value={pageStats.published.toLocaleString("en-KE")}
                icon={<BadgeCheck className="h-5 w-5" />}
              />
              <AdminStatCard
                label="Draft pages"
                value={pageStats.drafts.toLocaleString("en-KE")}
                icon={<Clock3 className="h-5 w-5" />}
              />
              <AdminStatCard
                label="Latest publish"
                value={
                  pageStats.latestPublishedAt
                    ? formatDateTime(pageStats.latestPublishedAt)
                    : "Not yet"
                }
                icon={<Globe className="h-5 w-5" />}
              />
            </>
          )}
        </div>
      ) : null}

      {activeArea === "homepage"
        ? renderHomepageArea()
        : activeArea === "pages"
          ? renderPagesArea()
          : renderMediaArea()}
    </div>
  );
}
