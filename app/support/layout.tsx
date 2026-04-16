import type { ReactNode } from "react";
import { requireSupportPage } from "@/lib/support/guard";
import { NotificationBell } from "@/components/notifications/notification-bell";

export default async function SupportLayout({ children }: { children: ReactNode }) {
  await requireSupportPage("/support/tickets");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <header className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
              Support Workspace
            </p>
            <h1 className="mt-1 text-[28px] font-semibold">Buyer & Seller Support</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#344054]">
            <NotificationBell className="text-[#344054]" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
