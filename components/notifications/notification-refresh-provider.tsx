"use client";

import * as React from "react";
import { useVisiblePolling } from "@/lib/hooks/use-visible-polling";
import type { NotificationCenterData } from "@/lib/types/notifications";

type InboxListener = (data: NotificationCenterData) => void;

type NotificationRefresh = {
  unreadCount: number | null;
  subscribeBell: () => () => void;
  subscribeInbox: (receive: InboxListener, unreadCount: number) => () => void;
  setUnreadCount: React.Dispatch<React.SetStateAction<number | null>>;
  beginRead: () => () => void;
};

const NotificationRefreshContext = React.createContext<NotificationRefresh | null>(null);

export function NotificationRefreshProvider({ children }: { children: React.ReactNode }) {
  const [bellCount, setBellCount] = React.useState(0);
  const [inbox, setInbox] = React.useState<InboxListener | null>(null);
  const [unreadCount, setUnreadCount] = React.useState<number | null>(null);
  const readVersion = React.useRef(0);
  const pendingReads = React.useRef(0);

  const subscribeBell = React.useCallback(() => {
    setBellCount((count) => count + 1);
    return () => setBellCount((count) => count - 1);
  }, []);

  const subscribeInbox = React.useCallback((receive: InboxListener, count: number) => {
    readVersion.current++;
    setUnreadCount(count);
    setInbox(() => receive);
    return () => {
      readVersion.current++;
      setInbox((current: InboxListener | null) => current === receive ? null : current);
    };
  }, []);

  const beginRead = React.useCallback(() => {
    readVersion.current++;
    pendingReads.current++;
    return () => {
      pendingReads.current--;
    };
  }, []);

  useVisiblePolling(async (signal) => {
    if (pendingReads.current) return;
    const version = readVersion.current;
    const response = await fetch(`/api/notifications?limit=${inbox ? 40 : 0}`, {
      cache: "no-store",
      signal,
    });
    if (signal.aborted || readVersion.current !== version) return;
    if (response.status === 401) setUnreadCount(null);
    if (!response.ok) return;

    const data = (await response.json()) as NotificationCenterData;
    if (signal.aborted || readVersion.current !== version) return;
    setUnreadCount(data.unreadCount);
    inbox?.(data);
  }, 30_000, bellCount > 0 || Boolean(inbox), !inbox);

  const value = React.useMemo(() => ({
    unreadCount,
    subscribeBell,
    subscribeInbox,
    setUnreadCount,
    beginRead,
  }), [unreadCount, subscribeBell, subscribeInbox, beginRead]);

  return (
    <NotificationRefreshContext.Provider value={value}>
      {children}
    </NotificationRefreshContext.Provider>
  );
}

export function useNotificationRefresh() {
  const value = React.useContext(NotificationRefreshContext);
  if (!value) throw new Error("NotificationRefreshProvider is required.");
  return value;
}
