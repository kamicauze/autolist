"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SellerUserChip } from "./seller-dashboard-ui";
import { NotificationBell } from "@/components/notifications/notification-bell";

const topNavLinks = [
  { name: "Home", href: "/" },
  { name: "Buy Cars", href: "/search" },
  { name: "Blog", href: "/blog" },
  { name: "FAQ", href: "/faq" },
];

interface TopNavProps {
  user: { email?: string | null; user_metadata?: Record<string, unknown> };
  onMenuClick: () => void;
}

export function TopNav({ user, onMenuClick }: TopNavProps) {
  const pathname = usePathname();

  const displayName =
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "Seller";

  return (
    <header className="sticky top-0 z-30 border-b border-[#ebebeb] bg-[#f6f4ef]/85 backdrop-blur">
      <div className="flex h-[88px] items-center gap-4 px-4 md:px-6 lg:px-8 xl:px-10">
        <div className="flex min-w-0 items-center gap-4">
          <button
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#6f6f6f] transition hover:text-[#202224] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav className="hidden items-center gap-7 lg:flex">
            {topNavLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-[14px] font-medium transition-colors hover:text-[#2563eb]",
                  pathname === item.href ? "text-[#202224]" : "text-[#7d7d7d]"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ededed] bg-white text-[#6c6c6c] transition hover:text-[#202224]">
            <NotificationBell className="text-[#6c6c6c]" />
          </div>

          <Link href="/dashboard/listings/new">
            <Button
              size="sm"
              className="h-12 rounded-full bg-[#2563eb] px-4 text-[14px] font-semibold text-white hover:bg-[#1d4ed8]"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Listing</span>
            </Button>
          </Link>

          <div className="hidden lg:flex">
            <SellerUserChip name={displayName} email={user.email} />
          </div>
        </div>
      </div>
    </header>
  );
}
