"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Clock3,
  Loader2,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconWhatsapp } from "@/components/ui/icons";
import { useListingEnquiry } from "@/lib/hooks/use-listing-enquiry";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SellerCardProps {
  listingId: string;
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

function getDealerHoursPresentation(socialLinks?: Record<string, unknown> | null) {
  const hoursSource = DEALER_HOURS_KEYS
    .map((key) => socialLinks?.[key])
    .find((value) => value != null);

  const rows = toHoursRows(hoursSource);

  if (rows.length > 0) {
    const note =
      hoursSource && typeof hoursSource === "object" && !Array.isArray(hoursSource)
        ? toHoursValue((hoursSource as Record<string, unknown>).note)
        : null;

    return {
      rows,
      note,
      isFallback: false,
    };
  }

  return {
    rows: [{ label: "Hours", value: "Please confirm opening times with the dealer." }],
    note: "No verified schedule has been published on this listing.",
    isFallback: true,
  };
}

export function SellerCard({ listingId, dealer, seller }: SellerCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    feedback,
    isSubmitting,
    message,
    contactName,
    contactEmail,
    contactPhone,
    setMessage,
    setContactName,
    setContactEmail,
    setContactPhone,
    submitEnquiry,
  } = useListingEnquiry({
    listingId,
  });
  const isDealer = !!dealer;
  const name = dealer?.name || seller?.full_name || "Private Seller";
  const avatarUrl = dealer?.logo_url || seller?.avatar_url;
  const dealerHours = getDealerHoursPresentation(dealer?.social_links);

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
                <Link href={`/dealers/${dealer.id}`} className="hover:text-primary">
                  {name}
                </Link>
              ) : (
                name
              )}
            </h3>
            <div className="mt-1 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star key={value} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1 text-xs text-gray-500">5.0</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {isDealer && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified dealer
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Car transaction handled by Autolist
          </span>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-gray-600">
          {dealer?.about_text ||
            "Trusted local dealer with verified listings and transparent pricing. Contact us for full inspection and purchase support."}
        </p>

        <div className="mt-4 space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Member since</span>
            <span className="font-semibold text-gray-900">2018</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Active listings</span>
            <span className="font-semibold text-gray-900">48</span>
          </div>
        </div>

        {isDealer ? (
          <div className="mt-4 rounded-lg border border-gray-100 bg-white p-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-gray-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                Opening hours
              </p>
            </div>
            <div className="mt-3 space-y-2 text-xs">
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
            </div>
            {dealerHours.note ? (
              <p className="mt-3 text-[11px] leading-relaxed text-gray-500">{dealerHours.note}</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">Seller preferred contact</p>
          <p className="mt-1 text-lg font-bold text-gray-900">Call Seller</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="default" size="sm" className="gap-2">
              <Phone className="h-4 w-4" />
              Call
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 bg-[#25D366] text-white hover:bg-[#1FAF57]"
            >
              <IconWhatsapp className="h-4 w-4" />
              WhatsApp
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full gap-2"
            onClick={() => setDialogOpen(true)}
          >
            <MessageSquareText className="h-4 w-4" />
            Send enquiry
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Send an enquiry</DialogTitle>
            <DialogDescription>
              This message is saved to Messages, logged in Admin &gt; Car Inquiries, and sent to the seller.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              placeholder="Your name"
              className="h-11 rounded-[12px] border border-[#d7dce5] bg-white px-3 text-[14px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <input
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
              placeholder="Phone number"
              className="h-11 rounded-[12px] border border-[#d7dce5] bg-white px-3 text-[14px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <input
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              placeholder="Email address"
              className="h-11 rounded-[12px] border border-[#d7dce5] bg-white px-3 text-[14px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 sm:col-span-2"
            />
          </div>

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Hi, I’m interested in this vehicle. Is it still available? Can you share the service history and best viewing time?"
            className="min-h-[140px] w-full rounded-[14px] border border-[#d7dce5] bg-white px-4 py-3 text-[14px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />

          {feedback ? (
            <div className="rounded-[12px] border border-[#d0d5dd] bg-[#f8fafc] px-4 py-3 text-[13px] text-[#475467]">
              {feedback}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void submitEnquiry()} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending
                </>
              ) : (
                "Send enquiry"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
