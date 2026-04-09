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
    <div className="font-body min-h-screen bg-[#f6f4ef] text-[#202224]">
      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[var(--sidebar-width)]">
        <TopNav user={user} onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-[calc(100vh-88px)] px-4 pb-8 pt-6 md:px-6 lg:px-8 lg:pt-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
