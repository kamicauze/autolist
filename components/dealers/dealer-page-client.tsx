"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Flag,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import type { Listing } from "@/lib/types/listing";
import type { DealerProfile } from "@/lib/types/dealer";
import { Button } from "@/components/ui/button";
import { RecommendedCars } from "@/components/vehicle/recommended-cars";
import { ReviewsSection } from "@/components/vehicle/reviews-section";
import { ReplyForm } from "@/components/vehicle/reply-form";
import { getImageUrl } from "@/lib/utils/listings";
import { IconWhatsapp } from "@/components/ui/icons";
import { getListingDisplayLocation } from "@/lib/utils/vehicle-display";
import { GoogleMapEmbed } from "@/components/maps/google-map-embed";
import { buildGoogleMapsQuery, getGoogleMapsSearchUrl } from "@/lib/google-maps";
import { ReportAdDialog } from "@/components/vehicle/report-ad-dialog";

interface DealerPageClientProps {
  dealer: DealerProfile;
  inventory: Listing[];
  recommendedListings: Listing[];
  googleMapsApiKey: string;
}

function getListingImage(listing: Listing): string {
  const sortedImages = (listing.images || [])
    .sort((a, b) => a.image_order - b.image_order)
    .map((img) => getImageUrl(img.r2_key, "card"));
  return sortedImages[0] || "/placeholder-car.jpg";
}

function DealerInventory({ inventory }: { inventory: Listing[] }) {
  if (inventory.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
        No active inventory listed for this dealer yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inventory.map((listing) => {
        const image = getListingImage(listing);
        const title = `${listing.year} ${listing.make} ${listing.model}`;
        const price = new Intl.NumberFormat("en-KE").format(listing.price);

        return (
          <article
            key={listing.id}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href={`/vehicle/${listing.id}`}
                className="relative h-40 w-full overflow-hidden rounded-lg bg-gray-100 sm:h-28 sm:w-44"
              >
                <Image src={image} alt={title} fill className="object-cover" />
                {listing.is_featured && (
                  <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Featured
                  </span>
                )}
              </Link>

              <div className="flex flex-1 flex-col justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-primary">
                    {listing.currency}
                    {price}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {listing.dealer?.name || "Dealer"} • {getListingDisplayLocation(listing)}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/vehicle/${listing.id}`}>View car</Link>
                  </Button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function DealerSidebar({
  dealer,
  recommendedListings,
  googleMapsApiKey,
  onReportDealer,
}: {
  dealer: DealerProfile;
  recommendedListings: Listing[];
  googleMapsApiKey: string;
  onReportDealer: () => void;
}) {
  const locationLabel =
    buildGoogleMapsQuery([dealer.address, dealer.location, dealer.city, "Kenya"]) ||
    "Nairobi, Kenya";
  const mapUrl = getGoogleMapsSearchUrl(locationLabel);

  return (
    <aside className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100">
            {dealer.logo_url ? (
              <Image src={dealer.logo_url} alt={dealer.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-gray-500">
                {dealer.name.charAt(0)}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900">{dealer.name}</h3>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified dealer
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm">
          <h4 className="font-semibold text-gray-900">Business hours</h4>
          <div className="flex items-center justify-between text-gray-600">
            <span>Mon - Fri:</span>
            <span>06:00 AM - 09:00 PM</span>
          </div>
          <div className="flex items-center justify-between text-gray-600">
            <span>Sat - Sun:</span>
            <span>07:00 AM - 07:00 PM</span>
          </div>
          <div className="flex items-center justify-between text-gray-600">
            <span>Holiday:</span>
            <span>Closed</span>
          </div>
        </div>

        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-600">2,975 Reviews</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">5/5</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button size="sm" className="gap-2">
            <Phone className="h-4 w-4" />
            Call
          </Button>
          <Button size="sm" variant="outline" className="gap-2 border-gray-300">
            <MessageCircle className="h-4 w-4" />
            Chat
          </Button>
        </div>
        <Button
          size="sm"
          className="mt-2 w-full gap-2 bg-[#25D366] text-white hover:bg-[#1fa857]"
        >
          <IconWhatsapp className="h-4 w-4" />
          WhatsApp
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2 w-full gap-2 border-gray-300"
          onClick={onReportDealer}
        >
          <Flag className="h-4 w-4" />
          Report dealer
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-base font-semibold text-gray-900">Map to {dealer.name}</h3>
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{locationLabel}</span>
        </div>
        <div className="mt-3 h-80 overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-green-100 via-brand-tint to-gray-100">
          <GoogleMapEmbed
            apiKey={googleMapsApiKey}
            query={locationLabel}
            title={`Map to ${dealer.name}`}
            fallback={
              <div className="flex h-full items-center justify-center">
                <div className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                  {dealer.city || "Dealer location"}
                </div>
              </div>
            }
          />
        </div>
        <Button asChild className="mt-3 w-full">
          <a href={mapUrl} target="_blank" rel="noreferrer">
            View map
          </a>
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-base font-semibold text-gray-900">Recommended Used Cars</h3>
        <p className="mt-1 text-xs text-gray-500">
          Showing cars you might also like
        </p>
        <div className="mt-3">
          <RecommendedCars listings={recommendedListings} sidebarMode />
        </div>
      </div>
    </aside>
  );
}

export function DealerPageClient({
  dealer,
  inventory,
  recommendedListings,
  googleMapsApiKey,
}: DealerPageClientProps) {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,830px)_minmax(0,410px)]">
        <main className="space-y-8">
          <section className="relative h-72 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-rose-100 via-rose-50 to-orange-50 sm:h-80">
            <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full bg-rose-200/60" />
            <div className="absolute bottom-0 left-8 right-8 top-0 flex items-center">
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Authorized Dealer Profile</p>
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{dealer.name}</h1>
                <p className="max-w-xl text-sm text-gray-600">
                  Explore the latest inventory, reviews, and contact options for {dealer.name}.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">About {dealer.name}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
              {dealer.about_text ||
                `${dealer.name} is a verified Autolist dealer offering quality inspected vehicles and trusted support through the buying process.`}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              Dealership inventory ({inventory.length})
            </h2>
            <div className="mt-4">
              <DealerInventory inventory={inventory} />
            </div>
          </section>

          <section className="space-y-8">
            <ReviewsSection />
            <ReplyForm />
          </section>
        </main>

        <DealerSidebar
          dealer={dealer}
          recommendedListings={recommendedListings}
          googleMapsApiKey={googleMapsApiKey}
          onReportDealer={() => setIsReportDialogOpen(true)}
        />
      </div>
      <ReportAdDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        targetType="dealer"
        dealerId={dealer.id}
        targetLabel={dealer.name}
      />
    </>
  );
}
