"use client";

import * as React from "react";
import {
  COMPARE_EVENT_NAME,
  COMPARE_MAX_ITEMS,
  COMPARE_STORAGE_KEY,
  normalizeCompareIds,
  readCompareIds,
  writeCompareIds,
} from "@/lib/utils/compare";

export type CompareMutationResult = {
  ok: boolean;
  reason?: "limit_reached" | "already_exists" | "not_found";
};

export function useCompare() {
  const [ids, setIds] = React.useState<string[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    setIds(readCompareIds());
    setIsLoaded(true);

    const onCompareUpdate = (event: Event) => {
      const compareEvent = event as CustomEvent<{ ids?: string[] }>;
      const nextIds = compareEvent.detail?.ids;

      if (nextIds) {
        setIds(normalizeCompareIds(nextIds));
        return;
      }

      setIds(readCompareIds());
    };

    const onStorageUpdate = (event: StorageEvent) => {
      if (event.key !== COMPARE_STORAGE_KEY) {
        return;
      }

      setIds(readCompareIds());
    };

    window.addEventListener(COMPARE_EVENT_NAME, onCompareUpdate);
    window.addEventListener("storage", onStorageUpdate);

    return () => {
      window.removeEventListener(COMPARE_EVENT_NAME, onCompareUpdate);
      window.removeEventListener("storage", onStorageUpdate);
    };
  }, []);

  const setCompareIds = React.useCallback((nextIds: string[]) => {
    const normalized = writeCompareIds(nextIds);
    setIds(normalized);
    return normalized;
  }, []);

  const isInCompare = React.useCallback(
    (listingId: string) => ids.includes(listingId),
    [ids]
  );

  const addToCompare = React.useCallback(
    (listingId: string): CompareMutationResult => {
      if (ids.includes(listingId)) {
        return { ok: true, reason: "already_exists" };
      }

      if (ids.length >= COMPARE_MAX_ITEMS) {
        return { ok: false, reason: "limit_reached" };
      }

      setCompareIds([...ids, listingId]);
      return { ok: true };
    },
    [ids, setCompareIds]
  );

  const removeFromCompare = React.useCallback(
    (listingId: string): CompareMutationResult => {
      if (!ids.includes(listingId)) {
        return { ok: false, reason: "not_found" };
      }

      setCompareIds(ids.filter((id) => id !== listingId));
      return { ok: true };
    },
    [ids, setCompareIds]
  );

  const toggleCompare = React.useCallback(
    (listingId: string): CompareMutationResult => {
      if (ids.includes(listingId)) {
        return removeFromCompare(listingId);
      }

      return addToCompare(listingId);
    },
    [ids, addToCompare, removeFromCompare]
  );

  const clearCompare = React.useCallback(() => {
    setCompareIds([]);
  }, [setCompareIds]);

  return {
    ids,
    isLoaded,
    maxItems: COMPARE_MAX_ITEMS,
    isInCompare,
    setCompareIds,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    clearCompare,
  };
}
