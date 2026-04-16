"use client";

import * as React from "react";
import Link from "next/link";
import { BellRing, CheckCheck, ChevronRight } from "lucide-react";
import type { NotificationCenterData, NotificationListItem } from "@/lib/types/notifications";

type NotificationInboxProps = {
  initialData: NotificationCenterData | null;
};

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-KE", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function NotificationInbox({ initialData }: NotificationInboxProps) {
  const [notifications, setNotifications] = React.useState<NotificationListItem[]>(
    initialData?.notifications || []
  );
  const [unreadCount, setUnreadCount] = React.useState(initialData?.unreadCount || 0);
  const [isMarkingAll, setIsMarkingAll] = React.useState(false);
  const viewer = initialData?.viewer || null;

  async function markAllAsRead() {
    setIsMarkingAll(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        return;
      }

      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          status: "read",
          readAt: item.readAt || readAt,
        }))
      );
      setUnreadCount(0);
    } finally {
      setIsMarkingAll(false);
    }
  }

  async function markRead(id: string) {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id && !item.readAt
          ? {
              ...item,
              status: "read",
              readAt: new Date().toISOString(),
            }
          : item
      )
    );
    setUnreadCount((current) => Math.max(0, current - 1));

    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    }).catch(() => undefined);
  }

  if (!viewer) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#e5e7eb] bg-white p-8 text-[14px] text-[#475467]">
          Sign in to view notifications.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
            Notification Center
          </p>
          <h1 className="mt-2 text-[32px] font-semibold text-[#111827]">Updates that need your attention</h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-7 text-[#667085]">
            New enquiries, replies, and support workflow changes land here first. Email and WhatsApp delivery can layer on top later.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void markAllAsRead()}
          disabled={isMarkingAll || unreadCount === 0}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d0d5dd] bg-white px-4 text-[14px] font-medium text-[#344054] transition hover:border-[#98a2b3] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCheck className="h-4 w-4" />
          {isMarkingAll ? "Marking..." : "Mark all as read"}
        </button>
      </div>

      <div className="mt-8 rounded-[28px] border border-[#e5e7eb] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#eaecf0] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#111827]">Inbox</p>
              <p className="text-[13px] text-[#667085]">{unreadCount} unread</p>
            </div>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="px-6 py-10 text-[14px] text-[#667085]">No notifications yet.</div>
        ) : null}

        <div className="divide-y divide-[#eaecf0]">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-6 py-5 transition ${notification.readAt ? "bg-white" : "bg-[#f8fbff]"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-[15px] font-semibold text-[#111827]">{notification.title}</p>
                    {!notification.readAt ? (
                      <span className="inline-flex rounded-full bg-[#dbeafe] px-2 py-0.5 text-[11px] font-semibold text-[#1d4ed8]">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[14px] leading-6 text-[#475467]">{notification.body}</p>
                  <p className="mt-3 text-[12px] text-[#98a2b3]">{formatTimestamp(notification.createdAt)}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!notification.readAt ? (
                    <button
                      type="button"
                      onClick={() => void markRead(notification.id)}
                      className="rounded-full border border-[#d0d5dd] px-3 py-2 text-[12px] font-medium text-[#344054] transition hover:border-[#98a2b3]"
                    >
                      Mark read
                    </button>
                  ) : null}

                  {notification.href ? (
                    <Link
                      href={notification.href}
                      onClick={() => {
                        if (!notification.readAt) {
                          void markRead(notification.id);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-[#2563eb] px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-[#1d4ed8]"
                    >
                      Open
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
