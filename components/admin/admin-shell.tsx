"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
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
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    try {
      setSidebarCollapsed(window.localStorage.getItem("admin-sidebar-collapsed") === "true");
    } catch {
      setSidebarCollapsed(false);
    }
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem("admin-sidebar-collapsed", String(sidebarCollapsed));
    } catch {
      // Ignore storage failures; the toggle still works for the current session.
    }
  }, [sidebarCollapsed]);

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
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/5 bg-[#24272c] text-white transition-[width,transform] duration-300 lg:translate-x-0",
          sidebarCollapsed ? "lg:w-[84px]" : "lg:w-[280px]",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full pointer-events-none lg:pointer-events-auto"
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-white/5 px-[18px] py-6",
            sidebarCollapsed ? "justify-between lg:flex-col lg:justify-center lg:gap-3 lg:px-3" : "justify-between"
          )}
        >
          <Link
            href="/admin/dashboard"
            title={sidebarCollapsed ? "Autolist admin dashboard" : undefined}
            className={cn(
              "font-heading font-semibold text-white transition-[font-size]",
              sidebarCollapsed ? "lg:text-[20px]" : "text-[28px]"
            )}
          >
            <span className={cn(sidebarCollapsed ? "lg:sr-only" : null)}>
              Auto<span className="text-[#ef4444]">list</span>
            </span>
            <span aria-hidden className={cn("hidden", sidebarCollapsed ? "lg:inline" : null)}>
              A<span className="text-[#ef4444]">l</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label={sidebarCollapsed ? "Expand admin sidebar" : "Collapse admin sidebar"}
            aria-expanded={!sidebarCollapsed}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "hidden rounded-[10px] border border-white/10 p-2 text-white/70 transition hover:bg-white/6 hover:text-white active:translate-y-[1px] lg:inline-flex",
              sidebarCollapsed ? "mt-1" : null
            )}
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            aria-label="Close admin navigation"
            className="rounded-md p-2 text-white/60 hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className={cn(
            "border-b border-white/5 px-[18px] py-6",
            sidebarCollapsed ? "lg:px-3" : null
          )}
        >
          <p className={cn("mb-3 text-[12px] font-medium text-white/35", sidebarCollapsed ? "lg:sr-only" : null)}>
            Profile
          </p>
          <div className={cn("flex items-center gap-3", sidebarCollapsed ? "lg:justify-center" : null)}>
            <Avatar
              src={avatarUrl}
              alt={displayName}
              fallback={displayName.slice(0, 2)}
              size="md"
              className="bg-white/10"
            />
            <div className={cn("min-w-0", sidebarCollapsed ? "lg:sr-only" : null)}>
              <p className="truncate text-[12px] text-white/45">Account</p>
              <p className="truncate text-[14px] text-white">{user.email}</p>
            </div>
          </div>
        </div>

        <nav
          className={cn(
            "flex-1 space-y-6 overflow-y-auto py-6",
            sidebarCollapsed ? "px-4 lg:px-3" : "px-4"
          )}
        >
          {ADMIN_NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-2">
              <div className={cn(sidebarCollapsed ? "lg:sr-only" : null)}>
                <AdminSidebarSectionTitle>{section.title}</AdminSidebarSectionTitle>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <AdminNavLink
                    key={item.href}
                    href={item.href}
                    label={item.name}
                    icon={item.icon}
                    badge={badgeCounts?.[item.href] ?? item.badge}
                    active={isActive(item.href)}
                    collapsed={sidebarCollapsed}
                    onClick={() => setSidebarOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className={cn("space-y-2 border-t border-white/5 py-4", sidebarCollapsed ? "px-4 lg:px-3" : "px-4")}>
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            title={sidebarCollapsed ? "View website" : undefined}
            aria-label={sidebarCollapsed ? "View website" : undefined}
            className={cn(
              "flex w-full items-center justify-center rounded-[10px] bg-white text-[14px] font-semibold text-[#24272c] transition hover:bg-white/90 active:scale-[0.98]",
              sidebarCollapsed ? "px-4 py-3 lg:h-11 lg:px-0 lg:py-0" : "px-4 py-3"
            )}
          >
            <ExternalLink
              className={cn("h-4 w-4", sidebarCollapsed ? "hidden lg:block" : "hidden")}
            />
            <span className={cn(sidebarCollapsed ? "lg:sr-only" : null)}>View website</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            title={sidebarCollapsed ? "Sign out" : undefined}
            aria-label={sidebarCollapsed ? "Sign out" : undefined}
            className={cn(
              "flex w-full items-center rounded-[10px] text-left text-[14px] font-medium text-white/90 transition-colors hover:bg-white/5 hover:text-white",
              sidebarCollapsed ? "gap-3 px-4 py-3 lg:h-11 lg:justify-center lg:px-0 lg:py-0" : "gap-3 px-4 py-3"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={cn(sidebarCollapsed ? "lg:sr-only" : null)}>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className={cn("transition-[padding] duration-300", sidebarCollapsed ? "lg:pl-[84px]" : "lg:pl-[280px]")}>
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
