"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ListOrdered,
  Heart,
  MessageSquare,
  Star,
  User,
  KeyRound,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

const sidebarNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "All listings", href: "/dashboard/listings", icon: ListOrdered },
  { name: "My favorite", href: "/dashboard/favorites", icon: Heart },
  { name: "Message", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Review", href: "/dashboard/reviews", icon: Star },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Change passwords", href: "/dashboard/change-password", icon: KeyRound },
];

interface SidebarProps {
  user: { email?: string | null; user_metadata?: Record<string, unknown> };
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ user, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const displayName =
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "User";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen w-[var(--sidebar-width)] flex-col bg-[var(--sidebar-bg)] transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 px-6 pt-6 pb-4">
          <Image
            src="/autolist-logo.svg"
            alt="Autolist"
            width={154}
            height={44}
            priority
            className="h-8 w-auto brightness-0 invert"
          />
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
          <Avatar
            src={avatarUrl}
            alt={displayName}
            size="lg"
            fallback={displayName.slice(0, 2)}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {sidebarNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
