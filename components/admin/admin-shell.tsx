"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Menu,
  X,
  Plus,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/notifications/notification-bell";
import {
  ADMIN_NAV_SECTIONS,
  AdminNavLink,
  AdminSidebarSectionTitle,
  AdminTopNavigation,
  adminPrimaryButtonClass,
} from "./admin-ui";
import { AdminTourHelpButton, AdminTourProvider } from "./tour/admin-tour";

interface AdminShellProps {
  user: { email?: string | null; user_metadata?: Record<string, unknown> };
  badgeCounts?: Partial<Record<string, number>>;
  dataAccessNotice?: string | null;
  children: React.ReactNode;
}

export function AdminShell({ user, badgeCounts, dataAccessNotice, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  const displayName =
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "Admin";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  const primaryAction =
    pathname.startsWith("/admin/review")
      ? { href: "/admin/dashboard", label: "View dashboard" }
      : pathname.startsWith("/admin/verification")
        ? { href: "/admin/review", label: "Open review queue" }
        : { href: "/admin/review", label: "Open review queue" };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <AdminTourProvider>
    <div className="min-h-screen bg-white">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close admin navigation"
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        data-tour="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/5 bg-[#24272c] text-white transition-transform duration-300 lg:translate-x-0",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full pointer-events-none lg:pointer-events-auto"
        )}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-[18px] py-6">
          <Link href="/admin/dashboard" className="font-heading text-[28px] font-semibold text-white">
            Auto<span className="text-[#ef4444]">list</span>
          </Link>
          <button
            type="button"
            aria-label="Close admin navigation"
            className="rounded-md p-2 text-white/60 hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-white/5 px-[18px] py-6">
          <p className="mb-3 text-[12px] font-medium text-white/35">Profile</p>
          <div className="flex items-center gap-3">
            <Avatar
              src={avatarUrl}
              alt={displayName}
              fallback={displayName.slice(0, 2)}
              size="md"
              className="bg-white/10"
            />
            <div className="min-w-0">
              <p className="truncate text-[12px] text-white/45">Account</p>
              <p className="truncate text-[14px] text-white">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {ADMIN_NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-2">
              <AdminSidebarSectionTitle>{section.title}</AdminSidebarSectionTitle>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <AdminNavLink
                    key={item.href}
                    href={item.href}
                    label={item.name}
                    icon={item.icon}
                    badge={badgeCounts?.[item.href] ?? item.badge}
                    active={isActive(item.href)}
                    onClick={() => setSidebarOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-2 border-t border-white/5 px-4 py-4">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex w-full items-center justify-center rounded-[10px] bg-white px-4 py-3 text-[14px] font-semibold text-[#24272c] transition hover:bg-white/90 active:scale-[0.98]"
          >
            View website
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-[10px] px-4 py-3 text-left text-[14px] font-medium text-white/90 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-[#f1f5f9] bg-white/95 backdrop-blur">
          <div className="flex min-h-[78px] items-center gap-4 px-6">
            <button
              type="button"
              aria-label="Open admin navigation"
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <AdminTopNavigation />
            <div className="ml-auto flex items-center gap-4">
              <AdminTourHelpButton />
              <div
                data-tour="admin-notifications"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#374151]"
              >
                <NotificationBell className="text-[#374151]" />
              </div>
              <div className="hidden items-center gap-3 lg:flex">
                <div className="h-9 w-9 rounded-full bg-[#e5e7eb]" />
                <div className="flex items-center gap-1 text-[13px] font-medium text-[#374151]">
                  <span>{displayName}</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
              <Link
                data-tour="admin-primary-action"
                href={primaryAction.href}
                className={cn(adminPrimaryButtonClass, "h-10 gap-2 px-4")}
              >
                <Plus className="h-4 w-4" />
                {primaryAction.label}
              </Link>
            </div>
          </div>
        </header>

        <main className="px-[30px] py-10">
          {dataAccessNotice ? (
            <div className="mb-6 rounded-[14px] border border-amber-200 bg-amber-50 px-5 py-4 text-[13px] leading-6 text-amber-900">
              {dataAccessNotice}
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
    </AdminTourProvider>
  );
}
