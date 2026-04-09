"use client";

import { Heart, MessageSquare } from "lucide-react";
import {
  SellerPageHeader,
  SellerPagination,
  SellerSurface,
  formatDashboardCurrency,
  sellerFavorites,
} from "../seller-dashboard-ui";

export function FavoritesGrid() {
  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="My Favorite"
        description="Saved vehicles from around the marketplace that you want to revisit, compare, or message about later."
      />

      <SellerSurface className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#ededed] px-5 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-[14px] text-[#7a7a7a]">{sellerFavorites.length} cars in wishlist</p>
          <select className="h-12 rounded-[14px] border border-[#ededed] bg-white px-4 text-[14px] text-[#202224] outline-none">
            <option>Newest first</option>
            <option>Price low to high</option>
            <option>Price high to low</option>
          </select>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2 2xl:grid-cols-4">
          {sellerFavorites.map((vehicle) => (
            <article
              key={vehicle.id}
              className="overflow-hidden rounded-[24px] border border-[#ededed] bg-white"
            >
              <div className="relative aspect-[1.2/1] bg-[linear-gradient(135deg,#f0f4ff,#efe7dd)]">
                <button className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#f04438] shadow-sm">
                  <Heart className="h-5 w-5 fill-current" />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <h2 className="font-heading text-[22px] font-semibold text-[#202224]">
                    {vehicle.title}
                  </h2>
                  <p className="mt-2 text-[14px] font-semibold text-[#2563eb]">
                    {formatDashboardCurrency(vehicle.price)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-3 text-[13px] text-[#6f6f6f]">
                    {vehicle.location}
                  </div>
                  <div className="rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-3 text-[13px] text-[#6f6f6f]">
                    {vehicle.transmission}
                  </div>
                  <div className="rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-3 text-[13px] text-[#6f6f6f]">
                    {vehicle.fuel}
                  </div>
                  <div className="rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-3 text-[13px] text-[#6f6f6f]">
                    {vehicle.mileage}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-[#efefef] pt-4">
                  <div>
                    <p className="text-[12px] text-[#9a9a9a]">Seller</p>
                    <p className="text-[13px] font-semibold text-[#202224]">{vehicle.seller}</p>
                  </div>
                  <button className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[#2563eb] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1d4ed8]">
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <SellerPagination />
      </SellerSurface>
    </div>
  );
}
