import "server-only";

import { cache } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getContentPlainText } from "@/lib/content-rich-text";
import { isMissingRelationError } from "@/lib/supabase/error-utils";
import {
  CONTENT_PAGE_DEFINITIONS,
  CONTENT_PAGE_SLUGS,
  type AdminContentPagesData,
  type ContentPageRecord,
  type ContentPageSlug,
  type ContentPageStatus,
} from "@/lib/types/content-pages";

type ContentPageRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  status: ContentPageStatus;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const CONTENT_PAGE_SELECT = `
  id,
  slug,
  title,
  summary,
  body,
  status,
  seo_title,
  seo_description,
  published_at,
  created_at,
  updated_at
`;

const CONTENT_PAGE_DEFAULTS: Record<
  ContentPageSlug,
  {
    title: string;
    summary: string | null;
    body: string;
    seoTitle: string | null;
    seoDescription: string | null;
  }
> = {
  about: {
    title: "About Autolist",
    summary:
      "Autolist helps buyers, sellers, and dealers across Kenya move with more confidence.",
    body: `Autolist is a vehicle marketplace built to make car buying and selling clearer, faster, and more trustworthy.

We focus on practical listing tools, better discovery, and straightforward communication between buyers and sellers.

Our goal is simple: help serious buyers find the right car and help serious sellers close with less friction.`,
    seoTitle: "About Autolist",
    seoDescription:
      "Learn what Autolist does and how we support vehicle buyers, sellers, and dealers in Kenya.",
  },
  "how-it-works": {
    title: "How Autolist Works",
    summary:
      "A simple process for listing a vehicle, discovering options, and contacting the right seller.",
    body: `Sellers create a listing with the key vehicle details, pricing, and photos buyers need to evaluate quickly.

Buyers explore live inventory, compare options, and reach out directly when they find a good fit.

The platform is designed to reduce guesswork, surface useful details early, and keep the transaction flow practical.`,
    seoTitle: "How Autolist Works",
    seoDescription:
      "See how Autolist helps sellers publish listings and helps buyers discover and compare vehicles.",
  },
  careers: {
    title: "Careers",
    summary:
      "We care about practical builders who like clear systems, clean execution, and measurable progress.",
    body: `Autolist is building a marketplace experience that respects users' time and supports real transactions.

We value people who work clearly, move with urgency, and improve systems instead of adding noise.

If you are interested in future roles, reach out through the business contact channels listed on the platform.`,
    seoTitle: "Careers at Autolist",
    seoDescription:
      "Learn about the kind of work and team mindset Autolist is building as the platform grows.",
  },
  faqs: {
    title: "Frequently Asked Questions",
    summary:
      "Answers to common questions about listings, contacting sellers, and using the marketplace.",
    body: `Listings are created by individual sellers and dealers, and details may change as vehicles are updated or sold.

Buyers should confirm availability, price, condition, and paperwork directly with the seller before making a commitment.

If you need help with the platform itself, use the available support channels so the team can review the issue.`,
    seoTitle: "Autolist FAQs",
    seoDescription:
      "Read frequently asked questions about Autolist, vehicle listings, and contacting sellers.",
  },
  privacy: {
    title: "Privacy Policy",
    summary:
      "A high-level explanation of what information the platform handles and how it is used.",
    body: `Autolist collects the account, listing, and communication data needed to operate the marketplace and support user requests.

We use that information to run the service, improve product quality, prevent abuse, and respond to support or compliance needs.

Personal data is handled according to applicable legal requirements and internal access controls.`,
    seoTitle: "Privacy Policy | Autolist",
    seoDescription:
      "Read the Autolist privacy policy for a summary of how platform data is collected and used.",
  },
  terms: {
    title: "Terms of Use",
    summary:
      "The main conditions that apply when using Autolist, publishing listings, or contacting other users.",
    body: `By using Autolist, you agree to provide accurate information and use the platform lawfully and in good faith.

Sellers are responsible for the accuracy of their listings, and buyers are responsible for carrying out appropriate due diligence.

Autolist may remove content, limit access, or take other moderation steps when platform rules or legal requirements are not met.`,
    seoTitle: "Terms of Use | Autolist",
    seoDescription:
      "Review the core terms that govern using Autolist and publishing or responding to listings.",
  },
};

function toNullableText(value: string | null) {
  if (!value) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function excerptBody(body: string) {
  const normalized = getContentPlainText(body).replace(/\s+/g, " ").trim();
  if (normalized.length <= 160) return normalized;
  return `${normalized.slice(0, 157)}...`;
}

export function formatContentPageDate(value: string) {
  return new Date(value).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatContentPageDateTime(value: string) {
  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getContentPageParagraphs(body: string) {
  return body
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function buildFallbackPage(
  slug: ContentPageSlug,
  status: ContentPageStatus = "draft"
): ContentPageRecord {
  const definition = CONTENT_PAGE_DEFINITIONS[slug];
  const defaults = CONTENT_PAGE_DEFAULTS[slug];

  return {
    id: null,
    slug,
    title: defaults.title,
    summary: defaults.summary,
    body: defaults.body,
    status,
    seoTitle: defaults.seoTitle,
    seoDescription: defaults.seoDescription,
    publishedAt: null,
    createdAt: null,
    updatedAt: null,
    path: definition.path,
  };
}

export function mapContentPageRow(row: ContentPageRow): ContentPageRecord {
  const slug = row.slug as ContentPageSlug;
  const definition = CONTENT_PAGE_DEFINITIONS[slug];

  return {
    id: row.id,
    slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    status: row.status,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    path: definition.path,
  };
}

export const getPublishedContentPageBySlug = cache(async (slug: ContentPageSlug) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_pages")
    .select(CONTENT_PAGE_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<ContentPageRow>();

  if (isMissingRelationError(error)) {
    return buildFallbackPage(slug, "published");
  }

  if (error) {
    throw new Error(`Failed to load content page "${slug}": ${error.message}`);
  }

  return data ? mapContentPageRow(data) : null;
});

export async function getAdminContentPagesData(): Promise<AdminContentPagesData> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_pages")
    .select(CONTENT_PAGE_SELECT)
    .in("slug", [...CONTENT_PAGE_SLUGS])
    .order("slug");

  if (isMissingRelationError(error)) {
    return {
      pages: CONTENT_PAGE_SLUGS.map((slug) => buildFallbackPage(slug)),
      schemaReady: false,
    };
  }

  if (error) {
    throw new Error(`Failed to load admin content pages: ${error.message}`);
  }

  const rows = (data ?? []) as ContentPageRow[];
  const pagesBySlug = new Map(
    rows
      .filter((row): row is ContentPageRow => row.slug in CONTENT_PAGE_DEFINITIONS)
      .map((row) => [row.slug as ContentPageSlug, mapContentPageRow(row)])
  );

  return {
    pages: CONTENT_PAGE_SLUGS.map((slug) => pagesBySlug.get(slug) ?? buildFallbackPage(slug)),
    schemaReady: true,
  };
}

export async function buildManagedContentPageMetadata(
  slug: ContentPageSlug
): Promise<Metadata> {
  const page = await getPublishedContentPageBySlug(slug);
  const defaults = CONTENT_PAGE_DEFAULTS[slug];
  const title = page?.seoTitle || page?.title || defaults.seoTitle || defaults.title;
  const description =
    page?.seoDescription || page?.summary || (page ? excerptBody(page.body) : null) ||
    defaults.seoDescription ||
    defaults.summary ||
    excerptBody(defaults.body);

  return {
    title,
    description,
    alternates: {
      canonical: CONTENT_PAGE_DEFINITIONS[slug].path,
    },
  };
}

export function getDefaultContentPageValue(slug: ContentPageSlug) {
  return {
    ...buildFallbackPage(slug),
    summary: toNullableText(CONTENT_PAGE_DEFAULTS[slug].summary ?? ""),
    seoTitle: toNullableText(CONTENT_PAGE_DEFAULTS[slug].seoTitle ?? ""),
    seoDescription: toNullableText(CONTENT_PAGE_DEFAULTS[slug].seoDescription ?? ""),
  };
}
