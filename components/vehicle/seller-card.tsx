"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Phone, ShieldCheck, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
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
      </div>
    </div>
  );
}
