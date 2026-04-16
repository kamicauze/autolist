"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationBellProps = {
  href?: string;
  className?: string;
  badgeClassName?: string;
};

export function NotificationBell({
  href = "/notifications",
  className,
  badgeClassName,
}: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/notifications?limit=1", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { unreadCount?: number };
        if (active) {
          setUnreadCount(payload.unreadCount || 0);
        }
      } catch {
        // Keep the bell passive when notifications cannot be loaded.
      }
    }

    void load();
    const interval = window.setInterval(load, 30000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <Link href={href} className={cn("relative", className)} aria-label="Notifications">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 ? (
        <span
          className={cn(
            "absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-semibold text-white",
            badgeClassName
          )}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
