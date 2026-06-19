"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Heart,
  KeyRound,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Star,
  User,
  X,
} from "lucide-react";
import { AutolistLogo } from "@/components/brand/autolist-logo";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { ChangePasswordForm } from "@/components/dashboard/change-password/change-password-form";
import { FavoritesGrid } from "@/components/dashboard/favorites/favorites-grid";
import { ListingsTable } from "@/components/dashboard/listings-table";
import { MembershipPage } from "@/components/dashboard/membership/membership-page";
import { ChatLayout } from "@/components/dashboard/messages/chat-layout";
import { PageInsightsChart } from "@/components/dashboard/page-insights-chart";
import { ProfileForm } from "@/components/dashboard/profile/profile-form";
import { RecentReviews } from "@/components/dashboard/recent-reviews";
import { ReviewList } from "@/components/dashboard/reviews/review-list";
import {
  SellerPageHeader,
  SellerPagination,
  SellerStatCard,
  SellerStatusPill,
  SellerSurface,
  SellerTabs,
  SellerUserChip,
  formatDashboardCurrency,
  getInitials,
  listingBidCards,
  membershipPlans,
  sellerSummaryCards,
} from "@/components/dashboard/seller-dashboard-ui";

const previewUser = {
  email: "samplemade@gmail.com",
  user_metadata: {
    full_name: "Car Empire",
  },
};

const topNavLinks = [
  { name: "Home", href: "/" },
  { name: "Buy a car", href: "/search" },
  { name: "Sell a car", href: "/sell" },
  { name: "News & reviews", href: "/blog" },
  { name: "Tools & Services", href: "/faq" },
];

const salesRepNav = [
  { name: "Dashboard", href: "/sell/dashboard", icon: LayoutDashboard },
  { name: "All listings", href: "/sell/dashboard/all-listings", icon: ListOrdered },
  { name: "My favorite", href: "/sell/dashboard/favorites", icon: Heart },
  { name: "Message", href: "/sell/dashboard/messages", icon: MessageSquare, badge: "7" },
  { name: "Review", href: "/sell/dashboard/reviews", icon: Star },
  { name: "Profile", href: "/sell/dashboard/profile", icon: User },
  { name: "Membership", href: "/sell/dashboard/membership", icon: BadgeCheck },
  { name: "Account verification", href: "/sell/dashboard/verification", icon: ShieldCheck },
];

const accountNav = [
  { name: "Change password", href: "/sell/dashboard/change-password", icon: KeyRound },
  { name: "Logout", href: "/sell", icon: LogOut },
];

const listingRows = [
  {
    id: "1",
    title: "2022 Skoda Slavia 1.0 TSI Ambition BSVI",
    blurb: "1st owned, automatic transmission, Apple CarPlay ready.",
    price: 7300000,
    status: "Draft",
    tone: "blue" as const,
    date: "March 22, 2026",
  },
  {
    id: "2",
    title: "2017 BMW X1 xDrive 20d xLine",
    blurb: "Inspection complete, ready for final approval review.",
    price: 7300000,
    status: "Approved",
    tone: "green" as const,
    date: "March 21, 2026",
  },
  {
    id: "3",
    title: "2019 Toyota Fielder TX",
    blurb: "Live inventory with healthy buyer engagement this week.",
    price: 2500000,
    status: "Pending",
    tone: "amber" as const,
    date: "March 20, 2026",
  },
  {
    id: "4",
    title: "2021 Mazda CX-5 Touring",
    blurb: "Flagged for cover image update before re-publishing.",
    price: 3850000,
    status: "Flagged",
    tone: "red" as const,
    date: "March 18, 2026",
  },
  {
    id: "5",
    title: "2018 Subaru Forester XT",
    blurb: "Transaction completed and marked sold to buyer.",
    price: 3090000,
    status: "Sold",
    tone: "neutral" as const,
    date: "March 14, 2026",
  },
];

const offerRows: Record<
  string,
  Array<{
    id: string;
    buyer: string;
    dealer: string;
    offer: string;
    status: string;
    message: string;
    submittedAgo: string;
  }>
> = {
  "1": [
    {
      id: "offer-1",
      buyer: "John Smith",
      dealer: "Premium Luxury Car Group",
      offer: "KES 6,950,000",
      status: "Pending review",
      message: "Interested in this vehicle. Can inspect tomorrow if price is agreed.",
      submittedAgo: "2 hours ago",
    },
    {
      id: "offer-2",
      buyer: "Sarah Kariuki",
      dealer: "Elite Auto Traders",
      offer: "KES 6,880,000",
      status: "Pending review",
      message: "Ready to move quickly if service records are available.",
      submittedAgo: "5 hours ago",
    },
  ],
  "2": [
    {
      id: "offer-3",
      buyer: "Kelvin Ouma",
      dealer: "Cityline Prestige",
      offer: "KES 12,150,000",
      status: "Negotiating",
      message: "Buyer requested one more interior walkaround before confirming.",
      submittedAgo: "1 day ago",
    },
  ],
};

const verificationItems = [
  { label: "National ID / Passport", status: "Uploaded" },
  { label: "Business registration", status: "Pending review" },
  { label: "KRA PIN certificate", status: "Uploaded" },
  { label: "Bank or M-Pesa settlement details", status: "Required" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/sell/dashboard") return pathname === href;
  return pathname.startsWith(href);
}

export function SalesRepDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const displayName =
    (previewUser.user_metadata.full_name as string) ||
    previewUser.email.split("@")[0];

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-[#202224]">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-[#101828]/55 backdrop-blur-[2px] xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col overflow-hidden bg-[#24272c] transition-transform duration-300 xl:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 top-4 text-white/70 transition hover:text-white xl:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-7 pb-6 pt-7">
          <AutolistLogo
            className="h-9 w-auto [--brand-logo-accent:#FFFFFF] [--brand-logo-mark:#FFFFFF] [--brand-logo-text:#FFFFFF]"
          />
        </div>

        <div className="mx-5 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4">
          <Avatar
            alt={displayName}
            fallback={getInitials(displayName)}
            size="lg"
            className="bg-white/10 text-white"
          />
          <div className="mt-3 min-w-0">
            <p className="truncate text-[15px] font-semibold text-white">{displayName}</p>
            <p className="mt-1 truncate text-[12px] text-white/55">{previewUser.email}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-7">
          <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
            Sales Rep Menu
          </p>

          <div className="mt-4 space-y-1.5">
            {salesRepNav.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-[14px] px-4 py-3 text-[14px] font-medium transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-[0_10px_20px_rgb(var(--primary-rgb)/0.3)]"
                      : "text-white/65 hover:bg-white/6 hover:text-white"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge ? (
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          <p className="mt-8 px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
            Account
          </p>

          <div className="mt-4 space-y-1.5">
            {accountNav.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-[14px] px-4 py-3 text-[14px] font-medium transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-[0_10px_20px_rgb(var(--primary-rgb)/0.3)]"
                      : "text-white/65 hover:bg-white/6 hover:text-white"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 px-5 py-5">
          <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Current plan</p>
            <p className="mt-2 text-[16px] font-semibold text-white">Professional</p>
            <p className="mt-1 text-[12px] leading-5 text-white/55">
              32 of 50 listing credits remaining.
            </p>
          </div>
          <p className="mt-4 text-[12px] text-white/35">Copyright © 2026 Autolist</p>
        </div>
      </aside>

      <div className="xl:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-[#ebebeb] bg-[#f6f4ef]/85 backdrop-blur">
          <div className="flex h-[88px] items-center gap-4 px-4 md:px-6 lg:px-8 xl:px-10">
            <div className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#6f6f6f] transition hover:text-[#202224] xl:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <nav className="hidden items-center gap-7 lg:flex">
                {topNavLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-[14px] font-medium text-[#7d7d7d] transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#ededed] bg-white text-[#6c6c6c] transition hover:text-[#202224]">
                <Bell className="h-5 w-5" />
                <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#f04438]" />
              </button>

              <Link href="/sell/dashboard/add-listing">
                <button className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-semibold text-white transition hover:bg-brand-hover">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add listing</span>
                </button>
              </Link>

              <div className="hidden lg:flex">
                <SellerUserChip name={displayName} email={previewUser.email} />
              </div>

              <button className="hidden h-11 w-11 items-center justify-center rounded-full border border-[#ededed] bg-white text-[#818181] transition hover:text-[#202224] lg:flex">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-88px)] px-4 pb-8 pt-6 md:px-6 lg:px-8 lg:pt-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function SalesRepWarning() {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-[#ffd7c2] bg-[#fff4ec] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#ffe6d3] text-[#e67b1f]">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="max-w-4xl text-[14px] leading-6 text-[#9a5316]">
          Your listings may remain restricted until your account verification is complete.
          Submit your verification documents to unlock faster approvals and live inventory.
        </p>
      </div>
      <Link
        href="/sell/dashboard/verification"
        className="inline-flex h-11 shrink-0 items-center justify-center rounded-[14px] bg-[#202224] px-4 text-[14px] font-semibold text-white"
      >
        Verify account
      </Link>
    </div>
  );
}

export function SalesRepDashboardHome() {
  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Dashboard"
        description="Track listing credits, monitor sales activity, and manage buyer conversations from one place."
      />

      <SalesRepWarning />

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {sellerSummaryCards.map((item, index) => (
          <SellerStatCard
            key={item.label}
            {...item}
            value={index === 0 ? "32 / 50 remaining" : item.value}
          />
        ))}
      </div>

      <ListingsTable />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <PageInsightsChart />
        <RecentReviews />
      </div>
    </div>
  );
}

function ListingActionsMenu({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#e6e6e6] bg-white px-4 text-[13px] font-semibold text-[#202224]"
      >
        Actions
        <ChevronDown className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute right-0 top-[48px] z-20 w-[160px] overflow-hidden rounded-[18px] border border-[#e8e8e8] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
          {["Go Live", "View", "Edit", "Delete", "Duplicate"].map((item) => (
            <button
              key={item}
              className="flex w-full items-center justify-between border-b border-[#f1f1f1] px-4 py-3 text-left text-[13px] font-medium text-[#202224] last:border-b-0 hover:bg-[#fafafa]"
            >
              {item}
              <ArrowRight className="h-3.5 w-3.5 text-[#909090]" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function OfferModal({
  bidId,
  bidTitle,
  bidPrice,
  onClose,
}: {
  bidId: string;
  bidTitle: string;
  bidPrice: string;
  onClose: () => void;
}) {
  const offers = offerRows[bidId] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 px-4 py-10">
      <div className="max-h-[85vh] w-full max-w-[760px] overflow-y-auto rounded-[28px] border border-[#ededed] bg-white p-5 shadow-[0_30px_90px_rgba(15,23,42,0.28)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#ededed] pb-4">
          <div>
            <h3 className="font-heading text-[28px] font-semibold text-[#202224]">
              Offers for {bidTitle}
            </h3>
            <p className="mt-1 text-[14px] text-[#7b7b7b]">{offers.length} offers received</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] text-[#6b7280]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 pt-5">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="rounded-[22px] border border-[#ededed] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-[18px] font-semibold text-[#202224]">{offer.dealer}</h4>
                  <p className="mt-1 text-[13px] text-[#7b7b7b]">
                    Buyer: {offer.buyer} • {offer.submittedAgo}
                  </p>
                </div>
                <SellerStatusPill label={offer.status} tone="amber" />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-[16px] bg-[#f8fafc] px-4 py-3">
                  <p className="text-[11px] text-[#8a8a8a]">Your asking price</p>
                  <p className="mt-1 text-[18px] font-semibold text-[#202224]">{bidPrice}</p>
                </div>
                <div className="rounded-[16px] bg-[#eefaf1] px-4 py-3">
                  <p className="text-[11px] text-[#5b7e68]">Dealer&apos;s offer</p>
                  <p className="mt-1 text-[18px] font-semibold text-[#16a34a]">{offer.offer}</p>
                </div>
              </div>

              <div className="mt-4 rounded-[16px] bg-brand-soft-surface px-4 py-3">
                <p className="text-[12px] font-semibold text-[#4f6eb4]">Dealer note</p>
                <p className="mt-1 text-[13px] leading-6 text-[#5f6a7e]">{offer.message}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button className="inline-flex h-11 items-center justify-center rounded-[14px] bg-primary px-5 text-[13px] font-semibold text-white">
                  Accept offer
                </button>
                <button className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#d9d9d9] bg-white px-5 text-[13px] font-semibold text-[#202224]">
                  Counter offer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SalesRepListingsPage() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All status");
  const [tab, setTab] = React.useState("inventory");
  const [activeMenu, setActiveMenu] = React.useState<string | null>("1");
  const [offerBidId, setOfferBidId] = React.useState<string | null>(null);

  const filteredListings = listingRows.filter((listing) => {
    const matchesQuery =
      listing.title.toLowerCase().includes(query.toLowerCase()) ||
      listing.blurb.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All status" || listing.status === status;
    return matchesQuery && matchesStatus;
  });

  const offerBid = listingBidCards.find((item) => item.id === offerBidId) ?? null;

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="All listings"
        description="Manage draft and live inventory, review open bids, and follow up on incoming dealer offers."
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <SellerTabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "inventory", label: "Inventory" },
            { value: "available-bids", label: "Available bids" },
            { value: "your-bids", label: "Your bids" },
          ]}
        />

        <Link
          href="/sell/dashboard/add-listing"
          className="inline-flex h-12 items-center justify-center rounded-[14px] bg-primary px-5 text-[14px] font-semibold text-white"
        >
          Add listing
        </Link>
      </div>

      {tab === "inventory" ? (
        <SellerSurface className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-[#ededed] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-heading text-[24px] font-semibold text-[#202224]">Inventory</h2>
              <p className="mt-1 text-[13px] text-[#7a7a7a]">
                26 results found across draft, approved, pending and sold stock.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex h-12 min-w-[240px] items-center gap-3 rounded-[14px] border border-[#ededed] bg-white px-4">
                <Search className="h-4 w-4 text-[#939393]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search..."
                  className="h-full flex-1 border-0 bg-transparent text-[14px] outline-none placeholder:text-[#9a9a9a]"
                />
              </div>
              <button className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-[#ededed] bg-white px-4 text-[14px] text-[#6e6e6e]">
                <CalendarDays className="h-4 w-4" />
                From date
              </button>
              <button className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-[#ededed] bg-white px-4 text-[14px] text-[#6e6e6e]">
                <CalendarDays className="h-4 w-4" />
                To date
              </button>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-12 min-w-[154px] rounded-[14px] border border-[#ededed] bg-white px-4 text-[14px] text-[#202224] outline-none"
              >
                <option>All status</option>
                <option>Approved</option>
                <option>Pending</option>
                <option>Draft</option>
                <option>Flagged</option>
                <option>Sold</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto px-5 pb-5 pt-4">
            <table className="min-w-full border-separate border-spacing-y-4">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-[0.18em] text-[#8a8a8a]">
                  <th className="pb-2 pr-4">Listing</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Posting date</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="rounded-[22px] bg-white shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
                    <td className="rounded-l-[22px] border border-r-0 border-[#f0f0f0] px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-[95px] w-[168px] rounded-[18px] bg-[linear-gradient(135deg,#f0f4ff,#e7e1d8)]" />
                        <div className="max-w-[420px]">
                          <p className="text-[18px] font-semibold text-[#202224]">{listing.title}</p>
                          <p className="mt-2 text-[13px] text-[#757575]">{listing.blurb}</p>
                          <p className="mt-3 text-[15px] font-semibold text-primary">
                            {formatDashboardCurrency(listing.price)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="border border-x-0 border-[#f0f0f0] px-4 py-4">
                      <SellerStatusPill label={listing.status} tone={listing.tone} />
                    </td>
                    <td className="border border-x-0 border-[#f0f0f0] px-4 py-4 text-[14px] text-[#707070]">
                      {listing.date}
                    </td>
                    <td className="rounded-r-[22px] border border-l-0 border-[#f0f0f0] px-4 py-4">
                      <div className="flex justify-end">
                        <ListingActionsMenu
                          open={activeMenu === listing.id}
                          onToggle={() =>
                            setActiveMenu((current) => (current === listing.id ? null : listing.id))
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SellerPagination />
        </SellerSurface>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {listingBidCards.map((bid) => (
            <SellerSurface key={bid.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[18px] font-semibold text-[#202224]">{bid.title}</p>
                  <p className="mt-1 text-[13px] text-[#7b7b7b]">{bid.submittedBy}</p>
                </div>
                <SellerStatusPill label={bid.status} tone={bid.tone} />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {bid.meta.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-[#f4f6fb] px-3 py-2 text-[12px] font-medium text-[#67758f]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-5 rounded-[18px] bg-[#f8fafc] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#7c8aa5]">Listed price</p>
                <p className="mt-2 text-[24px] font-semibold text-[#202224]">{bid.price}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setOfferBidId(bid.id)}
                  className="inline-flex h-11 items-center justify-center rounded-[14px] bg-primary px-5 text-[13px] font-semibold text-white"
                >
                  View offers
                </button>
                <button className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#d9d9d9] bg-white px-5 text-[13px] font-semibold text-[#202224]">
                  {tab === "available-bids" ? "Make an offer" : "Already claimed"}
                </button>
              </div>
            </SellerSurface>
          ))}
        </div>
      )}

      {offerBid ? (
        <OfferModal
          bidId={offerBid.id}
          bidTitle={offerBid.title}
          bidPrice={offerBid.price}
          onClose={() => setOfferBidId(null)}
        />
      ) : null}
    </div>
  );
}

export function SalesRepAddListingPage() {
  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Choose listing package"
        description="Select the listing package that matches your sales volume before creating a new vehicle entry."
      />

      <div className="rounded-[20px] border border-[#ffd7c2] bg-[#fff4ec] px-5 py-4 text-[14px] leading-6 text-[#9a5316]">
        You do not have any active package. Choose a plan below before you continue to the add listing workflow.
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {membershipPlans.map((plan, index) => {
          const featured = index === 1;

          return (
            <SellerSurface
              key={plan.id}
              className={cn(
                "p-6",
                featured && "border-primary bg-brand-tint shadow-[0_18px_36px_rgb(var(--primary-rgb)/0.12)]"
              )}
            >
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
                {featured ? "Recommended" : "Package"}
              </p>
              <h2 className="mt-4 font-heading text-[28px] font-semibold text-[#202224]">{plan.name}</h2>
              <p className="mt-4 font-heading text-[34px] font-semibold text-[#202224]">
                {plan.price}
                <span className="ml-1 text-[15px] font-medium text-[#7d7d7d]">{plan.period}</span>
              </p>

              <ul className="mt-6 space-y-3 text-[14px] leading-6 text-[#666]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={cn(
                  "mt-8 inline-flex h-12 w-full items-center justify-center rounded-[14px] text-[14px] font-semibold transition",
                  featured
                    ? "bg-primary text-white hover:bg-brand-hover"
                    : "border border-[#d9d9d9] bg-white text-[#202224] hover:border-primary hover:text-primary"
                )}
              >
                Get started
              </button>
            </SellerSurface>
          );
        })}
      </div>
    </div>
  );
}

export function SalesRepVerificationPage() {
  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Account verification"
        description="Complete the required compliance documents so listings can move from pending to live without restriction."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <SellerSurface className="p-5 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
                Verification status
              </p>
              <h2 className="mt-2 font-heading text-[28px] font-semibold text-[#202224]">
                Documents under review
              </h2>
              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#737373]">
                Two documents are already uploaded. Add the remaining payout proof so the review
                team can approve your seller account and release all publishing restrictions.
              </p>
            </div>
            <SellerStatusPill label="Pending review" tone="amber" />
          </div>

          <div className="mt-6 space-y-4">
            {verificationItems.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-3 rounded-[20px] border border-[#ededed] bg-[#faf9f7] px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#202224]">{item.label}</p>
                    <p className="text-[12px] text-[#808080]">Required for trusted seller status</p>
                  </div>
                </div>
                <SellerStatusPill
                  label={item.status}
                  tone={
                    item.status === "Uploaded"
                      ? "green"
                      : item.status === "Pending review"
                        ? "amber"
                        : "red"
                  }
                />
              </div>
            ))}
          </div>
        </SellerSurface>

        <div className="space-y-6">
          <SellerSurface className="p-5">
            <h2 className="font-heading text-[22px] font-semibold text-[#202224]">Next steps</h2>
            <div className="mt-4 space-y-4">
              {[
                "Upload remaining settlement document",
                "Review team checks within 24 hours",
                "Publishing restrictions are lifted",
              ].map((step, index) => (
                <div key={step} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[13px] font-semibold text-primary">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-[14px] leading-6 text-[#6f6f6f]">{step}</p>
                </div>
              ))}
            </div>
          </SellerSurface>

          <SellerSurface className="p-5">
            <h2 className="font-heading text-[22px] font-semibold text-[#202224]">Need help?</h2>
            <p className="mt-3 text-[14px] leading-6 text-[#6f6f6f]">
              The verification team can clarify accepted documents, payout proof formats and
              review timelines.
            </p>
            <Link
              href="/sell/dashboard/messages"
              className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-primary"
            >
              Open support chat
              <ArrowRight className="h-4 w-4" />
            </Link>
          </SellerSurface>
        </div>
      </div>
    </div>
  );
}

export function SalesRepProfilePage() {
  return <ProfileForm user={previewUser} />;
}

export function SalesRepMembershipPage() {
  return <MembershipPage />;
}

export function SalesRepFavoritesPage() {
  return <FavoritesGrid />;
}

export function SalesRepMessagesPage() {
  return <ChatLayout initialData={null} />;
}

export function SalesRepReviewsPage() {
  return <ReviewList />;
}

export function SalesRepChangePasswordPage() {
  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Change password"
        description="Update your account credentials separately from the public sales rep profile details."
      />

      <SellerSurface className="max-w-3xl p-5 lg:p-6">
        <ChangePasswordForm />
      </SellerSurface>
    </div>
  );
}
