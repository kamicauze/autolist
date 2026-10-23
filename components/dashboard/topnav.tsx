"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SellerUserChip } from "./seller-dashboard-ui";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface TopNavProps {
  user: { email?: string | null; user_metadata?: Record<string, unknown> };
  onMenuClick: () => void;
  isPrivateSeller?: boolean;
}

export function TopNav({ user, onMenuClick, isPrivateSeller = false }: TopNavProps) {
  const displayName =
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "Seller";
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null;

  return (
    <header className="sticky top-0 z-30 border-b border-[#ebebeb] bg-[#f6f4ef]/85 backdrop-blur">
      <div className="flex h-[88px] items-center gap-4 px-4 md:px-6 lg:px-8 xl:px-10">
        <div className="flex min-w-0 items-center gap-4">
          <button
            aria-label="Open dashboard menu"
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#6f6f6f] transition hover:text-[#202224] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ededed] bg-white text-[#6c6c6c] transition hover:text-[#202224]">
            <NotificationBell className="text-[#6c6c6c]" />
          </div>

          {isPrivateSeller ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button size="sm" aria-label="Add listing" className="h-12 rounded-full px-4 text-[14px] font-semibold">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Listing</span>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={8} className="z-50 w-64 rounded-[14px] border border-[#e2e5e9] bg-white p-2 shadow-lg">
                  <DropdownMenu.Item asChild>
                    <Link href="/dashboard/listings/new" className="block rounded-lg px-3 py-3 text-sm outline-none hover:bg-brand-tint focus:bg-brand-tint">
                      <span className="block font-semibold">Public listing</span>
                      <span className="mt-1 block text-xs text-[#68717d]">Publish after moderation.</span>
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link href="/sell/dealer" className="block rounded-lg px-3 py-3 text-sm outline-none hover:bg-brand-tint focus:bg-brand-tint">
                      <span className="block font-semibold">Request dealer offers</span>
                      <span className="mt-1 block text-xs text-[#68717d]">Choose dealer-only or public selling.</span>
                    </Link>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <Link href="/dashboard/listings/new" aria-label="Add listing">
              <Button size="sm" className="h-12 rounded-full bg-primary px-4 text-[14px] font-semibold text-white hover:bg-brand-hover">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Listing</span>
              </Button>
            </Link>
          )}

          <div className="hidden lg:flex">
            <SellerUserChip name={displayName} email={user.email} avatarUrl={avatarUrl} />
          </div>
        </div>
      </div>
    </header>
  );
}
