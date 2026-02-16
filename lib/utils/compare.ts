export const COMPARE_STORAGE_KEY = "autolist:compare-ids";
export const COMPARE_EVENT_NAME = "autolist:compare-updated";
export const COMPARE_MAX_ITEMS = 3;

export function normalizeCompareIds(ids: string[]): string[] {
  const uniqueIds = new Set<string>();

  for (const rawId of ids) {
    const id = rawId.trim();
    if (!id) {
      continue;
    }

    uniqueIds.add(id);

    if (uniqueIds.size >= COMPARE_MAX_ITEMS) {
      break;
    }
  }

  return Array.from(uniqueIds);
}

export function parseCompareIds(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  return normalizeCompareIds(value.split(","));
}

export function readCompareIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return normalizeCompareIds(parsed.filter((item): item is string => typeof item === "string"));
    }

    if (typeof parsed === "string") {
      return parseCompareIds(parsed);
    }

    return [];
  } catch {
    return [];
  }
}

export function writeCompareIds(ids: string[]): string[] {
  const normalized = normalizeCompareIds(ids);

  if (typeof window === "undefined") {
    return normalized;
  }

  window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(
    new CustomEvent<{ ids: string[] }>(COMPARE_EVENT_NAME, {
      detail: { ids: normalized },
    })
  );

  return normalized;
}
