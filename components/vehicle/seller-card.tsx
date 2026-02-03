"use client";

import Image from "next/image";
import { Phone, MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconWhatsapp } from "@/components/ui/icons";

interface SellerCardProps {
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
  };
  seller?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function SellerCard({ dealer, seller }: SellerCardProps) {
  const isDealer = !!dealer;
  const name = dealer?.name || seller?.full_name || "Private Seller";
  const avatarUrl = dealer?.logo_url || seller?.avatar_url;
  const location = dealer?.city || "Kenya";

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Dealer Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-lg font-semibold text-gray-500">
                {name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{name}</h3>
              {isDealer && (
                <Badge variant="primary" size="sm">
                  Verified dealer
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{location}</p>
          </div>
        </div>
      </div>

      {/* Mini Map Placeholder */}
      <div className="h-32 bg-gray-100 relative">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <span className="text-sm">Map: {location}</span>
        </div>
      </div>

      {/* Contact Buttons */}
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Contact dealer</p>
        <div className="flex gap-2">
          <Button variant="default" size="sm" className="flex-1 gap-2">
            <Phone className="h-4 w-4" />
            Call to seller
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat
          </Button>
        </div>
        <Button
          variant="secondary"
          className="w-full gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white"
        >
          <IconWhatsapp className="h-5 w-5" />
          WhatsApp
        </Button>
      </div>

      {/* Dealer Stats (if dealer) */}
      {isDealer && (
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <button className="text-gray-400 hover:text-gray-600">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Member since</span>
              <span className="font-medium">2018</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Active listings</span>
              <span className="font-medium">46</span>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4">
            View details
          </Button>

          {/* Visit info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="text-primary">Visit this vehicle</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Contact the seller to arrange a viewing at their location.
              We recommend viewing the vehicle in person before making a purchase.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
