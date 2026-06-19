"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarDays,
  ExternalLink,
  FileText,
  Globe2,
  Plus,
  Save,
  SquarePen,
} from "lucide-react";
import {
  createContentPostDraft,
  publishContentPost,
  unpublishContentPost,
  updateContentPost,
} from "@/lib/actions/content-posts";
import { AdminRichTextEditor } from "@/components/admin/admin-rich-text-editor";
import { AdminCmsMediaField } from "@/components/admin/admin-cms-media-library";
import type { AdminCmsMediaData, CmsMediaAsset } from "@/lib/types/cms-media";
import type {
  AdminContentPostsData,
  ContentPost,
  ContentPostCategory,
} from "@/lib/types/content-posts";
import { getContentSummary } from "@/lib/content-rich-text";
import { cn } from "@/lib/utils";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
  adminGhostButtonClass,
  adminInputClass,
  adminPrimaryButtonClass,
  adminTextareaClass,
} from "./admin-ui";

type FeedbackState =
  | {
      tone: "success" | "error";
      message: string;
    }
  | null;

type PendingAction = "create" | "save" | "publish" | "unpublish" | null;

type EditorState = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: ContentPostCategory;
  coverImageUrl: string;
  galleryImageUrls: string[];
  author: string;
};

const CONTENT_CATEGORY_OPTIONS: Array<{ value: ContentPostCategory; label: string }> = [
  { value: "blog", label: "Blog" },
  { value: "review", label: "Review" },
  { value: "news_advice", label: "News and advice" },
  { value: "faq", label: "FAQ" },
];
const MAX_GALLERY_IMAGES = 12;

function getCategoryLabel(category: ContentPostCategory) {
  return CONTENT_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? "Blog";
}

function createEditorState(post: ContentPost | null): EditorState {
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    body: post?.body ?? "",
    category: post?.category ?? "blog",
    coverImageUrl: post?.coverImageUrl ?? "",
    galleryImageUrls: post?.galleryImageUrls ?? [],
    author: post?.author ?? "",
  };
}

function sortPosts(posts: ContentPost[]) {
  return [...posts].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function calculateClientStats(posts: ContentPost[]) {
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  return {
    totalPosts: posts.length,
    draftPosts: posts.filter((post) => post.status === "draft").length,
    publishedPosts: posts.filter((post) => post.status === "published").length,
    publishedThisMonth: posts.filter(
      (post) =>
        post.status === "published" &&
        Boolean(post.publishedAt) &&
        post.publishedAt?.slice(0, 7) === currentMonthKey
    ).length,
  };
}

function contentPostTone(status: ContentPost["status"]) {
  return status === "published" ? ("green" as const) : ("slate" as const);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPostSummary(post: ContentPost) {
  const excerpt = post.excerpt.trim();
  if (excerpt) {
    return excerpt;
  }

  return getContentSummary(post.body) || "No excerpt yet. Open the editor to add a summary.";
}

export function AdminBlogsContentLive({
  data,
  mediaData,
}: {
  data: AdminContentPostsData;
  mediaData: AdminCmsMediaData;
}) {
  const [posts, setPosts] = React.useState(() => sortPosts(data.posts));
  const [mediaAssets, setMediaAssets] = React.useState(mediaData.assets);
  const [selectedId, setSelectedId] = React.useState(data.posts[0]?.id ?? "");
  const [editor, setEditor] = React.useState(() => createEditorState(data.posts[0] ?? null));
  const [feedback, setFeedback] = React.useState<FeedbackState>(null);
  const [pendingAction, setPendingAction] = React.useState<PendingAction>(null);
  const [isPending, startTransition] = React.useTransition();

  const selectedPost = posts.find((post) => post.id === selectedId) ?? posts[0] ?? null;
  const stats = calculateClientStats(posts);

  React.useEffect(() => {
    if (!selectedPost) {
      setEditor(createEditorState(null));
      return;
    }

    setEditor(createEditorState(selectedPost));
  }, [selectedPost]);

  function syncPost(post: ContentPost) {
    setPosts((current) => {
      const next = current.some((item) => item.id === post.id)
        ? current.map((item) => (item.id === post.id ? post : item))
        : [post, ...current];

      return sortPosts(next);
    });

    setSelectedId(post.id);
    setEditor(createEditorState(post));
  }

  function addMediaAsset(asset: CmsMediaAsset) {
    setMediaAssets((current) => {
      if (current.some((item) => item.id === asset.id)) {
        return current.map((item) => (item.id === asset.id ? asset : item));
      }

      return [asset, ...current];
    });
  }

  async function saveCurrentPost(successMessage: string) {
    if (!selectedPost) {
      return null;
    }

    const result = await updateContentPost({
      postId: selectedPost.id,
      title: editor.title,
      slug: editor.slug,
      excerpt: editor.excerpt,
      body: editor.body,
      category: editor.category,
      coverImageUrl: editor.coverImageUrl,
      galleryImageUrls: editor.galleryImageUrls,
      author: editor.author,
    });

    if (!("success" in result)) {
      setFeedback({ tone: "error", message: result.error });
      return null;
    }

    syncPost(result.post);
    setFeedback({ tone: "success", message: successMessage });
    return result.post;
  }

  function handleCreateDraft() {
    startTransition(async () => {
      setPendingAction("create");
      setFeedback(null);

      try {
        const result = await createContentPostDraft();

        if (!("success" in result)) {
          setFeedback({ tone: "error", message: result.error });
          return;
        }

        syncPost(result.post);
        setFeedback({ tone: "success", message: "Draft created." });
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleSaveChanges() {
    startTransition(async () => {
      setPendingAction("save");
      setFeedback(null);

      try {
        await saveCurrentPost("Draft saved.");
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handlePublishToggle() {
    if (!selectedPost) {
      return;
    }

    const nextAction = selectedPost.status === "published" ? "unpublish" : "publish";

    startTransition(async () => {
      setPendingAction(nextAction);
      setFeedback(null);

      try {
        const savedPost = await saveCurrentPost(
          nextAction === "publish" ? "Draft saved. Publishing..." : "Draft saved. Moving back to draft..."
        );

        if (!savedPost) {
          return;
        }

        const result =
          nextAction === "publish"
            ? await publishContentPost(savedPost.id)
            : await unpublishContentPost(savedPost.id);

        if (!("success" in result)) {
          setFeedback({ tone: "error", message: result.error });
          return;
        }

        syncPost(result.post);
        setFeedback({
          tone: "success",
          message: nextAction === "publish" ? "Post published." : "Post moved back to draft.",
        });
      } finally {
        setPendingAction(null);
      }
    });
  }

  const previewHref =
    selectedPost?.status === "published" ? `/blog/${selectedPost.slug}` : null;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Blogs & Content"
        action={
          <button
            type="button"
            className={cn(adminPrimaryButtonClass, "gap-2")}
            onClick={handleCreateDraft}
            disabled={isPending}
          >
            <Plus className="h-4 w-4" />
            {pendingAction === "create" ? "Creating..." : "New draft"}
          </button>
        }
      />

      {!data.schemaReady ? (
        <div className="rounded-[16px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-[13px] text-[#991b1b]">
          The <span className="font-mono">content_posts</span> table or its latest columns are not
          available yet. Apply the latest Supabase migration before publishing blog content.
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label="Total posts"
          value={stats.totalPosts.toLocaleString("en-KE")}
          icon={<FileText className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Drafts"
          value={stats.draftPosts.toLocaleString("en-KE")}
          icon={<SquarePen className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Published"
          value={stats.publishedPosts.toLocaleString("en-KE")}
          icon={<Globe2 className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Published this month"
          value={stats.publishedThisMonth.toLocaleString("en-KE")}
          icon={<CalendarDays className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <AdminSectionCard
          data-tour="blogs-list"
          title="Posts"
          description="Every post lives here as a real draft or published record."
          bodyClassName="p-0"
        >
          <div className="divide-y divide-[#eef2f7]">
            {posts.length === 0 ? (
              <div className="px-6 py-8 text-[14px] text-[#6b7280]">
                No posts exist yet. Create a draft to start the blog library.
              </div>
            ) : null}

            {posts.map((post) => {
              const isActive = post.id === selectedPost?.id;

              return (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(post.id);
                    setFeedback(null);
                  }}
                  className={cn(
                    "w-full px-6 py-5 text-left transition",
                    isActive ? "bg-brand-soft-surface" : "bg-white hover:bg-[#fafcff]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-[#111827]">
                        {post.title}
                      </p>
                      <p className="mt-1 truncate text-[12px] text-[#6b7280]">
                        {getCategoryLabel(post.category)} • {post.author} • /blog/{post.slug}
                      </p>
                    </div>
                    <AdminStatusPill
                      label={post.status === "published" ? "Published" : "Draft"}
                      tone={contentPostTone(post.status)}
                    />
                  </div>

                  <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-[#475467]">
                    {getPostSummary(post)}
                  </p>

                  <p className="mt-3 text-[11px] text-[#94a3b8]">
                    {post.status === "published"
                      ? `Published ${formatDateTime(post.publishedAt)}`
                      : `Updated ${formatDateTime(post.updatedAt)}`}
                  </p>
                </button>
              );
            })}
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          data-tour="blogs-editor"
          title={selectedPost ? selectedPost.title : "Post editor"}
          description={
            selectedPost
              ? "Edit the current draft, then publish or move it back to draft."
              : "Select a post from the list or create a new draft."
          }
          action={
            selectedPost ? (
              <div className="flex flex-wrap gap-3">
                {previewHref ? (
                  <Link
                    href={previewHref}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(adminGhostButtonClass, "gap-2")}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Preview live
                  </Link>
                ) : null}

                <button
                  type="button"
                  className={cn(adminGhostButtonClass, "gap-2")}
                  onClick={handleSaveChanges}
                  disabled={isPending}
                >
                  <Save className="h-4 w-4" />
                  {pendingAction === "save" ? "Saving..." : "Save changes"}
                </button>

                <button
                  type="button"
                  className={cn(
                    selectedPost.status === "published"
                      ? adminGhostButtonClass
                      : adminPrimaryButtonClass,
                    "gap-2"
                  )}
                  onClick={handlePublishToggle}
                  disabled={isPending}
                >
                  <Globe2 className="h-4 w-4" />
                  {pendingAction === "publish"
                    ? "Publishing..."
                    : pendingAction === "unpublish"
                      ? "Moving..."
                      : selectedPost.status === "published"
                        ? "Move to draft"
                        : "Publish"}
                </button>
              </div>
            ) : null
          }
        >
          {selectedPost ? (
            <div className="space-y-5">
              {feedback ? (
                <div
                  className={cn(
                    "rounded-[12px] border px-4 py-3 text-[13px]",
                    feedback.tone === "success"
                      ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
                      : "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
                  )}
                >
                  {feedback.message}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-[#374151]">Title</span>
                  <input
                    value={editor.title}
                    onChange={(event) =>
                      setEditor((current) => ({ ...current, title: event.target.value }))
                    }
                    className={adminInputClass}
                    placeholder="7 things to check before buying a used SUV"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-[#374151]">Author</span>
                  <input
                    value={editor.author}
                    onChange={(event) =>
                      setEditor((current) => ({ ...current, author: event.target.value }))
                    }
                    className={adminInputClass}
                    placeholder="Editorial Desk"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-[#374151]">Slug</span>
                  <input
                    value={editor.slug}
                    onChange={(event) =>
                      setEditor((current) => ({ ...current, slug: event.target.value }))
                    }
                    className={adminInputClass}
                    placeholder="used-suv-buying-checklist"
                  />
                </label>

                <AdminCmsMediaField
                  assets={mediaAssets}
                  schemaReady={mediaData.schemaReady}
                  value={editor.coverImageUrl}
                  label="Cover image"
                  description="Upload or select a reusable blog image."
                  placeholder="/api/listing-image?key=..."
                  usageContext="blog_cover"
                  onChange={(coverImageUrl) =>
                    setEditor((current) => ({ ...current, coverImageUrl }))
                  }
                  onAssetUploaded={addMediaAsset}
                  onFeedback={setFeedback}
                />

                <label className="space-y-2">
                  <span className="text-[13px] font-medium text-[#374151]">Category</span>
                  <select
                    value={editor.category}
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        category: event.target.value as ContentPostCategory,
                      }))
                    }
                    className={adminInputClass}
                  >
                    {CONTENT_CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-[16px] border border-[#e5e7eb] bg-[#fbfcfe] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium text-[#374151]">Additional photos</p>
                    <p className="mt-1 text-[12px] leading-5 text-[#6b7280]">
                      Add up to {MAX_GALLERY_IMAGES} supporting images for the article body.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={cn(
                      adminGhostButtonClass,
                      editor.galleryImageUrls.length >= MAX_GALLERY_IMAGES &&
                        "cursor-not-allowed opacity-50 hover:border-[#d1d5db] hover:text-[#374151]"
                    )}
                    disabled={editor.galleryImageUrls.length >= MAX_GALLERY_IMAGES}
                    onClick={() =>
                      setEditor((current) => ({
                        ...current,
                        galleryImageUrls: [...current.galleryImageUrls, ""],
                      }))
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add photo
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {editor.galleryImageUrls.length === 0 ? (
                    <p className="rounded-[12px] border border-dashed border-[#cbd5e1] px-4 py-4 text-[13px] text-[#64748b]">
                      No additional photos yet.
                    </p>
                  ) : null}

                  {editor.galleryImageUrls.map((imageUrl, index) => (
                    <div
                      key={`${index}-${imageUrl}`}
                      className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
                    >
                      <AdminCmsMediaField
                        assets={mediaAssets}
                        schemaReady={mediaData.schemaReady}
                        value={imageUrl}
                        label={`Photo ${index + 1}`}
                        description="Upload or choose an article gallery image."
                        placeholder="/api/listing-image?key=..."
                        usageContext="blog_cover"
                        onChange={(nextImageUrl) =>
                          setEditor((current) => ({
                            ...current,
                            galleryImageUrls: current.galleryImageUrls.map((item, itemIndex) =>
                              itemIndex === index ? nextImageUrl : item
                            ),
                          }))
                        }
                        onAssetUploaded={addMediaAsset}
                        onFeedback={setFeedback}
                      />
                      <button
                        type="button"
                        className={cn(
                          adminGhostButtonClass,
                          "self-end text-[#b42318] hover:text-[#991b1b]"
                        )}
                        onClick={() =>
                          setEditor((current) => ({
                            ...current,
                            galleryImageUrls: current.galleryImageUrls.filter(
                              (_item, itemIndex) => itemIndex !== index
                            ),
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-[13px] font-medium text-[#374151]">Excerpt</span>
                <textarea
                  value={editor.excerpt}
                  onChange={(event) =>
                    setEditor((current) => ({ ...current, excerpt: event.target.value }))
                  }
                  className={adminTextareaClass}
                  placeholder="A short summary for the blog list and social previews."
                />
              </label>

              <AdminRichTextEditor
                label="Body"
                value={editor.body}
                onChange={(body) => setEditor((current) => ({ ...current, body }))}
                placeholder="Write the article body here. Add headings, lists, quotes, and links as needed."
              />

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4">
                  <p className="text-[12px] uppercase tracking-[0.16em] text-[#94a3b8]">Status</p>
                  <div className="mt-3">
                    <AdminStatusPill
                      label={selectedPost.status === "published" ? "Published" : "Draft"}
                      tone={contentPostTone(selectedPost.status)}
                    />
                  </div>
                </div>

                <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4">
                  <p className="text-[12px] uppercase tracking-[0.16em] text-[#94a3b8]">Category</p>
                  <p className="mt-3 text-[14px] font-medium text-[#111827]">
                    {getCategoryLabel(editor.category)}
                  </p>
                </div>

                <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4">
                  <p className="text-[12px] uppercase tracking-[0.16em] text-[#94a3b8]">Updated</p>
                  <p className="mt-3 text-[14px] font-medium text-[#111827]">
                    {formatDateTime(selectedPost.updatedAt)}
                  </p>
                </div>

                <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4">
                  <p className="text-[12px] uppercase tracking-[0.16em] text-[#94a3b8]">
                    Published at
                  </p>
                  <p className="mt-3 text-[14px] font-medium text-[#111827]">
                    {selectedPost.publishedAt ? formatDateTime(selectedPost.publishedAt) : "Not live yet"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[14px] border border-dashed border-[#cbd5e1] px-6 py-8 text-[14px] text-[#64748b]">
              Create a draft or pick an existing post to start editing.
            </div>
          )}
        </AdminSectionCard>
      </div>
    </div>
  );
}
