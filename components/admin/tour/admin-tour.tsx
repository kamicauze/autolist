"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { HotspotOverlay, type HotspotStep } from "./hotspot-overlay";
import {
  getTourStateSnapshot,
  subscribeToTourState,
} from "./tour-state";

// Bump this when tour copy or step structure changes meaningfully so returning
// admins see the updated walkthrough. All module storage keys are namespaced
// under this version.
const TOUR_VERSION = 3;
const STORAGE_KEY = (moduleId: string) =>
  `autolist:admin-tour:v${TOUR_VERSION}:${moduleId}`;

type ModuleId =
  | "portal-intro"
  | "dashboard"
  | "users"
  | "listings"
  | "review"
  | "verification"
  | "payments"
  | "analytics"
  | "audit-logs"
  | "cms-homepage"
  | "cms-pages"
  | "cms-media"
  | "ads-banners"
  | "blogs-content"
  | "special-offers"
  | "settings"
  | "roles-permissions"
  | "insurance-requests"
  | "car-inquiries"
  | "featured-listings"
  | "reports";

type TourState = Record<string, string>;

type ModuleTour = {
  /** Unique id used as the localStorage key suffix. */
  id: ModuleId;
  /**
   * Pathname-prefix that activates this tour. `null` = the global intro tour.
   * Used as a fallback when `match` is not provided.
   */
  pathnamePrefix: string | null;
  /**
   * Optional predicate for sub-state-aware tours. Receives the full pathname
   * and the current shared tour state (e.g. `cms.activeArea`). When provided,
   * `pathnamePrefix` is ignored for activation purposes.
   */
  match?: (pathname: string, state: TourState) => boolean;
  /** Display label (used for telemetry / future "you've seen N tours" UI). */
  label: string;
  /** The actual steps. */
  steps: HotspotStep[];
};

// ---------------------------------------------------------------------------
// Tour content. Add or extend tours here — every entry below auto-becomes
// available on the matching pathname and replays via the help button.
// ---------------------------------------------------------------------------

/**
 * One-time intro to the admin shell. Shown the first time an admin lands on
 * any /admin route. Module-specific tours play after it on later pages.
 */
const PORTAL_INTRO: ModuleTour = {
  id: "portal-intro",
  pathnamePrefix: null,
  label: "Welcome to the admin portal",
  steps: [
    {
      id: "welcome",
      title: "Welcome — quick tour",
      body:
        "This is the Autolist admin. We'll do a 30-second tour of the bits you'll touch every day. Each section also has its own short walkthrough the first time you open it.",
    },
    {
      id: "sidebar",
      selector: '[data-tour="admin-sidebar"]',
      title: "The left menu",
      body:
        "This is how you move around. Users, listings, the review queue, KYC, payments, and content all live here. A red number on a row means something is waiting for you.",
      placement: "right",
    },
    {
      id: "topnav",
      selector: '[data-tour="admin-topnav"]',
      title: "Top shortcuts",
      body:
        "Six links to the pages you'll open most. Same destinations as the sidebar, just easier to reach when you're already up here.",
      placement: "bottom",
    },
    {
      id: "notifications",
      selector: '[data-tour="admin-notifications"]',
      title: "The bell",
      body:
        "Live alerts land here — new flags, KYC submissions, payouts, reports. A dot means there's something new since you last checked.",
      placement: "bottom",
    },
    {
      id: "primary-action",
      selector: '[data-tour="admin-primary-action"]',
      title: "The big blue button",
      body:
        "This button changes based on which page you're on. It's there to help you reach the most useful next step in one click.",
      placement: "bottom",
    },
    {
      id: "help",
      selector: '[data-tour="admin-help"]',
      title: "The help icon",
      body:
        "Stuck or want a refresher? Click this icon. It plays the tour for whatever page you're looking at right now. You can use it as often as you like.",
      placement: "bottom",
    },
  ],
};

const DASHBOARD_TOUR: ModuleTour = {
  id: "dashboard",
  pathnamePrefix: "/admin/dashboard",
  label: "Dashboard",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "Your daily home page",
      body:
        "The dashboard is the first place to look in the morning. The button on the right takes you straight to the busiest queue right now.",
      placement: "bottom",
    },
    {
      id: "stats",
      selector: '[data-tour="admin-dashboard-stats"]',
      title: "Four numbers that matter",
      body:
        "Live counts for active listings, things waiting on review, total users, and the support queue. If a number jumps suddenly, that's usually worth investigating.",
      placement: "bottom",
    },
    {
      id: "table",
      selector: '[data-tour="admin-page-table"]',
      title: "Recent activity",
      body:
        "The most recent listings, signups, and tickets. Click any row to jump to the full record. Use this to spot odd patterns — bursts of new accounts, repeat phone numbers, etc.",
      placement: "top",
    },
  ],
};

const USERS_TOUR: ModuleTour = {
  id: "users",
  pathnamePrefix: "/admin/users",
  label: "Users",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "Everyone on the platform",
      body:
        "This page lists every account: buyers, sellers, dealers, and staff. Use it for support checks like finding a user fast, checking their role, and seeing their account status.",
      placement: "bottom",
    },
    {
      id: "table",
      selector: '[data-tour="admin-page-table"]',
      title: "The user list",
      body:
        "Each row shows the role, account status, join date, and recent activity. This view is currently read-only, so account changes still happen through the roles and permissions workflow.",
      placement: "top",
    },
  ],
};

const LISTINGS_TOUR: ModuleTour = {
  id: "listings",
  pathnamePrefix: "/admin/listings",
  label: "All Listings",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "Every listing on Autolist",
      body:
        "All listings across all sellers and dealers in one place. Filter by status, category, or seller type to drill in.",
      placement: "bottom",
    },
    {
      id: "table",
      selector: '[data-tour="admin-page-table"]',
      title: "The listing table",
      body:
        "The colour pills tell you the state — green is live, amber is waiting on review, red is rejected or sold. The action menu on each row covers approving, rejecting, marking as featured, and removing the listing.",
      placement: "top",
    },
  ],
};

const REVIEW_TOUR: ModuleTour = {
  id: "review",
  pathnamePrefix: "/admin/review",
  label: "Review Queue",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "The single moderation inbox",
      body:
        "Anything that needs a human decision lives here — new listings waiting for approval, user reports, and disputes. Oldest items rise to the top so nothing gets forgotten.",
      placement: "bottom",
    },
    {
      id: "primary-action",
      selector: '[data-tour="admin-primary-action"]',
      title: "Quick exit",
      body:
        "Once you've cleared the queue, this button takes you back to the dashboard so you can pick the next thing to do.",
      placement: "bottom",
    },
  ],
};

const VERIFICATION_TOUR: ModuleTour = {
  id: "verification",
  pathnamePrefix: "/admin/verification",
  label: "Verification (KYC)",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "ID and licence checks",
      body:
        "Sellers and dealers upload their ID, dealer licence, and proof of address here. Your job is to approve real ones and reject anything fake or unreadable. Each row shows how long it's been waiting — anything over 48 hours is flagged.",
      placement: "bottom",
    },
    {
      id: "table",
      selector: '[data-tour="admin-page-table"]',
      title: "The submissions queue",
      body:
        "Click a row to open the document viewer. You can zoom in, compare to the user's profile data, then approve or reject with a note. Every decision is logged so we can audit it later.",
      placement: "top",
    },
  ],
};

const PAYMENTS_TOUR: ModuleTour = {
  id: "payments",
  pathnamePrefix: "/admin/payments",
  label: "Payments",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "Money in, money out",
      body:
        "Featured-listing fees, dealer subscriptions, and seller payouts all show up here. Use this as a read-only ledger while refund and dispute handling remains outside this screen.",
      placement: "bottom",
    },
    {
      id: "table",
      selector: '[data-tour="admin-page-table"]',
      title: "The transaction log",
      body:
        "Every payment is timestamped and tied to a user and listing when that data is available. The table is for review and reconciliation; it does not yet open a detail drawer.",
      placement: "top",
    },
  ],
};

const ANALYTICS_TOUR: ModuleTour = {
  id: "analytics",
  pathnamePrefix: "/admin/analytics",
  label: "Analytics",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "Marketplace trends",
      body:
        "Bigger-picture numbers — how many listings, how much revenue, and how listings convert into sales. The current view summarizes the last 30 days.",
      placement: "bottom",
    },
  ],
};

// CMS has three sub-areas (Homepage / Pages / Media) controlled by component
// state, not the URL. The CMS page publishes its `activeArea` to shared tour
// state so we can fire the right sub-tour as the user switches tabs.
const CMS_HOMEPAGE_TOUR: ModuleTour = {
  id: "cms-homepage",
  pathnamePrefix: "/admin/cms",
  match: (pathname, state) =>
    pathname.startsWith("/admin/cms") &&
    (state["cms.activeArea"] || "homepage") === "homepage",
  label: "CMS — Homepage",
  steps: [
    {
      id: "intro",
      selector: '[data-tour="admin-page-header"]',
      title: "Homepage editor",
      body:
        "This is where you change what visitors see on the front page. Things like the big hero image, the headline, and the marketing sections below it. Nothing goes live until you click Publish.",
      placement: "bottom",
    },
    {
      id: "area-switcher",
      selector: '[data-tour="cms-area-switcher"]',
      title: "Three areas in one place",
      body:
        "Homepage is selected now. Pages is for legal and about-us content. Media is the shared image library. Click between them at any time — each one has its own short tour.",
      placement: "bottom",
    },
    {
      id: "stats",
      selector: '[data-tour="cms-stats"]',
      title: "What's live and what's not",
      body:
        "Quick numbers showing how many blocks are live, how many are still drafts, and how many have unpublished changes waiting. The 'unpublished changes' number should be zero before you log off for the day.",
      placement: "bottom",
    },
    {
      id: "block-list",
      selector: '[data-tour="cms-homepage-block-list"]',
      title: "Pick a block",
      body:
        "Each block is a separate piece of the homepage — hero slides, featured listings, marketing sections. Click any one to load it in the editor on the right. The pill tells you if it's live, drafted, or has changes you haven't published yet.",
      placement: "right",
    },
    {
      id: "editor",
      selector: '[data-tour="cms-homepage-editor"]',
      title: "Edit the block",
      body:
        "Change the text, swap out images, add or remove hero slides. The 'Preview home' button opens the real homepage in a new tab so you can see your changes before going live.",
      placement: "left",
    },
    {
      id: "publish",
      selector: '[data-tour="cms-homepage-publish"]',
      title: "Save draft or publish",
      body:
        "'Save draft' keeps your work but doesn't show it to visitors yet. 'Publish' pushes it live straight away. Both actions are recorded so we can roll back if something goes wrong.",
      placement: "bottom",
    },
  ],
};

const CMS_PAGES_TOUR: ModuleTour = {
  id: "cms-pages",
  pathnamePrefix: "/admin/cms",
  match: (pathname, state) =>
    pathname.startsWith("/admin/cms") && state["cms.activeArea"] === "pages",
  label: "CMS — Pages",
  steps: [
    {
      id: "intro",
      selector: '[data-tour="admin-page-header"]',
      title: "Static pages",
      body:
        "Pages like About Us, Terms, Privacy, and Contact. Each one lives at a fixed URL on the public site. You can change the words on the page, but the URL itself is locked — that needs a developer to change.",
      placement: "bottom",
    },
    {
      id: "stats",
      selector: '[data-tour="cms-stats"]',
      title: "Page status",
      body:
        "How many pages we manage, how many are live, how many are drafts, and when the last update went out. Useful for checking whether the legal team's latest changes are live yet.",
      placement: "bottom",
    },
    {
      id: "page-list",
      selector: '[data-tour="cms-pages-list"]',
      title: "Page list",
      body:
        "Every page in the system. Each row shows the title, its URL, current state, and a one-line summary. Click any row to load it in the editor on the right.",
      placement: "right",
    },
    {
      id: "editor",
      selector: '[data-tour="cms-pages-editor"]',
      title: "Edit the page",
      body:
        "Update the title, the body content, and the SEO info that shows up on Google. Use Preview to see the live page in a new tab before publishing.",
      placement: "left",
    },
    {
      id: "publish",
      selector: '[data-tour="cms-pages-publish"]',
      title: "Save changes or publish",
      body:
        "'Save changes' keeps your edit as a draft. 'Publish now' pushes it to the live site immediately — visitors will see it on the next page load. Both are recorded in the audit log.",
      placement: "bottom",
    },
  ],
};

const CMS_MEDIA_TOUR: ModuleTour = {
  id: "cms-media",
  pathnamePrefix: "/admin/cms",
  match: (pathname, state) =>
    pathname.startsWith("/admin/cms") && state["cms.activeArea"] === "media",
  label: "CMS — Media",
  steps: [
    {
      id: "intro",
      selector: '[data-tour="admin-page-header"]',
      title: "Image library",
      body:
        "All the images we use across the site live here — homepage hero shots, blog covers, banner artwork, offer thumbnails. Once you upload an image here, you can pick it from any other CMS page.",
      placement: "bottom",
    },
    {
      id: "stats",
      selector: '[data-tour="cms-media-stats"]',
      title: "Library snapshot",
      body:
        "How many images we have, how many file types, and the total size after our automatic optimisation. Smaller is better — the smaller the library, the faster the site loads.",
      placement: "bottom",
    },
    {
      id: "upload",
      selector: '[data-tour="cms-media-upload"]',
      title: "Upload an image",
      body:
        "Drop or browse for a JPG, PNG, or WebP file. We automatically convert it to WebP at several sizes so the public site loads fast on every device. Original files are kept too.",
      placement: "top",
    },
    {
      id: "library",
      selector: '[data-tour="cms-media-library"]',
      title: "Pick from existing images",
      body:
        "Search by filename or filter to find an image. Click one to copy its URL or see a full preview. If you upload a file with the same name as an existing one, the old version is replaced — so use a different name if you want to keep both.",
      placement: "top",
    },
  ],
};

const AUDIT_LOG_TOUR: ModuleTour = {
  id: "audit-logs",
  pathnamePrefix: "/admin/audit-logs",
  label: "Audit Logs",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "Who did what, and when",
      body:
        "Every change made by an admin is recorded here — who did it, when, and on which user or listing. This is currently a read-only chronological log.",
      placement: "bottom",
    },
    {
      id: "table",
      selector: '[data-tour="admin-page-table"]',
      title: "The event log",
      body:
        "Newest events appear at the top with actor, action, entity, and summary details. Use the visible context here for support escalations and post-mortems.",
      placement: "top",
    },
  ],
};

// ---------------------------------------------------------------------------
// Content modules
// ---------------------------------------------------------------------------

const ADS_BANNERS_TOUR: ModuleTour = {
  id: "ads-banners",
  pathnamePrefix: "/admin/ads-banners",
  label: "Ads & Banners",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "Marketing banners",
      body:
        "All the banners that show up on the homepage and around the site live here. You can run multiple campaigns at once and schedule them to start and stop on specific dates.",
      placement: "bottom",
    },
    {
      id: "list",
      selector: '[data-tour="ads-list"]',
      title: "Campaign list",
      body:
        "Each row is a banner campaign. The pill shows whether it's live, paused, or scheduled for later. Click a row to open it on the right.",
      placement: "right",
    },
    {
      id: "editor",
      selector: '[data-tour="ads-editor"]',
      title: "Edit a banner",
      body:
        "Pick where it shows (homepage, search, listing), upload the image, set the link target, and choose start and end dates. Toggle Active when you want it live. Remember to save.",
      placement: "left",
    },
  ],
};

const BLOGS_CONTENT_TOUR: ModuleTour = {
  id: "blogs-content",
  pathnamePrefix: "/admin/blogs-content",
  label: "Blogs & Content",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "Blog posts",
      body:
        "Write and publish blog posts here. Posts show up on the public site under News and on the homepage in the latest-news strip.",
      placement: "bottom",
    },
    {
      id: "list",
      selector: '[data-tour="blogs-list"]',
      title: "Post list",
      body:
        "Every post on the platform — drafts and published. The pill on each row tells you the state. Click one to load it in the editor on the right.",
      placement: "right",
    },
    {
      id: "editor",
      selector: '[data-tour="blogs-editor"]',
      title: "The post editor",
      body:
        "Edit the title, summary, body, and cover image. Set categories and tags. Use Save Draft to keep working, or Publish to push it live to the public site straight away.",
      placement: "left",
    },
  ],
};

const SPECIAL_OFFERS_TOUR: ModuleTour = {
  id: "special-offers",
  pathnamePrefix: "/admin/special-offers",
  label: "Special Offers",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "Promotions and deals",
      body:
        "This is where you create the discount and promo cards that show up on the homepage and in marketing emails. Each one has its own start and end date.",
      placement: "bottom",
    },
    {
      id: "list",
      selector: '[data-tour="offers-list"]',
      title: "Offer list",
      body:
        "Every offer in the system, in display order. Drag to reorder them on the homepage. The pill tells you whether it's running, paused, or expired.",
      placement: "right",
    },
    {
      id: "editor",
      selector: '[data-tour="offers-editor"]',
      title: "Build the offer",
      body:
        "Set the title, description, image, and link. Choose the start and end dates. Use the Active toggle to pause without deleting — the offer will stop showing on the public site immediately.",
      placement: "left",
    },
  ],
};

// ---------------------------------------------------------------------------
// Settings modules
// ---------------------------------------------------------------------------

const SETTINGS_TOUR: ModuleTour = {
  id: "settings",
  pathnamePrefix: "/admin/settings",
  label: "Settings",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "Platform-wide settings",
      body:
        "These are the defaults that affect the whole site — things like the default currency, support contacts, and which features are turned on. Be careful here; changes go live immediately for every user.",
      placement: "bottom",
    },
    {
      id: "platform",
      selector: '[data-tour="settings-platform"]',
      title: "The settings form",
      body:
        "All editable settings in one place. Make your changes, then click Save at the bottom. Anything you change is logged in the audit log so we can roll back later if needed.",
      placement: "top",
    },
  ],
};

const ROLES_PERMISSIONS_TOUR: ModuleTour = {
  id: "roles-permissions",
  pathnamePrefix: "/admin/roles-permissions",
  label: "Roles & Permissions",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "Who can do what",
      body:
        "This page controls staff access. Use it to add a new admin, give support staff the right tools, or take access away from someone who's no longer on the team.",
      placement: "bottom",
    },
    {
      id: "coverage",
      selector: '[data-tour="roles-coverage"]',
      title: "Role coverage",
      body:
        "A quick look at how many users hold each role — buyers, sellers, dealers, support, admins. Useful for spotting accidental over-assignment, like too many people having admin rights.",
      placement: "bottom",
    },
    {
      id: "assignments",
      selector: '[data-tour="roles-assignments"]',
      title: "Staff assignments",
      body:
        "The actual list of staff accounts and what role each one has. Only staff roles show here (sales agents, support, admins, super admins) — regular users are hidden so this list stays focused.",
      placement: "top",
    },
    {
      id: "matrix",
      selector: '[data-tour="roles-matrix"]',
      title: "Permission matrix",
      body:
        "A grid showing exactly which actions each role can perform. Use this as a reference when you're not sure whether to make someone an admin vs. support. Each tick is one specific permission.",
      placement: "top",
    },
  ],
};

// ---------------------------------------------------------------------------
// Operations modules (the rest)
// ---------------------------------------------------------------------------

const FEATURED_LISTINGS_TOUR: ModuleTour = {
  id: "featured-listings",
  pathnamePrefix: "/admin/featured-listings",
  label: "Featured Listings",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "The featured rail",
      body:
        "Listings shown in the featured strip on the homepage. Sellers pay to be here, so it's important to keep this slot fresh and to remove anything that's already sold.",
      placement: "bottom",
    },
    {
      id: "add",
      selector: '[data-tour="featured-add"]',
      title: "Pin a new listing",
      body:
        "Search the live inventory and pin a listing into the rail. Set the start date, end date, and the order it should appear in. Helpful for paid promos and seasonal pushes.",
      placement: "bottom",
    },
    {
      id: "rail",
      selector: '[data-tour="featured-rail"]',
      title: "Currently pinned",
      body:
        "Everything currently in the homepage rail. Drag to reorder, edit the date window, or unpin a listing entirely. Pinned listings only show up if they're still active and inside the date window you set.",
      placement: "top",
    },
  ],
};

const INSURANCE_REQUESTS_TOUR: ModuleTour = {
  id: "insurance-requests",
  pathnamePrefix: "/admin/insurance-requests",
  label: "Insurance Requests",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "Insurance quote requests",
      body:
        "Buyers can ask for an insurance quote when they're about to purchase a car. Their requests come through here so you can pass them on to your insurance partner.",
      placement: "bottom",
    },
    {
      id: "list",
      selector: '[data-tour="insurance-list"]',
      title: "The live queue",
      body:
        "Every quote request, oldest first. Click a row to see the buyer's contact details, the car they want to insure, and any notes they left.",
      placement: "right",
    },
    {
      id: "detail",
      selector: '[data-tour="insurance-detail"]',
      title: "Request details",
      body:
        "All the info needed to forward to your insurance partner — buyer name, phone, the listing in question, and the buyer's notes. Mark the request as handed off when you've sent it on.",
      placement: "left",
    },
  ],
};

const CAR_INQUIRIES_TOUR: ModuleTour = {
  id: "car-inquiries",
  pathnamePrefix: "/admin/car-inquiries",
  label: "Car Inquiries",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "Buyer questions",
      body:
        "When a buyer messages a seller through Autolist, the conversation lands here too if it gets escalated. Use this to step in if someone's not getting a response or if the chat looks like a scam.",
      placement: "bottom",
    },
    {
      id: "list",
      selector: '[data-tour="inquiries-list"]',
      title: "Ticket queue",
      body:
        "Every inquiry waiting for action. The pill shows the state — open, replied, closed. Click a row to load the current ticket details on the right.",
      placement: "right",
    },
    {
      id: "detail",
      selector: '[data-tour="inquiries-detail"]',
      title: "The conversation",
      body:
        "The detail panel shows the latest message preview, assignment, status, internal notes, and resolution notes. Use it to triage the inquiry and record how it was handled.",
      placement: "left",
    },
  ],
};

const REPORTS_TOUR: ModuleTour = {
  id: "reports",
  pathnamePrefix: "/admin/reports",
  label: "Reports",
  steps: [
    {
      id: "header",
      selector: '[data-tour="admin-page-header"]',
      title: "Reports and safety tickets",
      body:
        "When users flag a listing or another user for being suspicious, scammy, or unsafe, the report lands here. Treat anything in this queue as urgent — these are real safety signals.",
      placement: "bottom",
    },
    {
      id: "queue",
      selector: '[data-tour="reports-queue"]',
      title: "Live ticket queue",
      body:
        "All open reports, oldest first. Click any row to open the full report and the records it points to. From there you can take action — remove a listing, suspend a user, or close it as a false alarm.",
      placement: "bottom",
    },
    {
      id: "activity",
      selector: '[data-tour="reports-activity"]',
      title: "Recent activity",
      body:
        "What's been happening — assignments, status changes, resolutions. Useful when handing off to a teammate, or when checking what's already been done before you take action.",
      placement: "top",
    },
  ],
};

const MODULE_TOURS: ModuleTour[] = [
  DASHBOARD_TOUR,
  USERS_TOUR,
  LISTINGS_TOUR,
  REVIEW_TOUR,
  VERIFICATION_TOUR,
  PAYMENTS_TOUR,
  ANALYTICS_TOUR,
  AUDIT_LOG_TOUR,
  CMS_HOMEPAGE_TOUR,
  CMS_PAGES_TOUR,
  CMS_MEDIA_TOUR,
  ADS_BANNERS_TOUR,
  BLOGS_CONTENT_TOUR,
  SPECIAL_OFFERS_TOUR,
  SETTINGS_TOUR,
  ROLES_PERMISSIONS_TOUR,
  FEATURED_LISTINGS_TOUR,
  INSURANCE_REQUESTS_TOUR,
  CAR_INQUIRIES_TOUR,
  REPORTS_TOUR,
];

function findActiveModuleTour(pathname: string, state: TourState): ModuleTour | null {
  // Tours with a `match` predicate take priority — they let CMS sub-tours
  // resolve based on which tab is active, not just the URL.
  const stateful = MODULE_TOURS.find((m) => m.match && m.match(pathname, state));
  if (stateful) return stateful;

  // Fall back to longest matching pathname prefix for plain-route tours.
  return (
    MODULE_TOURS
      .filter((m) => !m.match && m.pathnamePrefix && pathname.startsWith(m.pathnamePrefix))
      .sort((a, b) => (b.pathnamePrefix?.length || 0) - (a.pathnamePrefix?.length || 0))[0] || null
  );
}

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

function hasSeenTour(moduleId: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return Boolean(window.localStorage.getItem(STORAGE_KEY(moduleId)));
  } catch {
    return true; // pretend seen if storage is unavailable so we don't loop
  }
}

function markTourSeen(moduleId: string) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY(moduleId),
      JSON.stringify({ at: new Date().toISOString() })
    );
  } catch {
    /* no-op */
  }
}

// ---------------------------------------------------------------------------
// Provider + hook
// ---------------------------------------------------------------------------

type AdminTourContextValue = {
  /** Replay the current page's module tour (falls back to portal intro). */
  start: () => void;
  /** Force-open a specific module's tour by id. */
  startTour: (moduleId: ModuleId) => void;
  stop: () => void;
  isOpen: boolean;
  activeModuleLabel: string | null;
};

const AdminTourContext = React.createContext<AdminTourContextValue | null>(null);

interface AdminTourProviderProps {
  children: React.ReactNode;
}

export function AdminTourProvider({ children }: AdminTourProviderProps) {
  const pathname = usePathname() || "";
  const [isOpen, setIsOpen] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [activeTour, setActiveTour] = React.useState<ModuleTour | null>(null);
  const [tourState, setTourState] = React.useState<TourState>(() =>
    getTourStateSnapshot()
  );

  const onAdminRoute = pathname.startsWith("/admin");
  const moduleForPath = React.useMemo(
    () => findActiveModuleTour(pathname, tourState),
    [pathname, tourState]
  );

  // Subscribe to shared tour state so sub-tours (CMS Homepage / Pages / Media)
  // can re-evaluate when the user switches tabs inside a module.
  React.useEffect(() => {
    return subscribeToTourState((snapshot) => {
      setTourState(snapshot);
    });
  }, []);

  // Auto-start logic. Runs whenever pathname OR sub-state changes:
  // 1. If portal intro hasn't been seen → show it.
  // 2. Else if the resolved module tour hasn't been seen → show it.
  // 3. Don't reopen a tour that's already been dismissed for the same module.
  // 4. Don't open while another tour is already on screen.
  React.useEffect(() => {
    if (!onAdminRoute || typeof window === "undefined") return;
    if (isOpen) return;

    let cancelled = false;
    const t = window.setTimeout(() => {
      if (cancelled) return;

      if (!hasSeenTour(PORTAL_INTRO.id)) {
        setActiveTour(PORTAL_INTRO);
        setStepIndex(0);
        setIsOpen(true);
        return;
      }

      if (moduleForPath && !hasSeenTour(moduleForPath.id)) {
        setActiveTour(moduleForPath);
        setStepIndex(0);
        setIsOpen(true);
      }
    }, 600); // let the layout settle so spotlight rects are accurate

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [pathname, onAdminRoute, moduleForPath, isOpen]);

  const start = React.useCallback(() => {
    // Help-button behavior: replay the most relevant tour for the current page.
    // If the user is on a module page, replay that module; otherwise replay
    // the portal intro.
    const target = moduleForPath || PORTAL_INTRO;
    setActiveTour(target);
    setStepIndex(0);
    setIsOpen(true);
  }, [moduleForPath]);

  const startTour = React.useCallback((moduleId: ModuleId) => {
    if (moduleId === "portal-intro") {
      setActiveTour(PORTAL_INTRO);
    } else {
      const t = MODULE_TOURS.find((m) => m.id === moduleId);
      if (!t) return;
      setActiveTour(t);
    }
    setStepIndex(0);
    setIsOpen(true);
  }, []);

  const stop = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const persistAndClose = React.useCallback(() => {
    if (activeTour) markTourSeen(activeTour.id);
    setIsOpen(false);
  }, [activeTour]);

  const onNext = React.useCallback(() => {
    if (!activeTour) return;
    setStepIndex((i) => Math.min(activeTour.steps.length - 1, i + 1));
  }, [activeTour]);

  const onPrev = React.useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const steps = activeTour?.steps || [];
  const value = React.useMemo<AdminTourContextValue>(
    () => ({
      start,
      startTour,
      stop,
      isOpen,
      activeModuleLabel: activeTour?.label ?? null,
    }),
    [start, startTour, stop, isOpen, activeTour]
  );

  return (
    <AdminTourContext.Provider value={value}>
      {children}
      <HotspotOverlay
        open={isOpen && steps.length > 0}
        steps={steps}
        stepIndex={Math.min(stepIndex, Math.max(0, steps.length - 1))}
        onPrev={onPrev}
        onNext={onNext}
        onSkip={persistAndClose}
        onFinish={persistAndClose}
      />
    </AdminTourContext.Provider>
  );
}

export function useAdminTour(): AdminTourContextValue {
  const ctx = React.useContext(AdminTourContext);
  if (!ctx) {
    return {
      start: () => {},
      startTour: () => {},
      stop: () => {},
      isOpen: false,
      activeModuleLabel: null,
    };
  }
  return ctx;
}

/**
 * Help button rendered in the admin top header. Replays the most relevant
 * tour for the current page (module tour if on a module page, otherwise the
 * portal intro).
 */
export function AdminTourHelpButton({ className }: { className?: string }) {
  const { start } = useAdminTour();
  return (
    <button
      type="button"
      onClick={start}
      data-tour="admin-help"
      aria-label="Replay admin portal tour"
      title="Replay tour"
      className={
        className ||
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#374151] transition hover:border-[#2563eb] hover:text-[#2563eb]"
      }
    >
      <HelpCircle className="h-5 w-5" />
    </button>
  );
}
