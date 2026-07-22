export const CONTENT_PAGE_SLUGS = [
  "about",
  "how-it-works",
  "careers",
  "faqs",
  "privacy",
  "terms",
  "acceptable-use",
  "cookies",
] as const;

export const CONTENT_PAGE_STATUSES = ["draft", "published"] as const;

export type ContentPageSlug = (typeof CONTENT_PAGE_SLUGS)[number];
export type ContentPageStatus = (typeof CONTENT_PAGE_STATUSES)[number];

export const CONTENT_PAGE_DEFINITIONS: Record<
  ContentPageSlug,
  {
    slug: ContentPageSlug;
    label: string;
    path: string;
  }
> = {
  about: {
    slug: "about",
    label: "About",
    path: "/about",
  },
  "how-it-works": {
    slug: "how-it-works",
    label: "How It Works",
    path: "/how-it-works",
  },
  careers: {
    slug: "careers",
    label: "Careers",
    path: "/careers",
  },
  faqs: {
    slug: "faqs",
    label: "FAQs",
    path: "/faqs",
  },
  privacy: {
    slug: "privacy",
    label: "Privacy",
    path: "/privacy",
  },
  terms: {
    slug: "terms",
    label: "Terms",
    path: "/terms",
  },
  "acceptable-use": {
    slug: "acceptable-use",
    label: "Acceptable Use",
    path: "/acceptable-use",
  },
  cookies: {
    slug: "cookies",
    label: "Cookies",
    path: "/cookies",
  },
};

export type ContentPageRecord = {
  id: string | null;
  slug: ContentPageSlug;
  title: string;
  summary: string | null;
  body: string;
  status: ContentPageStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  path: string;
};

export type AdminContentPagesData = {
  pages: ContentPageRecord[];
  schemaReady: boolean;
};

export type SaveContentPageInput = {
  slug: ContentPageSlug;
  title: string;
  summary: string;
  body: string;
  status: ContentPageStatus;
  seoTitle: string;
  seoDescription: string;
};

export type SaveContentPageResult =
  | {
      success: true;
      page: ContentPageRecord;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

export function isContentPageSlug(value: string): value is ContentPageSlug {
  return CONTENT_PAGE_SLUGS.includes(value as ContentPageSlug);
}
