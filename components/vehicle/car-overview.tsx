"use client";

import Image from "next/image";
import { Listing } from "@/lib/types/listing";
import { LISTING_OVERVIEW_ASSET_PATHS } from "@/lib/constants/listing-overview-assets";
import {
  buildListingOverviewItems,
  type ListingOverviewItem,
} from "@/lib/utils/listing-overview";

interface CarOverviewProps {
  listing: Listing;
  location?: string;
}

function OverviewItem({ item }: { item: ListingOverviewItem }) {
  return (
    <div className="group flex min-h-20 items-center gap-3 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-px hover:border-primary/30">
      <div className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14">
        <Image
          src={LISTING_OVERVIEW_ASSET_PATHS[item.key]}
          alt=""
          fill
          sizes="(max-width: 640px) 48px, 56px"
          className="object-contain transition-transform duration-200 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="min-w-0 flex-1 py-1">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-slate-500">
          {item.label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold leading-snug text-slate-900">
          {item.value}
        </p>
      </div>
    </div>
  );
}

export function CarOverview({ listing, location }: CarOverviewProps) {
  const items = buildListingOverviewItems(listing, location);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Overview</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
        {items.map((item) => (
          <OverviewItem key={item.key} item={item} />
        ))}
      </div>
    </div>
  );
}
