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
      "How Autolist Kenya collects, uses, shares, retains, and protects personal data.",
    body: `<p><strong>Effective date: 22 July 2026</strong></p>
<p>Autolist Kenya ("Autolist", "we", "us", or "our") respects your privacy. This policy explains how we handle personal data when you use our vehicle marketplace, website, account tools, and related services (the "Platform"). We process personal data in accordance with the Kenya Data Protection Act, 2019 and applicable regulations.</p>
<h2>1. Who controls your data</h2>
<p>Autolist Kenya is the data controller for personal data processed through the Platform. Questions and data-rights requests can be sent to <a href="mailto:support@autolist.co.ke">support@autolist.co.ke</a>.</p>
<h2>2. Personal data we collect</h2>
<ul>
<li><strong>Identity and contact data:</strong> your name, email address, phone number, account role, and profile details.</li>
<li><strong>Verification data:</strong> business registration, KRA, dealer, ownership, identity, or related documents when verification is required. Do not send sensitive documents through ordinary listing enquiries.</li>
<li><strong>Account and security data:</strong> authentication records, account preferences, access logs, fraud signals, and support history.</li>
<li><strong>Vehicle and listing data:</strong> vehicle specifications, price, photos, descriptions, location, listing status, saved vehicles, and comparison activity.</li>
<li><strong>Communication data:</strong> enquiries, reports, moderation notes, and messages sent through Platform-supported channels.</li>
<li><strong>Payment data:</strong> records for Autolist services such as subscriptions or featured listings. Payment credentials are handled by payment providers and are not used by Autolist to process the purchase price of a vehicle.</li>
<li><strong>Technical and usage data:</strong> IP address, browser and device information, security logs, pages visited, and cookies or similar storage described in our <a href="/cookies">Cookie Policy</a>.</li>
</ul>
<h2>3. How we collect data</h2>
<p>We collect data directly from you when you register, create or respond to a listing, request verification, contact support, submit a report, or purchase a Platform service. We also collect limited technical data automatically and may receive data from service providers, dealers, referral partners, public registers, or social sign-in providers where applicable.</p>
<h2>4. Why we use personal data</h2>
<ul>
<li>To create and secure accounts, publish listings, connect buyers and sellers, and provide support.</li>
<li>To verify dealers and sellers, review listings, investigate reports, prevent fraud, and enforce our policies.</li>
<li>To process and account for payments for Platform services.</li>
<li>To communicate about accounts, listings, enquiries, service updates, and—where permitted—marketing.</li>
<li>To understand and improve Platform performance, accessibility, reliability, and user experience.</li>
<li>To comply with legal, tax, regulatory, security, and dispute-resolution obligations.</li>
</ul>
<p>Depending on the activity, we rely on performance of a contract, compliance with law, legitimate interests, consent, or another lawful basis available under Kenyan data-protection law. You may withdraw consent where consent is the basis, without affecting earlier lawful processing.</p>
<h2>5. Public listings and other users</h2>
<p>Vehicle listings and dealer profiles are intended to be public. Information you choose to publish may be seen and shared by visitors. When you contact a seller or respond to an enquiry, the other party receives the information needed to continue that interaction. Avoid publishing identification documents, financial details, or other sensitive information in listings or enquiries.</p>
<h2>6. Service providers and disclosures</h2>
<p>We may share only the data needed with hosting, database, storage, security, email, messaging, mapping, analytics, identity-verification, AI-assistance, and payment providers that support the Platform. We may also disclose data where required by law, to protect users or the Platform, to investigate fraud, or as part of a business reorganisation subject to appropriate safeguards.</p>
<h2>7. Assistive AI</h2>
<p>Autolist may use assistive AI for tasks such as listing-quality suggestions, duplicate hints, search, or comparison research. AI does not automatically approve dealers, publish listings, or make final moderation decisions. Human review remains responsible for those decisions.</p>
<h2>8. Retention</h2>
<p>We retain personal data only for as long as reasonably necessary for the purpose collected, including account operation, listing history, fraud prevention, dispute handling, and legal, tax, or reporting duties. Retention periods vary by data type. We may retain limited records after account closure where law or legitimate security needs require it.</p>
<h2>9. Your rights</h2>
<p>Subject to applicable law, you may ask to be informed about our use of your data, access it, correct inaccurate or misleading data, object to certain processing, request deletion or restriction, withdraw consent, or obtain portable data where applicable. Send requests to <a href="mailto:support@autolist.co.ke">support@autolist.co.ke</a>. We may need to verify your identity and may retain data where the law requires it.</p>
<h2>10. International transfers</h2>
<p>Some service providers may process data outside Kenya. Where that happens, we use contractual, technical, organisational, or other safeguards required by applicable law.</p>
<h2>11. Security and data breaches</h2>
<p>We use access controls, encryption where appropriate, logging, backups, and operational safeguards designed to protect personal data. No online service can guarantee absolute security. Where a notifiable personal-data breach occurs, we will notify the Office of the Data Protection Commissioner and affected people as required by law.</p>
<h2>12. Children</h2>
<p>The Platform is not intended for people under 18, and people under 18 may not register or list a vehicle.</p>
<h2>13. Updates and complaints</h2>
<p>We may update this policy when the Platform or legal requirements change. The effective date above identifies the current version. You may also learn about your rights or lodge a complaint with the <a href="https://www.odpc.go.ke/">Office of the Data Protection Commissioner</a>.</p>`,
    seoTitle: "Privacy Policy | Autolist",
    seoDescription:
      "Read the Autolist privacy policy for a summary of how platform data is collected and used.",
  },
  terms: {
    title: "Terms of Use",
    summary:
      "The conditions that apply when using Autolist, publishing listings, or contacting other users.",
    body: `<p><strong>Effective date: 22 July 2026</strong></p>
<p>These Terms of Use ("Terms") govern your use of the Autolist Kenya vehicle marketplace, website, account tools, and related services (the "Platform"). By accessing or using the Platform, you agree to these Terms. If you do not agree, do not use the Platform.</p>
<h2>1. Autolist's role</h2>
<p>Autolist provides an online marketplace that helps buyers discover vehicles and contact private sellers or dealers. Autolist does not own, sell, inspect, deliver, or transfer ownership of vehicles listed by users. Unless we expressly state otherwise for a specific service, Autolist is not a party to a vehicle sale and does not hold vehicle-purchase money in escrow.</p>
<h2>2. Eligibility and accounts</h2>
<ul>
<li>You must be at least 18 years old and legally able to enter into these Terms.</li>
<li>You must provide accurate, current information and keep your sign-in details secure.</li>
<li>Your account is personal to you unless it is an approved dealership or sales-agent account. Do not sell, transfer, or share access without permission.</li>
<li>Dealers and sales agents may be required to provide business, role, and verification documents before receiving verified status or related permissions.</li>
</ul>
<h2>3. Listings</h2>
<p>Sellers are responsible for their listings. A listing must accurately describe the vehicle, price, ownership, condition, mileage, known material defects, and availability. Photos must represent the actual vehicle. You must have the right and authority to advertise the vehicle.</p>
<p>Autolist may review, reject, edit for formatting, pause, expire, or remove a listing that is incomplete, misleading, duplicated, unlawful, unsafe, sold, or contrary to these Terms or our <a href="/acceptable-use">Acceptable Use Policy</a>. Moderation and verification reduce risk but are not warranties about a vehicle or seller.</p>
<h2>4. Buyers, sellers, and transactions</h2>
<ul>
<li>Buyers must inspect the vehicle, verify the seller and original documents, confirm ownership and encumbrances, and make their own assessment before committing money.</li>
<li>Sellers must answer material questions honestly, protect personal documents, verify cleared payment, and complete ownership transfer in accordance with Kenyan law.</li>
<li>Both parties must use lawful payment methods and keep appropriate written records.</li>
<li>Vehicle price, deposits, delivery, inspection, financing, warranties, and ownership transfer are agreed directly between buyer and seller.</li>
</ul>
<p>Read our <a href="/security-advice">Security Advice</a> before arranging a viewing, test drive, deposit, or transfer.</p>
<h2>5. Platform services and fees</h2>
<p>Autolist may charge for Platform services such as dealer memberships, featured listings, advertising, or other visibility tools. The price, duration, included features, taxes, renewal terms, and any refund rules shown when you order a service form part of these Terms.</p>
<p>Payments collected by Autolist are for Platform services only—not for purchasing a listed vehicle. A buyer should never send the vehicle purchase price to Autolist unless a separate, expressly identified service with its own terms is introduced.</p>
<h2>6. Enquiries and communications</h2>
<p>Use Platform-supported enquiry and messaging records where available. Do not send spam, harassment, phishing links, malware, sensitive identity documents, or unrelated promotions. We may review reports and relevant records to investigate abuse, support users, or comply with law.</p>
<h2>7. Your content and intellectual property</h2>
<p>You retain ownership of content you submit. You give Autolist a non-exclusive, worldwide, royalty-free licence to host, reproduce, resize, watermark, display, distribute, and promote that content as needed to operate and market the Platform and your listing. You confirm that you have the rights required to grant this licence.</p>
<p>Autolist's software, branding, design, and original content belong to Autolist or its licensors. You may not copy, scrape, reverse engineer, misuse, or commercially exploit them except as permitted by law or written permission.</p>
<h2>8. Suspension and termination</h2>
<p>You may stop using the Platform at any time. We may restrict, suspend, or terminate access, remove content, or withhold verification where we reasonably believe there is fraud, non-payment, risk to users, a policy breach, or a legal requirement. Where practical, we will provide notice or a way to seek review.</p>
<h2>9. Disclaimers</h2>
<p>The Platform is provided on an "as is" and "as available" basis to the extent permitted by law. Listings are supplied by users. Autolist does not guarantee that a listing is accurate, that a seller or buyer will complete a transaction, or that a vehicle is safe, roadworthy, unencumbered, or suitable for you.</p>
<h2>10. Liability</h2>
<p>To the maximum extent permitted by law, Autolist is not responsible for indirect or consequential loss, lost opportunity, user conduct, listing inaccuracies, vehicle defects, or disputes between buyers and sellers. Nothing in these Terms excludes liability that cannot lawfully be excluded. Where liability can be limited, Autolist's aggregate liability relating to a paid Platform service will not exceed the amount you paid for that service during the 12 months before the claim.</p>
<h2>11. Governing law and disputes</h2>
<p>These Terms are governed by the laws of the Republic of Kenya. Contact us first so we can try to resolve a Platform-related concern. A dispute that cannot be resolved informally may be taken to a court or other competent forum in Kenya.</p>
<h2>12. Changes and contact</h2>
<p>We may update these Terms as the Platform changes. The effective date above identifies the current version. Material changes will be communicated through the Platform or another appropriate channel. Questions can be sent to <a href="mailto:support@autolist.co.ke">support@autolist.co.ke</a>.</p>`,
    seoTitle: "Terms of Use | Autolist",
    seoDescription:
      "Review the core terms that govern using Autolist and publishing or responding to listings.",
  },
  "acceptable-use": {
    title: "Acceptable Use Policy",
    summary:
      "Rules that keep Autolist listings, accounts, communications, and technical access safe and trustworthy.",
    body: `<p><strong>Effective date: 22 July 2026</strong></p>
<p>This Acceptable Use Policy forms part of the Autolist <a href="/terms">Terms of Use</a>. It applies to every visitor, buyer, seller, dealer, sales agent, advertiser, and other person using the Platform.</p>
<h2>1. Use Autolist lawfully and honestly</h2>
<p>You must not use Autolist for fraud, deception, identity theft, money laundering, tax evasion, trafficking in stolen vehicles, forged documents, unlawful modifications, or any other illegal activity. Do not impersonate another person or business or misrepresent your authority to sell a vehicle.</p>
<h2>2. Listing standards</h2>
<ul>
<li>Provide accurate make, model, year, mileage, condition, price, ownership, and location information.</li>
<li>Use current images of the actual vehicle and disclose known material defects or damage.</li>
<li>Do not create duplicate, bait-and-switch, unavailable, or misleading listings.</li>
<li>Do not advertise a vehicle you do not own or have authority to sell.</li>
<li>Do not publish sensitive identity documents, banking details, or another person's personal data.</li>
</ul>
<h2>3. Communications</h2>
<p>Do not harass, threaten, stalk, discriminate against, or coerce another user. Do not send spam, unrelated promotions, phishing requests, fake payment notices, or repeated unwanted messages. Communications about a listing must remain relevant, respectful, and truthful.</p>
<h2>4. Harmful or restricted content</h2>
<p>Do not post content that is unlawful, hateful, discriminatory, defamatory, obscene, exploitative, deceptive, harmful, or infringing. You must have permission to use every photo, logo, description, and other work you upload.</p>
<h2>5. Technical abuse</h2>
<p>Do not scrape or harvest Platform data without written permission; bypass access controls or rate limits; probe for vulnerabilities without authorisation; upload malware; interfere with service availability; automate fake activity; reverse engineer protected components; or attempt to access another user's account or private data.</p>
<h2>6. Transactions and payments</h2>
<p>Do not use fake payment confirmations, fraudulent cheques, overpayment-and-refund schemes, unexplained third-party payments, or pressure tactics. Autolist payments cover Platform services only. Buyers and sellers must independently verify vehicle payments and transfers.</p>
<h2>7. Enforcement</h2>
<p>We may remove content, reduce visibility, pause a listing, request verification, restrict features, suspend or terminate an account, preserve evidence, recover losses, or report conduct to payment providers, regulators, or law-enforcement authorities. The action taken will depend on the seriousness, evidence, risk, and history of the conduct.</p>
<h2>8. Report a violation</h2>
<p>Use the report control on a listing where available, or email <a href="mailto:support@autolist.co.ke">support@autolist.co.ke</a> with the listing link, a clear description, and relevant evidence. Do not put sensitive identity documents in an ordinary report unless our team specifically requests a secure submission.</p>`,
    seoTitle: "Acceptable Use Policy | Autolist",
    seoDescription:
      "Read the rules for listings, communications, transactions, content, and technical access on Autolist Kenya.",
  },
  cookies: {
    title: "Cookie Policy",
    summary:
      "How Autolist uses essential cookies, its own visit and click counts, optional Google Analytics, and browser storage.",
    body: `<p><strong>Effective date: 13 November 2026</strong></p>
<p>This Cookie Policy explains how Autolist Kenya uses cookies and similar browser storage on the Platform. A cookie is a small text record stored by your browser. Some cookies last only for a session; others remain until they expire or you remove them.</p>
<h2>1. Cookies we currently use</h2>
<h3>Essential authentication and security</h3>
<p>We use essential cookies to keep you signed in, refresh authenticated sessions, protect account access, apply security controls, and maintain the state needed for core Platform functions. These cookies are necessary for requested services and cannot be disabled through an Autolist preference without also disabling those functions.</p>
<h3>Infrastructure security</h3>
<p>Our hosting, content-delivery, and security providers may set short-lived cookies or similar identifiers to distinguish legitimate traffic, mitigate abuse, and maintain reliable service.</p>
<h3>Preferences and local storage</h3>
<p>The Platform may use browser storage, which is technically separate from cookies, to remember interface preferences such as theme, dismissed guidance, or draft state on your device.</p>
<h2>2. Analytics and advertising</h2>
<h3>Autolist visit and click counts</h3>
<p>Autolist counts visits to public pages and clicks on key buttons and links, such as search, filters, listing and dealer links, WhatsApp, call, financing, sharing and saving. A first-party cookie, al_interaction_vid, holds a random identifier for up to one year so that a returning browser is not counted as a new visitor, and browser session storage holds a random visit identifier that resets after 30 minutes without activity. For each count we record the page path without query strings, the button or listing involved, whether the visitor was signed in, the device type and the external website that referred the visit. We do not record IP addresses, browser details, account details, messages, or form contents, and Autolist staff see these counts only as totals. This measurement runs on Autolist systems and does not use Google or any other third party.</p>
<h3>Google Analytics</h3>
<p>With your permission, we use Google Analytics to understand visits to public pages on autolist.co.ke, including which pages are visited and how visitors arrive. Google Analytics may set _ga and _ga_* cookies to distinguish browsers and sessions. We load Google Analytics only after you choose Allow analytics. Account, sign-in, dashboard, invitation, and seller onboarding pages are excluded, and page URLs and referrers are sent without query strings or fragments. We do not send account details, messages, form contents, or user IDs to Google Analytics.</p>
<p>Google processes analytics data on our behalf and may process it outside Kenya. Read <a href="https://policies.google.com/technologies/partner-sites">How Google uses information from sites or apps that use its services</a>. We do not use Meta Pixel or advertising cookies in this application.</p>
<h2>3. Managing cookies</h2>
<p>Choose Allow analytics or Decline analytics in the cookie notice. You can reopen Cookie preferences on public pages to change your choice. Declining or withdrawing consent stops analytics collection and removes this site's Google Analytics cookies; essential features remain available. Your choice is remembered in local storage on this browser.</p>
<p>You can view, block, or delete cookies in your browser settings. Blocking essential cookies may prevent sign-in, account management, listing submission, and other secured features from working. Browser storage can usually be cleared from the same privacy or site-data controls.</p>
<h2>4. Third-party destinations</h2>
<p>Links from Autolist may open third-party websites such as payment, map, social, or government services. Those sites control their own cookies and privacy practices; review their policies before continuing.</p>
<h2>5. Updates and contact</h2>
<p>We may update this policy when our technology or legal obligations change. The effective date above identifies the current version. Questions can be sent to <a href="mailto:support@autolist.co.ke">support@autolist.co.ke</a>. For more information about personal data, read our <a href="/privacy">Privacy Policy</a>.</p>`,
    seoTitle: "Cookie Policy | Autolist",
    seoDescription:
      "Learn how Autolist Kenya uses essential cookies, its own visit counts and optional Google Analytics, and manage your choices.",
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
