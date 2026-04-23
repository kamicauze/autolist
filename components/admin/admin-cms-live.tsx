"use client";

import * as React from "react";
import Link from "next/link";
import { BadgeCheck, Clock3, Eye, FileText, Globe, Save } from "lucide-react";
import { saveContentPage } from "@/lib/actions/content-pages";
import {
  CONTENT_PAGE_DEFINITIONS,
  type AdminContentPagesData,
  type ContentPageRecord,
  type ContentPageStatus,
} from "@/lib/types/content-pages";
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

type EditorState = {
  title: string;
  summary: string;
  body: string;
  status: ContentPageStatus;
  seoTitle: string;
  seoDescription: string;
};

function toEditorState(page: ContentPageRecord): EditorState {
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
  return status === "published" ? "green" as const : "amber" as const;
}

function getStats(pages: ContentPageRecord[]) {
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

export function AdminCmsLive({ data }: { data: AdminContentPagesData }) {
  const [pages, setPages] = React.useState(data.pages);
  const [selectedSlug, setSelectedSlug] = React.useState(data.pages[0]?.slug ?? "about");
  const [feedback, setFeedback] = React.useState<FeedbackState>(null);
  const [isSaving, startTransition] = React.useTransition();

  const selectedPage =
    pages.find((page) => page.slug === selectedSlug) ?? pages[0];
  const [editorState, setEditorState] = React.useState<EditorState>(
    toEditorState(selectedPage)
  );

  React.useEffect(() => {
    if (!selectedPage) return;
    setEditorState(toEditorState(selectedPage));
    setFeedback(null);
  }, [selectedPage]);

  const stats = getStats(pages);

  const updateEditor = (patch: Partial<EditorState>) => {
    setEditorState((current) => ({
      ...current,
      ...patch,
    }));
  };

  const runSave = (nextStatus?: ContentPageStatus) => {
    if (!selectedPage) return;

    startTransition(async () => {
      setFeedback(null);

      const result = await saveContentPage({
        slug: selectedPage.slug,
        title: editorState.title,
        summary: editorState.summary,
        body: editorState.body,
        status: nextStatus ?? editorState.status,
        seoTitle: editorState.seoTitle,
        seoDescription: editorState.seoDescription,
      });

      if (!result.success) {
        setFeedback({
          status: "error",
          message: result.error,
        });
        return;
      }

      setPages((current) =>
        current.map((page) => (page.slug === result.page.slug ? result.page : page))
      );
      setEditorState(toEditorState(result.page));
      setFeedback({
        status: "success",
        message: result.message,
      });
    });
  };

  if (!selectedPage) {
    return (
      <div className={cn(adminSurfaceClass, "px-6 py-8 text-[14px] text-[#6b7280]")}>
        No managed pages are configured yet.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader title="CMS" />

      {!data.schemaReady ? (
        <div className="rounded-[16px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-[13px] text-[#991b1b]">
          The <span className="font-mono">content_pages</span> table is not available yet. Apply the
          latest Supabase migration before publishing changes.
        </div>
      ) : null}

      {feedback ? (
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
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label="Managed pages"
          value={stats.total.toLocaleString("en-KE")}
          icon={<FileText className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Published pages"
          value={stats.published.toLocaleString("en-KE")}
          icon={<BadgeCheck className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Draft pages"
          value={stats.drafts.toLocaleString("en-KE")}
          icon={<Clock3 className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Latest publish"
          value={stats.latestPublishedAt ? formatDateTime(stats.latestPublishedAt) : "Not yet"}
          icon={<Globe className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <AdminSectionCard
          title="Pages"
          description="These routes are already linked from the public site and now resolve from live managed content."
          className="p-0"
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
                onClick={() => runSave()}
                disabled={isSaving}
                className={cn(adminGhostButtonClass, "gap-2", isSaving && "cursor-not-allowed opacity-60")}
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => runSave("published")}
                disabled={isSaving}
                className={cn(adminPrimaryButtonClass, "gap-2", isSaving && "cursor-not-allowed opacity-60")}
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
                  value={editorState.status}
                  onChange={(event) =>
                    updateEditor({
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
                value={editorState.title}
                onChange={(event) => updateEditor({ title: event.target.value })}
                className={adminInputClass}
                placeholder="Page title"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[13px] font-medium text-[#111827]">Summary</span>
              <textarea
                value={editorState.summary}
                onChange={(event) => updateEditor({ summary: event.target.value })}
                className={cn(adminTextareaClass, "min-h-[96px]")}
                placeholder="Optional summary shown near the top of the public page."
              />
            </label>

            <label className="space-y-2">
              <span className="text-[13px] font-medium text-[#111827]">Body</span>
              <textarea
                value={editorState.body}
                onChange={(event) => updateEditor({ body: event.target.value })}
                className={cn(adminTextareaClass, "min-h-[280px]")}
                placeholder="Plain text content. Separate paragraphs with blank lines."
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-[#111827]">SEO title</span>
                <input
                  value={editorState.seoTitle}
                  onChange={(event) => updateEditor({ seoTitle: event.target.value })}
                  className={adminInputClass}
                  placeholder="Optional metadata title"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-[#111827]">SEO description</span>
                <textarea
                  value={editorState.seoDescription}
                  onChange={(event) => updateEditor({ seoDescription: event.target.value })}
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
                <p className="mt-2 text-[14px] font-semibold text-[#111827]">{selectedPage.slug}</p>
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
    </div>
  );
}
