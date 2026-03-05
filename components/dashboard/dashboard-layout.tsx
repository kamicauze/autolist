"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./topnav";

interface DashboardLayoutProps {
  user: { email?: string | null; user_metadata?: Record<string, unknown> };
  children: React.ReactNode;
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[var(--sidebar-width)]">
        <TopNav user={user} onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
