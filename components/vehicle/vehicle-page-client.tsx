"use client";

import { useState } from "react";
import { Share2, Heart, Flag, ChevronDown, ChevronUp } from "lucide-react";
import { Listing } from "@/lib/types/listing";
import { Badge } from "@/components/ui/badge";
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
import { IconSpeedometer, IconFuel, IconGear } from "@/components/ui/icons";

interface VehiclePageClientProps {
  listing: Listing;
  similarListings: Listing[];
  title: string;
  location: string;
}

export function VehiclePageClient({
  listing,
  similarListings,
  title,
  location,
}: VehiclePageClientProps) {
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  
  const formattedPrice = new Intl.NumberFormat("en-KE").format(listing.price);

  const sortedImages = (listing.images || [])
    .sort((a, b) => a.image_order - b.image_order)
    .map((img) => getImageUrl(img.r2_key));

  const formatCondition = (condition: string | null) => {
    if (!condition) return null;
    return condition.charAt(0).toUpperCase() + condition.slice(1).replace(/_/g, " ");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Title Section */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {title} in {location}
            </h1>

            {/* Quick specs */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              {listing.mileage && (
                <span className="flex items-center gap-1">
                  <IconSpeedometer className="h-4 w-4" />
                  {listing.mileage.toLocaleString()} kms
                </span>
              )}
              {listing.fuel_type && (
                <span className="flex items-center gap-1">
                  <IconFuel className="h-4 w-4" />
                  {listing.fuel_type}
                </span>
              )}
              {listing.transmission && (
                <span className="flex items-center gap-1">
                  <IconGear className="h-4 w-4" />
                  {listing.transmission}
                </span>
              )}
              {formatCondition(listing.condition) && (
                <Badge variant="secondary" size="sm">
                  {formatCondition(listing.condition)}
                </Badge>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-500">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Flag className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Price */}
        <p className="mt-3 text-2xl font-bold text-primary">
          {listing.currency}
          {formattedPrice}
        </p>
        <p className="text-sm text-gray-500">
          1.0 5+1 Single Col / AMV
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Gallery & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <ImageGallery images={sortedImages} title={title} />

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
              >
                Features
              </TabsTrigger>
              <TabsTrigger
                value="location"
                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
              >
                Location
              </TabsTrigger>
              <TabsTrigger
                value="loan"
                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
              >
                Loan calculator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-8">
              <CarOverview listing={listing} />

              {listing.description && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Description
                  </h2>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {listing.description}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <FeaturesList features={listing.features} />
            </TabsContent>

            <TabsContent value="location" className="mt-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Location</h2>
                <p className="text-gray-600">
                  {listing.dealer?.address || `${location}, Kenya`}
                </p>
                <div className="h-64 h-[400px] w-full bg-gray-100 rounded-xl overflow-hidden relative">
                   <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-gray-400 font-medium">Map View</p>
                            <p className="text-sm text-gray-400">{location}</p>
                        </div>
                   </div>
                   <div 
                     className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center"
                   />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="loan" className="mt-6">
              <VehicleLoanCalculator price={Number(listing.price)} currency={listing.currency} />
            </TabsContent>
          </Tabs>

          {/* Collapsible Reviews Section */}
          <div className="pt-8 border-t border-gray-200">
             <Collapsible open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
                <div className="flex items-center justify-between mb-4">
                     <h2 className="text-xl font-semibold text-gray-900">Car User Reviews & Rating</h2>
                     <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2">
                             {isReviewsOpen ? "Hide Reviews" : "Show Reviews"}
                             {isReviewsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                     </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent>
                    <div className="space-y-8">
                         <ReviewsSection />
                         <ReplyForm />
                    </div>
                </CollapsibleContent>
             </Collapsible>
          </div>
        </div>

        {/* Right Column - Seller Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <SellerCard dealer={listing.dealer} seller={listing.seller} />

            <div className="flex justify-center">
                <button className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
                    <Flag className="h-4 w-4" />
                    Report this listing
                </button>
            </div>
          </div>
        </div>
      </div>

       {/* Recommended Cars - Full Width Bottom */}
      <div className="pt-8 border-t border-gray-200">
         <RecommendedCars listings={similarListings} />
      </div>
    </div>
  );
}
