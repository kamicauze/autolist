"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

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
    "User";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-white px-4 md:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="shrink-0 text-gray-500 hover:text-gray-900 lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-6">
        {topNavLinks.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Search */}
        <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Add Listing */}
        <Link href="/dashboard/listings/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Listing</span>
          </Button>
        </Link>

        {/* User avatar */}
        <Link href="/dashboard/profile">
          <Avatar
            src={avatarUrl}
            alt={displayName}
            size="sm"
            fallback={displayName.slice(0, 2)}
            className="cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all"
          />
        </Link>
      </div>
    </header>
  );
}
