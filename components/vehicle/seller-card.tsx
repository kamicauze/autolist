"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  Phone,
  MapPin,
  Star,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon3D } from "@/components/ui/icon-3d";
import { IconWhatsapp } from "@/components/ui/icons";
import { normalizeWhatsAppPhone } from "@/lib/utils/phone";
import type { ListingSalesRepContact, PublicSellerStats } from "@/lib/types/listing";
import { AppointmentRequestDialog } from "./appointment-request-dialog";
import { parseOpeningHours } from "@/lib/dealer-opening-hours";
import { OpeningHoursDisplay } from "@/components/dealers/opening-hours-display";

interface SellerCardProps {
  listingId: string;
  listingTitle: string;
  dealer?: {
    id: string;
    name: string;
    logo_url: string | null;
    city: string | null;
    mobile?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    about_text?: string;
    social_links?: Record<string, unknown> | null;
  };
  seller?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  salesRep?: ListingSalesRepContact | null;
  stats?: PublicSellerStats | null;
  listingLocation?: string;
  privateContact?: { phoneNumber: string | null; whatsappNumber: string | null };
}

type DealerHoursRow = {
  label: string;
  value: string;
};

const DEALER_HOURS_KEYS = [
  "opening_hours",
  "openingHours",
  "business_hours",
  "businessHours",
  "hours",
  "dealer_hours",
  "dealerHours",
] as const;

const HOURS_LABELS: Record<string, string> = {
  weekdays: "Mon - Fri",
  weekday: "Mon - Fri",
  weekdays_only: "Mon - Fri",
  weeknights: "Mon - Fri",
  weekends: "Sat - Sun",
  weekend: "Sat - Sun",
  saturday: "Saturday",
  sunday: "Sunday",
  holidays: "Public holidays",
  holiday: "Public holidays",
  public_holidays: "Public holidays",
  publicHolidays: "Public holidays",
  every_day: "Every day",
  everyday: "Every day",
  daily: "Every day",
};

function toHoursValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function toHoursRows(value: unknown): DealerHoursRow[] {
  if (typeof value === "string") {
    return [{ label: "Hours", value }];
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const record = entry as Record<string, unknown>;
        const label = toHoursValue(record.label ?? record.day ?? record.name);
        const hours = toHoursValue(record.value ?? record.hours ?? record.time);
        return label && hours ? { label, value: hours } : null;
      })
      .filter((entry): entry is DealerHoursRow => Boolean(entry));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;

  return Object.entries(record)
    .filter(([key]) => key !== "note" && key !== "timezone")
    .map(([key, hoursValue]) => {
      const hours = toHoursValue(hoursValue);
      if (!hours) return null;
      return {
        label: HOURS_LABELS[key] ?? key.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
        value: hours,
      };
    })
    .filter((entry): entry is DealerHoursRow => Boolean(entry));
}

export function getDealerHoursPresentation(
  socialLinks?: Record<string, unknown> | null,
) {
  const hoursSource = DEALER_HOURS_KEYS
    .map((key) => socialLinks?.[key])
    .find((value) => value != null);

  const rows = toHoursRows(hoursSource);

  if (typeof hoursSource === "string" && parseOpeningHours(hoursSource)) {
    return { rows: [], note: null, isFallback: false, structured: hoursSource };
  }

  if (rows.length > 0) {
    const note =
      hoursSource && typeof hoursSource === "object" && !Array.isArray(hoursSource)
        ? toHoursValue((hoursSource as Record<string, unknown>).note)
        : null;

    return {
      rows,
      note,
      isFallback: false,
      structured: null,
    };
  }

  return {
    rows: [{ label: "Hours", value: "Please confirm opening times with the dealer." }],
    note: "No verified schedule has been published on this listing.",
    isFallback: true,
    structured: null,
  };
}

export function SellerCard({
  listingId,
  listingTitle,
  dealer,
  seller,
  salesRep,
  stats,
  listingLocation,
  privateContact,
}: SellerCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const isDealer = !!dealer;
  const name = dealer?.name || seller?.full_name || "Private Seller";
  const avatarUrl = dealer?.logo_url || seller?.avatar_url;
  const dealerHours = getDealerHoursPresentation(dealer?.social_links);
  const rep = dealer ? salesRep ?? null : null;
  // The assigned sales rep is the primary contact; each channel falls back to
  // the dealership when the rep has hidden their number or disabled WhatsApp.
  const callNumber = isDealer ? rep?.phone || dealer?.mobile || null : privateContact?.phoneNumber || null;
  const whatsappNumber = normalizeWhatsAppPhone(
    isDealer ? rep?.whatsapp || dealer?.whatsapp || dealer?.mobile : privateContact?.whatsappNumber
  );
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in ${listingTitle} listed on Autolist.`)}`
    : null;
  const contactLabel = rep ? `Call ${rep.name.split(" ")[0]}` : "Call Seller";
  const hasReviews = Boolean(stats && stats.totalReviews > 0);
  const filledStars = hasReviews && stats ? Math.round(stats.averageRating) : 0;
  const memberSinceYear = stats?.memberSince ? new Date(stats.memberSince).getFullYear() : null;

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-500">
                {name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {dealer?.id ? (
                <Link href={`/dealers/${dealer.id}#about`} className="hover:text-primary">
                  {name}
                </Link>
              ) : (
                name
              )}
            </h3>
            <div className="mt-1 flex items-center gap-1">
              {hasReviews ? [1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  className={
                    value <= filledStars
                      ? "h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                      : "h-3.5 w-3.5 text-gray-200"
                  }
                />
              )) : null}
              <span className="text-xs text-gray-500">
                {hasReviews && stats
                  ? `${stats.averageRating.toFixed(1)} (${stats.totalReviews} ${
                      stats.totalReviews === 1 ? "review" : "reviews"
                    })`
                  : "No reviews yet"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {isDealer && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-primary">
              <Icon3D icon={BadgeCheck} size="xs" variant="glyph" />
              Verified dealer
            </span>
          )}
        </div>

        {rep ? (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-brand-muted-border bg-brand-soft-surface p-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white">
              {rep.avatar_url ? (
                <Image src={rep.avatar_url} alt={rep.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-primary">
                  <UserRound className="h-5 w-5" aria-hidden />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                Your sales contact
              </p>
              <p className="truncate text-sm font-semibold text-gray-900">{rep.name}</p>
              <p className="truncate text-xs text-gray-500">Sales rep at {dealer?.name}</p>
            </div>
          </div>
        ) : null}

        {stats ? (
          <div className="mt-4 space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs">
            {memberSinceYear ? (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Member since</span>
                <span className="font-semibold text-gray-900">{memberSinceYear}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Active listings</span>
              <span className="font-semibold text-gray-900">{stats.activeListings}</span>
            </div>
          </div>
        ) : null}

        {!isDealer && listingLocation ? (
          <p className="mt-4 flex items-start gap-2 text-xs text-gray-600">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            <span><span className="font-medium text-gray-900">Listing location:</span> {listingLocation}</span>
          </p>
        ) : null}

        {dealer ? (
          <Button asChild variant="outline" className="mt-4 w-full">
            <Link href={`/dealers/${dealer.id}`}>View Dealer&apos;s Profile</Link>
          </Button>
        ) : null}

        {isDealer ? (
          <div className="mt-4 rounded-lg border border-gray-100 bg-white p-3">
            <div className="flex items-center gap-2">
              <Icon3D icon={Clock3} tone="neutral" variant="glyph" />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                Opening hours
              </p>
            </div>
            {dealerHours.structured ? <div className="mt-3"><OpeningHoursDisplay value={dealerHours.structured} /></div> : <div className="mt-3 space-y-2 text-xs">
              {dealerHours.rows.map((row) => (
                <div key={`${row.label}-${row.value}`} className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">{row.label}</span>
                  <span
                    className={`text-right font-medium ${
                      dealerHours.isFallback ? "text-gray-600" : "text-gray-900"
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>}
            {dealerHours.note ? (
              <p className="mt-3 text-[11px] leading-relaxed text-gray-500">{dealerHours.note}</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">Seller preferred contact</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{contactLabel}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {callNumber ? (
              <Button asChild variant="default" size="sm" className="gap-2">
                <a href={`tel:${callNumber.replace(/\s+/g, "")}`}>
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              </Button>
            ) : (
              <Button variant="default" size="sm" className="gap-2" disabled>
                <Phone className="h-4 w-4" />
                Call
              </Button>
            )}
            {whatsappUrl ? (
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="gap-2 bg-[#25D366] text-white hover:bg-[#1FAF57]"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <IconWhatsapp className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 bg-[#25D366] text-white hover:bg-[#1FAF57]"
                disabled
              >
                <IconWhatsapp className="h-4 w-4" />
                WhatsApp
              </Button>
            )}
          </div>
          {isDealer ? (
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full gap-2"
              onClick={() => setDialogOpen(true)}
            >
              <CalendarDays className="h-4 w-4" />
              Book an appointment
            </Button>
          ) : null}
        </div>
      </div>

      {isDealer ? <AppointmentRequestDialog
        listingId={listingId}
        listingTitle={listingTitle}
        viewingLocation={dealer?.address || dealer?.city || listingLocation || "Confirm with the seller"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      /> : null}
    </>
  );
}
