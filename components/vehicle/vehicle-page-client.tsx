"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  Flag,
  GitCompare,
  Heart,
  Loader2,
  MapPin,
  ShieldCheck,
  Share2,
} from "lucide-react";
import { setListingWishlistState } from "@/lib/actions/favorites";
import { Listing } from "@/lib/types/listing";
import type { PricePositioningResult } from "@/lib/types/market-insights";
import type { VehicleListingReviewsData } from "@/lib/types/listing-review";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ImageGallery } from "./image-gallery";
import { SellerCard } from "./seller-card";
import { CarOverview } from "./car-overview";
import { FeaturesList } from "./features-list";
import { RecommendedCars } from "./recommended-cars";
import { VehicleLoanCalculator } from "./vehicle-loan-calculator";
import { ReviewsSection } from "./reviews-section";
import { ReplyForm } from "./reply-form";
import { getImageUrl } from "@/lib/utils/listings";
import { useCompare } from "@/lib/hooks/use-compare";
import {
  PriceAdviserPanel,
  PriceAdviserSummary,
} from "./price-adviser-panel";
import { FinancingRequestDialog } from "./financing-request-dialog";
import { getListingTrim, getListingVariant } from "@/lib/utils/vehicle-display";
import { GoogleMapEmbed } from "@/components/maps/google-map-embed";
import { buildGoogleMapsQuery, getGoogleMapsDirectionsUrl } from "@/lib/google-maps";
import { useListingEnquiry } from "@/lib/hooks/use-listing-enquiry";

interface VehiclePageClientProps {
  listing: Listing;
  similarListings: Listing[];
  pricePositioning: PricePositioningResult;
  listingReviewsData: VehicleListingReviewsData;
  viewer: {
    id: string | null;
    email: string | null;
    fullName: string | null;
  } | null;
  initialIsFavorited: boolean;
  favoriteListingIds: string[];
  title: string;
  location: string;
  googleMapsApiKey: string;
}

type SectionKey =
  | "description"
  | "about"
  | "features"
  | "location"
  | "buySafely"
  | "loan"
  | "insurance"
  | "reviews";

type PageStatePreset =
  | "base"
  | "about-open"
  | "expanded"
  | "most-open"
  | "price-adviser";

const PRESET_STATES: Record<PageStatePreset, Record<SectionKey, boolean>> = {
  base: {
    description: true,
    about: false,
    features: false,
    location: false,
    buySafely: false,
    loan: false,
    insurance: false,
    reviews: false,
  },
  "about-open": {
    description: false,
    about: true,
    features: false,
    location: false,
    buySafely: false,
    loan: false,
    insurance: false,
    reviews: false,
  },
  expanded: {
    description: false,
    about: false,
    features: true,
    location: true,
    buySafely: true,
    loan: true,
    insurance: true,
    reviews: true,
  },
  "most-open": {
    description: false,
    about: true,
    features: true,
    location: true,
    buySafely: true,
    loan: true,
    insurance: true,
    reviews: true,
  },
  "price-adviser": {
    description: false,
    about: true,
    features: true,
    location: true,
    buySafely: true,
    loan: true,
    insurance: true,
    reviews: true,
  },
};

function getPresetFromQuery(value: string | null): PageStatePreset {
  if (value === "about-open") return "about-open";
  if (value === "expanded") return "expanded";
  if (value === "most-open") return "most-open";
  if (value === "price-adviser") return "price-adviser";
  return "base";
}

function AccordionSection({
  title,
  children,
  open,
  onOpenChange,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="flex w-full items-center justify-between border-b border-gray-200 py-4 text-left group">
        <h3 className="text-sm font-semibold text-gray-900 sm:text-base">{title}</h3>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="py-5">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function MapBlock({
  googleMapsApiKey,
  locationLabel,
  mapQuery,
}: {
  googleMapsApiKey: string;
  locationLabel: string;
  mapQuery: string | null;
}) {
  const directionsUrl = getGoogleMapsDirectionsUrl(mapQuery);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="h-4 w-4 text-gray-400" />
        <span>{locationLabel}</span>
      </div>
      <div className="relative h-[260px] overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-sky-100 to-gray-100">
        <GoogleMapEmbed
          apiKey={googleMapsApiKey}
          query={mapQuery}
          title={`Map for ${locationLabel}`}
          fallback={
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.2),transparent_35%),radial-gradient(circle_at_70%_70%,rgba(34,197,94,0.18),transparent_35%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  {locationLabel}
                </div>
              </div>
            </>
          }
        />
      </div>
      <Button asChild className="w-full bg-primary text-white hover:bg-primary/90">
        <a href={directionsUrl} target="_blank" rel="noreferrer">
          Get Direction
        </a>
      </Button>
    </div>
  );
}

function metadataValue(metadata: Listing["metadata"], key: string) {
  const value = metadata && key in metadata ? metadata[key] : null;
  return value == null ? "N/A" : String(value);
}

export function VehiclePageClient({
  listing,
  similarListings,
  pricePositioning,
  listingReviewsData,
  viewer,
  initialIsFavorited,
  favoriteListingIds,
  title,
  location,
  googleMapsApiKey,
}: VehiclePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preset = useMemo(
    () => getPresetFromQuery(searchParams.get("state")),
    [searchParams]
  );

  const {
    ids,
    isLoaded,
    isInCompare,
    toggleCompare,
    maxItems,
  } = useCompare();

  const [isPriceAdviserOpen, setIsPriceAdviserOpen] = useState(
    preset === "price-adviser"
  );
  const [isFinancingDialogOpen, setIsFinancingDialogOpen] = useState(
    preset === "most-open"
  );
  const [accordionState, setAccordionState] = useState<Record<SectionKey, boolean>>(
    PRESET_STATES[preset]
  );
  const [isLiked, setIsLiked] = useState(initialIsFavorited);
  const [isWishlistPending, setIsWishlistPending] = useState(false);
  const {
    feedback: enquiryFeedback,
    isSubmitting: isEnquirySubmitting,
    message: enquiryMessage,
    setMessage: setEnquiryMessage,
    submitEnquiry,
  } = useListingEnquiry({
    listingId: listing.id,
    initialMessage: "Hi, I'm interested in this vehicle. Please contact me with more details.",
  });

  useEffect(() => {
    setAccordionState(PRESET_STATES[preset]);
    setIsPriceAdviserOpen(preset === "price-adviser");
    setIsFinancingDialogOpen(preset === "most-open");
  }, [preset]);

  useEffect(() => {
    setIsLiked(initialIsFavorited);
  }, [initialIsFavorited]);

  const formattedPrice = new Intl.NumberFormat("en-KE").format(listing.price);
  const inCompare = isInCompare(listing.id);
  const compareLimitReached = !inCompare && ids.length >= maxItems;
  const locationLabel = buildGoogleMapsQuery([location, "Kenya"]) || "Kenya";
  const mapQuery = buildGoogleMapsQuery([
    listing.dealer?.address,
    location,
    "Kenya",
  ]);

  const sortedImages = (listing.images || [])
    .sort((a, b) => a.image_order - b.image_order)
    .map((img) => getImageUrl(img.r2_key, "hero"));

  const setSectionOpen = (key: SectionKey, open: boolean) => {
    setAccordionState((prev) => ({ ...prev, [key]: open }));
  };

  const handleWishlistToggle = async () => {
    const nextValue = !isLiked;
    setIsLiked(nextValue);
    setIsWishlistPending(true);

    const result = await setListingWishlistState(listing.id, nextValue);

    if (result.error) {
      setIsLiked(!nextValue);
      setIsWishlistPending(false);

      if (result.error === "AUTH_REQUIRED") {
        router.push(`/login?next=${encodeURIComponent(`/vehicle/${listing.id}`)}`);
        return;
      }

      console.error("Unable to update favorites:", result.error);
      return;
    }

    setIsWishlistPending(false);
  };

  return (
    <>
      <div className="animate-in fade-in duration-500">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
                <div className="mt-1 flex items-center gap-3">
                  <p className="text-xl font-bold text-primary">
                    {listing.currency}
                    {formattedPrice}
                  </p>
                  {listing.status === "reserved" && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Reserved
                    </span>
                  )}
                </div>
                {getListingTrim(listing) || getListingVariant(listing) ? (
                  <p className="mt-2 text-sm font-medium text-gray-600">
                    {[getListingTrim(listing), getListingVariant(listing)]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={inCompare ? "default" : "outline"}
                  size="icon"
                  onClick={() => toggleCompare(listing.id)}
                  disabled={!isLoaded || compareLimitReached}
                  title={
                    compareLimitReached
                      ? `You can compare up to ${maxItems} vehicles`
                      : undefined
                  }
                  className="h-9 w-9 rounded-full"
                >
                  {inCompare ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-gray-300">
                  <Share2 className="h-4 w-4 text-gray-600" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border-gray-300"
                  onClick={() => void handleWishlistToggle()}
                  disabled={isWishlistPending}
                >
                  <Heart
                    className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                  />
                </Button>
              </div>
            </div>

            {ids.length > 1 && (
              <div className="mt-2">
                <Link href="/compare" className="text-sm font-medium text-primary hover:underline">
                  Go to compare ({ids.length})
                </Link>
              </div>
            )}

            <div className="mt-5">
              <PriceAdviserPanel
        open={isPriceAdviserOpen}
        onOpenChange={setIsPriceAdviserOpen}
        title={title}
        price={Number(listing.price)}
        currency={listing.currency}
        pricePositioning={pricePositioning}
      />
              <ImageGallery images={sortedImages} title={title} />
            </div>

            <Tabs defaultValue="overview" className="mt-6 w-full">
              <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-gray-100 p-1 sm:grid-cols-4">
                <TabsTrigger
                  value="overview"
                  className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="features"
                  className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Features
                </TabsTrigger>
                <TabsTrigger
                  value="location"
                  className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Location
                </TabsTrigger>
                <TabsTrigger
                  value="loan"
                  className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Loan calculator
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-5">
                <CarOverview listing={listing} location={location} />
              </TabsContent>
              <TabsContent value="features" className="mt-5 rounded-xl border border-gray-200 bg-white p-5">
                <FeaturesList features={listing.features} />
              </TabsContent>
              <TabsContent value="location" className="mt-5 rounded-xl border border-gray-200 bg-white p-5">
                <MapBlock
                  googleMapsApiKey={googleMapsApiKey}
                  locationLabel={locationLabel}
                  mapQuery={mapQuery}
                />
              </TabsContent>
              <TabsContent value="loan" className="mt-5">
                <VehicleLoanCalculator
                  price={Number(listing.price)}
                  currency={listing.currency}
                  onApplyForFinancing={() => setIsFinancingDialogOpen(true)}
                />
              </TabsContent>
            </Tabs>

            <PriceAdviserSummary
              price={Number(listing.price)}
              currency={listing.currency}
              pricePositioning={pricePositioning}
              onOpenDetails={() => setIsPriceAdviserOpen(true)}
            />

            <div className="mt-5">
              <AccordionSection
                title="Description"
                open={accordionState.description}
                onOpenChange={(open) => setSectionOpen("description", open)}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                  {listing.description ||
                    `This ${listing.year} ${listing.make} ${listing.model} is available for purchase. Contact the seller for more details.`}
                </p>
                {listing.mileage && (
                  <p className="mt-3 text-sm font-medium text-primary">
                    Mileage/Odometer: {listing.mileage.toLocaleString()} kms
                  </p>
                )}
              </AccordionSection>

              <AccordionSection
                title={`About ${listing.make}`}
                open={accordionState.about}
                onOpenChange={(open) => setSectionOpen("about", open)}
              >
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-lg border border-gray-100 p-3">
                    <p className="text-xs text-gray-500">Condition</p>
                    <p className="font-semibold text-gray-900">
                      {listing.condition ? listing.condition.replaceAll("_", " ") : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-100 p-3">
                    <p className="text-xs text-gray-500">Trim</p>
                    <p className="font-semibold text-gray-900">
                      {getListingTrim(listing) || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-100 p-3">
                    <p className="text-xs text-gray-500">Variant / Engine</p>
                    <p className="font-semibold text-gray-900">
                      {getListingVariant(listing) || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-100 p-3">
                    <p className="text-xs text-gray-500">Stock number</p>
                    <p className="font-semibold text-gray-900">
                      {metadataValue(listing.metadata, "stock_number")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-100 p-3">
                    <p className="text-xs text-gray-500">VIN number</p>
                    <p className="font-semibold text-gray-900">
                      {metadataValue(listing.metadata, "vin")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-100 p-3">
                    <p className="text-xs text-gray-500">Drive type</p>
                    <p className="font-semibold text-gray-900">
                      {metadataValue(listing.metadata, "drive_type")}
                    </p>
                  </div>
                </div>
              </AccordionSection>

              <AccordionSection
                title="Features"
                open={accordionState.features}
                onOpenChange={(open) => setSectionOpen("features", open)}
              >
                <FeaturesList features={listing.features} />
              </AccordionSection>

              <AccordionSection
                title="Location"
                open={accordionState.location}
                onOpenChange={(open) => setSectionOpen("location", open)}
              >
                <MapBlock
                  googleMapsApiKey={googleMapsApiKey}
                  locationLabel={locationLabel}
                  mapQuery={mapQuery}
                />
              </AccordionSection>

              <AccordionSection
                title="Buy Safely"
                open={accordionState.buySafely}
                onOpenChange={(open) => setSectionOpen("buySafely", open)}
              >
                <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    Tips for a secure purchase: verify the vehicle documents, inspect the car in
                    daylight, and use traceable payment channels.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      Meet the seller in a public place
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      Confirm ownership and service history
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      Arrange an independent inspection
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      Avoid cash-only settlement
                    </li>
                  </ul>
                </div>
              </AccordionSection>

              <AccordionSection
                title="Insurance"
                open={accordionState.insurance}
                onOpenChange={(open) => setSectionOpen("insurance", open)}
              >
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    Protect your vehicle with comprehensive insurance coverage.
                    Compare quotes from leading insurers and find the best deal.
                  </p>
                  <Link href="/insurance">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                      Get Insurance Quote
                    </Button>
                  </Link>
                </div>
              </AccordionSection>

              <AccordionSection
                title="Auto Loan Calculator"
                open={accordionState.loan}
                onOpenChange={(open) => setSectionOpen("loan", open)}
              >
                <VehicleLoanCalculator
                  price={Number(listing.price)}
                  currency={listing.currency}
                  onApplyForFinancing={() => setIsFinancingDialogOpen(true)}
                />
              </AccordionSection>

              <AccordionSection
                title="Car Reviews & Rating"
                open={accordionState.reviews}
                onOpenChange={(open) => setSectionOpen("reviews", open)}
              >
                <div className="space-y-7">
                  <ReviewsSection
                    summary={listingReviewsData.summary}
                    reviews={listingReviewsData.reviews}
                  />
                  <ReplyForm
                    listingId={listing.id}
                    sellerId={listing.seller_id}
                    viewer={viewer}
                    existingReview={listingReviewsData.viewerReview}
                  />
                </div>
              </AccordionSection>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              <SellerCard listingId={listing.id} dealer={listing.dealer} seller={listing.seller} />

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-semibold text-gray-900">Message the Seller</h3>
                <textarea
                  value={enquiryMessage}
                  onChange={(event) => setEnquiryMessage(event.target.value)}
                  className="mt-3 min-h-[96px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none"
                  placeholder="Hi, I'm interested in this vehicle. Please contact me with more details."
                />
                {enquiryFeedback ? (
                  <div className="mt-3 rounded-[12px] border border-[#d0d5dd] bg-[#f8fafc] px-4 py-3 text-[13px] text-[#475467]">
                    {enquiryFeedback}
                  </div>
                ) : null}
                <Button
                  type="button"
                  className="mt-3 w-full bg-primary text-white hover:bg-primary/90"
                  onClick={() => void submitEnquiry()}
                  disabled={isEnquirySubmitting}
                >
                  {isEnquirySubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Flag className="h-4 w-4" />
                Report Listing/Dealer
              </Button>

              <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
                <div className="mb-3 text-left">
                  <h3 className="text-base font-semibold text-gray-900">Quick Contact</h3>
                </div>
                <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-lg bg-gray-100">
                  <div className="grid h-40 w-40 grid-cols-7 gap-1 rounded bg-white p-3 shadow-sm">
                    {Array.from({ length: 49 }).map((_, index) => (
                      <div
                        key={index}
                        className={`rounded-[2px] ${
                          [0, 1, 2, 7, 14, 16, 28, 35, 42, 43, 44, 48, 40, 30, 18, 24, 32]
                            .includes(index)
                            ? "bg-gray-900"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Scan this QR code with your phone to contact Autolist seller directly.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-1 text-base font-semibold text-gray-900">Recommended Used Cars</h3>
                <p className="mb-3 text-xs text-gray-500">
                  Showing more cars you might like
                </p>
                <RecommendedCars
                  listings={similarListings}
                  sidebarMode
                  favoriteListingIds={favoriteListingIds}
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      <FinancingRequestDialog
        open={isFinancingDialogOpen}
        onOpenChange={setIsFinancingDialogOpen}
        title={title}
      />
    </>
  );
}
