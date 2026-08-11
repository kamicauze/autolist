"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AutolistLogo } from "@/components/brand/autolist-logo";
import {
  BadgeCheck,
  CalendarDays,
  Heart,
  KeyRound,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Star,
  User,
  UsersRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import type { DashboardAccountKind } from "@/lib/data/dashboard-account";
import type { SellerPackageAccessState } from "@/lib/types/membership";
import type { SalesAgentPermission } from "@/lib/constants/sales-agent-permissions";
import { getInitials, sellerSidebarLinkClass } from "./seller-dashboard-ui";

const sellerNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My listings", href: "/dashboard/listings", icon: ListOrdered },
  { name: "My favorite", href: "/dashboard/favorites", icon: Heart },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Customer Requests", href: "/dashboard/customer-requests", icon: CalendarDays },
  { name: "Reviews", href: "/dashboard/reviews", icon: Star },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Membership", href: "/dashboard/membership", icon: BadgeCheck },
  { name: "Account Verification", href: "/dashboard/verification", icon: ShieldCheck },
];

const salesAgentBaseNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

// Maps a granted permission to the dashboard section it unlocks for a rep.
const salesAgentPermissionNav: {
  permission: SalesAgentPermission;
  item: { name: string; href: string; icon: typeof LayoutDashboard };
}[] = [
  { permission: "listings.manage", item: { name: "Listings", href: "/dashboard/listings", icon: ListOrdered } },
  { permission: "enquiries.respond", item: { name: "Messages", href: "/dashboard/messages", icon: MessageSquare } },
  { permission: "enquiries.respond", item: { name: "Customer Requests", href: "/dashboard/customer-requests", icon: CalendarDays } },
  { permission: "reviews.manage", item: { name: "Reviews", href: "/dashboard/reviews", icon: Star } },
  { permission: "billing.view", item: { name: "Membership", href: "/dashboard/membership", icon: BadgeCheck } },
];

function buildSalesAgentNav(permissions: SalesAgentPermission[]) {
  const permitted = salesAgentPermissionNav
    .filter(({ permission }) => permissions.includes(permission))
    .map(({ item }) => item);
  // Keep Dashboard first, then permitted sections, then Profile.
  return [salesAgentBaseNav[0], ...permitted, salesAgentBaseNav[1]];
}

const dealerOnlyNav = [
  { name: "Sales Agents", href: "/dashboard/sales-agents", icon: UsersRound },
];

const accountNav = [
  { name: "Change password", href: "/dashboard/change-password", icon: KeyRound },
];

interface SidebarProps {
  user: { email?: string | null; user_metadata?: Record<string, unknown> };
  accountKind: DashboardAccountKind;
  packageAccess: SellerPackageAccessState;
  salesAgentPermissions?: SalesAgentPermission[] | null;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({
  user,
  accountKind,
  packageAccess,
  salesAgentPermissions,
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isSalesAgent = Boolean(salesAgentPermissions);
  const displayName =
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "Seller";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const navItems = isSalesAgent
    ? buildSalesAgentNav(salesAgentPermissions ?? [])
    : accountKind === "dealer"
      ? [...sellerNav, ...dealerOnlyNav]
      : sellerNav;
  const menuLabel = isSalesAgent
    ? "Sales Rep Menu"
    : accountKind === "dealer"
      ? "Dealer Menu"
      : "Seller Menu";
  void packageAccess;

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
          "fixed left-0 top-0 z-50 flex h-screen w-[var(--sidebar-width)] flex-col overflow-hidden bg-sidebar-bg transition-transform duration-300 lg:translate-x-0",
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
          <AutolistLogo
            className="h-9 w-auto [--brand-logo-accent:#FFFFFF] [--brand-logo-mark:#FFFFFF] [--brand-logo-text:#FFFFFF]"
          />
        </div>

        <div className="mx-5 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-2 flex flex-row items-center gap-4">
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
            {menuLabel}
          </p>
          <div className="mt-4 space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    sellerSidebarLinkClass,
                    active
                      ? "bg-primary text-primary-foreground shadow-[0_10px_20px_rgb(var(--primary-rgb)/0.3)]"
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
                      ? "bg-primary text-primary-foreground shadow-[0_10px_20px_rgb(var(--primary-rgb)/0.3)]"
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
