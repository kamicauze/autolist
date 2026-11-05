"use client";

import { useEffect, useEffectEvent } from "react";

export function useVisiblePolling(
  poll: (signal: AbortSignal) => void | Promise<void>,
  intervalMs: number,
  enabled = true,
  immediate = false,
) {
  const runPoll = useEffectEvent(poll);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let inFlight = false;
    let lastPoll = immediate ? 0 : Date.now();

    async function tick() {
      if (document.hidden || inFlight || Date.now() - lastPoll < intervalMs) return;

      inFlight = true;
      lastPoll = Date.now();
      try {
        await runPoll(controller.signal);
      } catch {
        // Keep the displayed data on transient failures and retry on the next tick.
      } finally {
        inFlight = false;
      }
    }

    if (immediate) void tick();
    const timer = window.setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [enabled, immediate, intervalMs]);
}
