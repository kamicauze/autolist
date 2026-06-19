"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Clock3,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Rocket,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  deleteListing,
  duplicateOwnerListing,
  submitListingForReview,
  updateOwnerListingStatus,
} from "@/lib/actions/listings";
import type { Listing } from "@/lib/types/listing";
import { getImageUrl } from "@/lib/utils/listings";
import { getListingDisplayTitle } from "@/lib/utils/vehicle-display";
import {
  SellerStatusPill,
  SellerSurface,
  formatDashboardCurrency,
} from "./seller-dashboard-ui";

const tones = {
  active: "green" as const,
  pending: "amber" as const,
  draft: "blue" as const,
  reserved: "amber" as const,
  sold: "neutral" as const,
  expired: "neutral" as const,
  rejected: "neutral" as const,
};

export function ListingsTable({ listings: initialListings = [] }: { listings?: Listing[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("All status");
  const [listingItems, setListingItems] = React.useState(initialListings);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setListingItems(initialListings);
  }, [initialListings]);

  const runAction = async (
    listing: Listing,
    action: () => Promise<{ error?: string; success?: boolean }>
  ) => {
    setPendingId(listing.id);
    const result = await action();
    setPendingId(null);

    if (result.error) {
      window.alert(result.error);
      return;
    }

    router.refresh();
  };

  const handleDelete = (listing: Listing) => {
    const confirmed = window.confirm("Delete this listing?");
    if (!confirmed) return;

    void runAction(listing, async () => {
      const result = await deleteListing(listing.id);
      if (!result.error) {
        setListingItems((current) => current.filter((item) => item.id !== listing.id));
      }
      return result;
    });
  };

  const listings = listingItems.filter((listing) => {
    const title = getListingDisplayTitle(listing);
    const matchesQuery = title.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All status" || listing.status === status.toLowerCase();
    return matchesQuery && matchesStatus;
  });

  return (
    <SellerSurface className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-[#ededed] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-heading text-[24px] font-semibold text-[#202224]">Recent Listings</h2>
          <p className="mt-1 text-[13px] text-[#7a7a7a]">
            Review the latest live inventory pulled from your seller account.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex h-12 min-w-[240px] items-center gap-3 rounded-[14px] border border-[#ededed] bg-white px-4">
            <Search className="h-4 w-4 text-[#939393]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search here..."
              className="h-full flex-1 border-0 bg-transparent text-[14px] outline-none placeholder:text-[#9a9a9a]"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-12 min-w-[154px] rounded-[14px] border border-[#ededed] bg-white px-4 text-[14px] text-[#202224] outline-none"
          >
            <option>All status</option>
            <option>active</option>
            <option>pending</option>
            <option>draft</option>
            <option>sold</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[#ededed] text-left text-[12px] uppercase tracking-[0.18em] text-[#8a8a8a]">
              <th className="px-5 py-4 font-medium">Listing</th>
              <th className="px-5 py-4 font-medium">Date</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Price</th>
              <th className="px-5 py-4 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {listings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[14px] text-[#707070]">
                  No listings match the current filters.
                </td>
              </tr>
            ) : null}
            {listings.map((listing) => (
              <tr key={listing.id} className="border-b border-[#f1f1f1] last:border-b-0">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-[72px] overflow-hidden rounded-[16px] bg-[linear-gradient(135deg,#f0f4ff,#e7e1d8)]">
                      <Image
                        src={
                          listing.images?.[0]?.r2_key
                            ? getImageUrl(listing.images[0].r2_key, "thumb")
                            : "/placeholder-car.jpg"
                        }
                        alt={getListingDisplayTitle(listing)}
                        fill
                        className="object-cover"
                        sizes="72px"
                      />
                    </div>
                    <p className="text-[14px] font-semibold text-[#202224]">{getListingDisplayTitle(listing)}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-[14px] text-[#707070]">
                  {new Date(listing.created_at).toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-5 py-4">
                  <SellerStatusPill
                    label={listing.status[0].toUpperCase() + listing.status.slice(1)}
                    tone={tones[listing.status] ?? "neutral"}
                  />
                </td>
                <td className="px-5 py-4 text-[14px] font-semibold text-[#202224]">
                  {formatDashboardCurrency(listing.price)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          type="button"
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#ededed] text-[#727272] transition hover:border-primary hover:text-primary"
                          aria-label="Listing actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          align="end"
                          sideOffset={8}
                          collisionPadding={16}
                          className="z-[100] w-48 rounded-[8px] border border-[#ededed] bg-white p-1 text-left shadow-[0_18px_40px_rgba(15,23,42,0.14)]"
                        >
                        {["draft", "rejected", "expired"].includes(listing.status) ? (
                          <DropdownMenu.Item
                            disabled={pendingId === listing.id}
                            onSelect={() => void runAction(listing, () => submitListingForReview(listing.id))}
                            className="flex w-full cursor-pointer items-center gap-2 rounded-[6px] px-3 py-2 text-[13px] font-medium text-primary outline-none hover:bg-[#f4f7fb] focus:bg-[#f4f7fb] data-[disabled]:pointer-events-none data-[disabled]:opacity-60"
                          >
                            <Rocket className="h-4 w-4" />
                            Go Live
                          </DropdownMenu.Item>
                        ) : null}
                        <DropdownMenu.Item asChild>
                          <Link
                            href={`/vehicle/${listing.id}`}
                            className="flex cursor-pointer items-center gap-2 rounded-[6px] px-3 py-2 text-[13px] font-medium text-[#374151] outline-none hover:bg-[#f4f7fb] focus:bg-[#f4f7fb]"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item asChild>
                          <Link
                            href={`/dashboard/listings/${listing.id}/edit`}
                            className="flex cursor-pointer items-center gap-2 rounded-[6px] px-3 py-2 text-[13px] font-medium text-[#374151] outline-none hover:bg-[#f4f7fb] focus:bg-[#f4f7fb]"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          disabled={pendingId === listing.id}
                          onSelect={() =>
                            void runAction(listing, async () => {
                              const result = await duplicateOwnerListing(listing.id);
                              if (!("error" in result)) {
                                router.push(`/dashboard/listings/${result.id}/edit`);
                              }
                              return result;
                            })
                          }
                          className="flex w-full cursor-pointer items-center gap-2 rounded-[6px] px-3 py-2 text-[13px] font-medium text-[#374151] outline-none hover:bg-[#f4f7fb] focus:bg-[#f4f7fb] data-[disabled]:pointer-events-none data-[disabled]:opacity-60"
                        >
                          <Plus className="h-4 w-4" />
                          Duplicate
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          disabled={pendingId === listing.id}
                          onSelect={() =>
                            void runAction(listing, () =>
                              updateOwnerListingStatus(
                                listing.id,
                                listing.status === "reserved" ? "draft" : "reserved"
                              )
                            )
                          }
                          className="flex w-full cursor-pointer items-center gap-2 rounded-[6px] px-3 py-2 text-[13px] font-medium text-[#374151] outline-none hover:bg-[#f4f7fb] focus:bg-[#f4f7fb] data-[disabled]:pointer-events-none data-[disabled]:opacity-60"
                        >
                          <Clock3 className="h-4 w-4" />
                          {listing.status === "reserved" ? "Resume listing" : "Suspend/Hold"}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          disabled={pendingId === listing.id}
                          onSelect={() => handleDelete(listing)}
                          className="flex w-full cursor-pointer items-center gap-2 rounded-[6px] px-3 py-2 text-[13px] font-medium text-[#dc2626] outline-none hover:bg-[#fff1f1] focus:bg-[#fff1f1] data-[disabled]:pointer-events-none data-[disabled]:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SellerSurface>
  );
}
