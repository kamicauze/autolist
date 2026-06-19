"use client";

import * as React from "react";
import { ArrowRight, Bell, CalendarDays, Heart, MessageCircle, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export const sellerSurfaceClass =
  "rounded-[24px] border border-[#ededed] bg-white shadow-[0_14px_44px_rgba(15,23,42,0.05)]";

export const sellerMutedSurfaceClass =
  "rounded-[20px] border border-[#ededed] bg-[#f8f8f8]";

export const sellerInputClass =
  "h-12 w-full rounded-[14px] border border-[#e7e7e7] bg-white px-4 text-[14px] text-[#212121] placeholder:text-[#9a9a9a] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

export const sellerTextareaClass =
  "min-h-[132px] w-full rounded-[18px] border border-[#e7e7e7] bg-white px-4 py-3 text-[14px] text-[#212121] placeholder:text-[#9a9a9a] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

export const sellerSelectClass =
  "h-12 w-full appearance-none rounded-[14px] border border-[#e7e7e7] bg-white px-4 text-[14px] text-[#212121] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

export const sellerLabelClass =
  "mb-2 block text-[13px] font-medium text-[#24272c]";

export const sellerGhostButtonClass =
  "inline-flex items-center justify-center rounded-[14px] border border-[#d9d9d9] bg-white px-4 py-3 text-[14px] font-medium text-[#24272c] transition hover:border-primary hover:text-primary";

export const sellerPrimaryButtonClass =
  "inline-flex items-center justify-center rounded-[14px] bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50";

export const sellerSidebarLinkClass =
  "flex items-center gap-3 rounded-[14px] px-4 py-3 text-[14px] font-medium transition";

export function formatDashboardCurrency(value: number | string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "KES 0";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDashboardDate(value: string) {
  return new Date(value).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function SellerPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <h1 className="font-heading text-[34px] font-semibold leading-none text-[#202224]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-3xl text-[14px] leading-6 text-[#767676]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function SellerSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn(sellerSurfaceClass, className)}>{children}</section>;
}

export function SellerStatCard({
  icon,
  label,
  value,
  accentClass,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accentClass: string;
  note?: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#ededed] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-[13px] font-medium text-[#7b7b7b]">{label}</p>
          <p className="font-heading text-[28px] font-semibold leading-none text-[#202224]">
            {value}
          </p>
          {note ? <p className="text-[12px] text-[#8d8d8d]">{note}</p> : null}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/70 shadow-sm",
            accentClass
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function SellerTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-[#ebebeb] bg-white p-1">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "rounded-full px-4 py-2 text-[13px] font-medium transition",
              active ? "bg-brand-tint text-primary" : "text-[#747474] hover:text-primary"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function SellerStatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "blue" | "green" | "amber" | "red";
}) {
  const styles: Record<typeof tone, string> = {
    neutral: "bg-[#f4f4f4] text-[#6d6d6d]",
    blue: "bg-brand-tint text-primary",
    green: "bg-[#eaf7ef] text-[#2f9e63]",
    amber: "bg-[#fff4e8] text-[#e28a23]",
    red: "bg-[#ffeceb] text-[#f04438]",
  };

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-[12px] font-semibold", styles[tone])}>
      {label}
    </span>
  );
}

export function SellerSearchField({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-12 items-center gap-3 rounded-[14px] border border-[#ededed] bg-white px-4",
        className
      )}
    >
      <Search className="h-4 w-4 text-[#909090]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-full flex-1 border-0 bg-transparent text-[14px] text-[#212121] outline-none placeholder:text-[#9a9a9a]"
      />
    </div>
  );
}

export function SellerPagination() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ededed] px-5 py-4 text-[13px] text-[#777]">
      <p>Showing 1-5 from 100</p>
      <div className="flex items-center gap-2">
        {["01", "02", "03"].map((page, index) => (
          <button
            key={page}
            type="button"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border text-[13px] font-medium transition",
              index === 0
                ? "border-primary bg-primary text-white"
                : "border-[#e6e6e6] bg-white text-[#707070] hover:border-primary hover:text-primary"
            )}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}

export type SellerReview = {
  id: string;
  name: string;
  review: string;
  date: string;
  rating: number;
  listing?: string;
};

export const sellerReviews: SellerReview[] = [
  {
    id: "1",
    name: "Courtney Henry",
    rating: 5,
    date: "29 Jan, 2025",
    listing: "Mercedes Benz GLC 2021",
    review:
      "Professional seller. Car condition matched the pictures and the paperwork was ready before I arrived.",
  },
  {
    id: "2",
    name: "Darrell Steward",
    rating: 5,
    date: "17 Jan, 2025",
    listing: "Toyota Land Cruiser Prado TXL",
    review:
      "Fast response, transparent pricing and a very smooth handover. I would buy from this dashboard again.",
  },
  {
    id: "3",
    name: "Savannah Nguyen",
    rating: 4,
    date: "08 Jan, 2025",
    listing: "Mazda CX-5 Touring",
    review:
      "Good communication throughout the process. Delivery took a bit longer than expected but the vehicle was clean and exactly as described.",
  },
  {
    id: "4",
    name: "Marvin McKinney",
    rating: 5,
    date: "22 Dec, 2024",
    listing: "Subaru Forester XT",
    review:
      "Helpful guidance on financing and inspection. The seller shared extra photos and made the process easy to trust.",
  },
];

export function SellerReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "h-4 w-4",
            index < rating ? "fill-primary text-primary" : "fill-[#d6d6d6] text-[#d6d6d6]"
          )}
        />
      ))}
    </div>
  );
}

export type SellerFavorite = {
  id: string;
  title: string;
  location: string;
  transmission: string;
  fuel: string;
  mileage: string;
  price: number;
  seller: string;
};

export const sellerFavorites: SellerFavorite[] = [
  {
    id: "1",
    title: "Mercedes Benz E 300D",
    location: "Nairobi",
    transmission: "Automatic",
    fuel: "Diesel",
    mileage: "28,000 km",
    price: 8300000,
    seller: "Top Gear Motors",
  },
  {
    id: "2",
    title: "Audi Q8 S Line",
    location: "Nairobi",
    transmission: "Automatic",
    fuel: "Petrol",
    mileage: "11,500 km",
    price: 12800000,
    seller: "Capital Autohub",
  },
  {
    id: "3",
    title: "Toyota Land Cruiser ZX",
    location: "Mombasa",
    transmission: "Automatic",
    fuel: "Diesel",
    mileage: "41,000 km",
    price: 17600000,
    seller: "Coastline Prestige",
  },
  {
    id: "4",
    title: "BMW X5 xDrive40i",
    location: "Kisumu",
    transmission: "Automatic",
    fuel: "Petrol",
    mileage: "33,000 km",
    price: 10100000,
    seller: "Signature Cars",
  },
];

export type SellerConversation = {
  id: string;
  name: string;
  listing: string;
  preview: string;
  time: string;
  unread: number;
};

export const sellerConversations: SellerConversation[] = [
  {
    id: "1",
    name: "Albert Flores",
    listing: "Land Cruiser ZX",
    preview: "Can you share the service history and the exact mileage?",
    time: "10:32 AM",
    unread: 2,
  },
  {
    id: "2",
    name: "Jenny Wilson",
    listing: "Audi Q8",
    preview: "I’m available for a viewing on Friday afternoon.",
    time: "09:11 AM",
    unread: 0,
  },
  {
    id: "3",
    name: "Dianne Russell",
    listing: "Subaru Forester",
    preview: "Would you accept a trade-in plus cash?",
    time: "Yesterday",
    unread: 1,
  },
  {
    id: "4",
    name: "Jacob Jones",
    listing: "Mazda CX-5",
    preview: "Please confirm if the logbook is ready.",
    time: "Mon",
    unread: 0,
  },
];

export const sellerMessages: Record<
  string,
  Array<{ id: string; text: string; sender: "me" | "them"; time: string }>
> = {
  "1": [
    {
      id: "1",
      text: "Hi. I’m interested in the Land Cruiser. Can you share the service history and the exact mileage?",
      sender: "them",
      time: "10:31 AM",
    },
    {
      id: "2",
      text: "Sure. Full agency history is available and the current mileage is 41,238 km.",
      sender: "me",
      time: "10:34 AM",
    },
    {
      id: "3",
      text: "Perfect. Are you open to a viewing tomorrow morning?",
      sender: "them",
      time: "10:36 AM",
    },
    {
      id: "4",
      text: "Yes, tomorrow works. I can send the exact location after we confirm the time.",
      sender: "me",
      time: "10:38 AM",
    },
  ],
  "2": [
    {
      id: "1",
      text: "Hi, I’m available for a viewing on Friday afternoon. Is the Audi Q8 still available?",
      sender: "them",
      time: "09:04 AM",
    },
    {
      id: "2",
      text: "Yes, it is still available. Friday afternoon is possible. Would 3:30 PM work for you?",
      sender: "me",
      time: "09:08 AM",
    },
    {
      id: "3",
      text: "3:30 PM works. Please share whether the service records and spare key are available.",
      sender: "them",
      time: "09:11 AM",
    },
  ],
  "3": [
    {
      id: "1",
      text: "Would you accept a trade-in plus cash for the Subaru Forester?",
      sender: "them",
      time: "Yesterday",
    },
    {
      id: "2",
      text: "Possibly, depending on the vehicle and valuation. Send the details and photos first.",
      sender: "me",
      time: "Yesterday",
    },
    {
      id: "3",
      text: "It is a 2018 Mazda CX-5. I can send photos this evening if that helps.",
      sender: "them",
      time: "Yesterday",
    },
  ],
  "4": [
    {
      id: "1",
      text: "Please confirm if the logbook is ready for the Mazda CX-5.",
      sender: "them",
      time: "Mon",
    },
    {
      id: "2",
      text: "The logbook is available and I can share a copy before the viewing.",
      sender: "me",
      time: "Mon",
    },
  ],
};

export const membershipPlans = [
  {
    id: "basic",
    name: "Basic",
    accent: "border-primary",
    badgeTone: "blue" as const,
    price: "KES 15,000",
    period: "/month",
    features: ["3 active packages", "Priority listing review", "Dashboard analytics"],
  },
  {
    id: "professional",
    name: "Professional",
    accent: "border-[#2f9e63]",
    badgeTone: "green" as const,
    price: "KES 45,000",
    period: "/month",
    features: ["15 active packages", "Featured inventory", "Buyer lead insights"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    accent: "border-[#f79009]",
    badgeTone: "amber" as const,
    price: "KES 90,000",
    period: "/month",
    features: ["Unlimited packages", "Dedicated support", "Multi-user dealership tools"],
  },
];

export const listingBidCards = [
  {
    id: "1",
    title: "Toyota Land Cruiser Prado TXL",
    submittedBy: "Submitted by Albert Flores",
    price: "KES 6,800,000",
    status: "Open Bid",
    tone: "green" as const,
    meta: ["2021", "Automatic", "Diesel", "41,238 km"],
  },
  {
    id: "2",
    title: "Audi Q8 S Line",
    submittedBy: "Submitted by Jenny Wilson",
    price: "KES 12,400,000",
    status: "Negotiating",
    tone: "blue" as const,
    meta: ["2022", "Automatic", "Petrol", "11,500 km"],
  },
  {
    id: "3",
    title: "Mazda CX-5 Touring",
    submittedBy: "Submitted by Dianne Russell",
    price: "KES 3,250,000",
    status: "Expired",
    tone: "amber" as const,
    meta: ["2020", "Automatic", "Petrol", "68,100 km"],
  },
];

export function SellerMiniMeta({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-[12px] text-[#7d7d7d]">
      {icon}
      {label}
    </span>
  );
}

export function SellerUserChip({
  name,
  email,
  avatarUrl,
}: {
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-[#ededed] bg-white px-3 py-2">
      <Avatar
        src={avatarUrl || undefined}
        fallback={getInitials(name)}
        alt={name}
        size="sm"
        className="bg-[#f1f5ff]"
      />
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-[#202224]">{name}</p>
        {email ? <p className="truncate text-[11px] text-[#8a8a8a]">{email}</p> : null}
      </div>
    </div>
  );
}

export const sellerSummaryCards = [
  {
    label: "Total Listing",
    value: "124",
    icon: <CalendarDays className="h-5 w-5 text-[#f79009]" />,
    accentClass: "bg-[#fff3e4]",
  },
  {
    label: "Unread Message",
    value: "18",
    icon: <MessageCircle className="h-5 w-5 text-primary" />,
    accentClass: "bg-brand-tint",
  },
  {
    label: "Total Favorites",
    value: "67",
    icon: <Heart className="h-5 w-5 text-[#f04438]" />,
    accentClass: "bg-[#fff0ef]",
  },
  {
    label: "New Reviews",
    value: "32",
    icon: <Bell className="h-5 w-5 text-[#2f9e63]" />,
    accentClass: "bg-[#eaf7ef]",
  },
];

export function SellerReviewSnippet({ review }: { review: SellerReview }) {
  return (
    <div className="flex gap-4 rounded-[20px] border border-[#ededed] bg-white p-4">
      <Avatar
        alt={review.name}
        fallback={getInitials(review.name)}
        size="md"
        className="shrink-0 bg-[#f1f5ff]"
      />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[14px] font-semibold text-[#202224]">{review.name}</p>
            {review.listing ? (
              <p className="text-[12px] text-[#8a8a8a]">{review.listing}</p>
            ) : null}
          </div>
          <p className="text-[12px] text-[#8a8a8a]">{review.date}</p>
        </div>
        <SellerReviewStars rating={review.rating} />
        <p className="text-[13px] leading-6 text-[#686868]">{review.review}</p>
      </div>
    </div>
  );
}

export function SellerLinkArrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-primary">
      {children}
      <ArrowRight className="h-4 w-4" />
    </span>
  );
}
