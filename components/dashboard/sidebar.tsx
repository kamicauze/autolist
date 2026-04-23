"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  KeyRound,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  MessageSquare,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { getInitials, sellerSidebarLinkClass } from "./seller-dashboard-ui";

const sellerNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Listings", href: "/dashboard/listings", icon: ListOrdered },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Verification", href: "/dashboard/verification", icon: ShieldCheck },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

const accountNav = [
  { name: "Change password", href: "/dashboard/change-password", icon: KeyRound },
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
    "Seller";
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
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-[#101828]/55 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-[var(--sidebar-width)] flex-col overflow-hidden bg-[#24272c] transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/70 transition hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 px-7 pb-6 pt-7">
          <Image
            src="/autolist-logo.svg"
            alt="Autolist"
            width={154}
            height={44}
            priority
            className="h-9 w-auto brightness-0 invert"
          />
        </div>

        <div className="mx-5 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4">
          <Avatar
            src={avatarUrl}
            alt={displayName}
            size="lg"
            fallback={getInitials(displayName)}
            className="bg-white/10 text-white"
          />
          <div className="mt-3 min-w-0">
            <p className="truncate text-[15px] font-semibold text-white">{displayName}</p>
            <p className="mt-1 truncate text-[12px] text-white/55">{user.email}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-7">
          <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
            Seller Menu
          </p>
          <div className="mt-4 space-y-1.5">
            {sellerNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    sellerSidebarLinkClass,
                    active
                      ? "bg-[#2563eb] text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]"
                      : "text-white/65 hover:bg-white/6 hover:text-white"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <p className="mt-8 px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
            Account
          </p>
          <div className="mt-4 space-y-1.5">
            {accountNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    sellerSidebarLinkClass,
                    active
                      ? "bg-[#2563eb] text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]"
                      : "text-white/65 hover:bg-white/6 hover:text-white"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 px-5 py-5">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-[14px] font-medium text-white/65 transition hover:bg-white/6 hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
