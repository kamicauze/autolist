"use client";

import * as React from "react";
import type { DashboardAccountKind } from "@/lib/data/dashboard-account";
import type { SellerPackageAccessState } from "@/lib/types/membership";
import type { SalesAgentPermission } from "@/lib/constants/sales-agent-permissions";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { TopNav } from "./topnav";

interface DashboardLayoutProps {
  user: { email?: string | null; user_metadata?: Record<string, unknown> };
  accountKind: DashboardAccountKind;
  packageAccess: SellerPackageAccessState;
  salesAgentPermissions?: SalesAgentPermission[] | null;
  children: React.ReactNode;
}

export function DashboardLayout({
  user,
  accountKind,
  packageAccess,
  salesAgentPermissions,
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    try {
      setSidebarCollapsed(window.localStorage.getItem("dashboard-sidebar-collapsed") === "true");
    } catch {
      setSidebarCollapsed(false);
    }
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem("dashboard-sidebar-collapsed", String(sidebarCollapsed));
    } catch {
      // Ignore storage failures; the toggle still works for the current session.
    }
  }, [sidebarCollapsed]);

  return (
    <div className="font-body min-h-screen bg-[#f6f4ef] text-[#202224]">
      <Sidebar
        user={user}
        accountKind={accountKind}
        packageAccess={packageAccess}
        salesAgentPermissions={salesAgentPermissions}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
      />

      <div
        className={cn(
          "transition-[padding] duration-300",
          sidebarCollapsed ? "lg:pl-[84px]" : "lg:pl-[var(--sidebar-width)]"
        )}
      >
        <TopNav user={user} onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-[calc(100vh-88px)] px-4 pb-8 pt-6 md:px-6 lg:px-8 lg:pt-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
