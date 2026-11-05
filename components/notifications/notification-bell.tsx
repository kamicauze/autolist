"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotificationRefresh } from "./notification-refresh-provider";
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
  const { unreadCount, subscribeBell } = useNotificationRefresh();
  React.useEffect(subscribeBell, [subscribeBell]);
  const count = unreadCount ?? 0;

  return (
    <Link href={href} className={cn("relative", className)} aria-label="Notifications">
      <Bell className="h-5 w-5" />
      {count > 0 ? (
        <span
          className={cn(
            "absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-semibold text-white",
            badgeClassName
          )}
        >
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
