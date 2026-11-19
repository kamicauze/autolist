"use client";

import { useState } from "react";

/** null means a failed read; an empty collection is still a successful read. */
export function useLastSuccessfulValue<T>(value: T | null, scope: string): T | null {
  const [snapshot, setSnapshot] = useState({ value, scope });
  if (snapshot.scope !== scope || (value !== null && snapshot.value !== value)) {
    setSnapshot({ value, scope });
    return value;
  }
  return value ?? snapshot.value;
}
