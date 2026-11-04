"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  ANALYTICS_CONSENT_KEY,
  getAnalyticsPageLocation,
  getAnalyticsReferrer,
  isAnalyticsPageAllowed,
  type AnalyticsConsent,
} from "@/lib/google-analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

const CONSENT_EVENT = "autolist-analytics-consent-change";
let sessionConsent: AnalyticsConsent = null;
let storageUnavailable = false;

function readConsent(): AnalyticsConsent {
  if (storageUnavailable) return sessionConsent;
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return sessionConsent;
  }
}

function subscribeConsent(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CONSENT_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CONSENT_EVENT, callback);
  };
}

const serverConsent = () => null;
const browserHostname = () => window.location.hostname;

function clearAnalyticsCookies(measurementId: string) {
  const names = ["_ga", `_ga_${measurementId.slice(2)}`];
  for (const name of names) {
    for (const domain of ["", `; domain=${window.location.hostname}`, "; domain=.autolist.co.ke"]) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain}; SameSite=Lax; Secure`;
    }
  }
}

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribeConsent, readConsent, serverConsent);
  const hostname = useSyncExternalStore(subscribeConsent, browserHostname, serverConsent);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const configured = useRef(false);
  const previousPage = useRef<string | null>(null);
  const previousConsent = useRef<AnalyticsConsent>(null);
  const eligible = hostname !== null && isAnalyticsPageAllowed(pathname, hostname);
  const enabled = eligible && consent === "accepted";

  useEffect(() => {
    const analytics = window;
    analytics[`ga-disable-${measurementId}`] = !enabled;
    if (previousConsent.current === "accepted" && consent !== "accepted") {
      clearAnalyticsCookies(measurementId);
    }
    previousConsent.current = consent;

    if (!enabled) {
      previousPage.current = null;
      return;
    }
    if (!scriptReady) return;

    analytics.dataLayer ??= [];
    analytics.gtag ??= function () {
      // eslint-disable-next-line prefer-rest-params -- Google tag commands use an arguments object.
      analytics.dataLayer!.push(arguments);
    };
    const page = {
      page_location: getAnalyticsPageLocation(pathname),
      page_referrer: previousPage.current ?? getAnalyticsReferrer(document.referrer),
      page_title: document.title,
    };
    // Set safe defaults before configuration, including automatic session events.
    analytics.gtag("set", page);
    if (!configured.current) {
      analytics.gtag("consent", "default", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      analytics.gtag("js", new Date());
      analytics.gtag("config", measurementId, {
        ...page,
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
      configured.current = true;
    }
    if (previousPage.current !== page.page_location) {
      analytics.gtag("event", "page_view", page);
      previousPage.current = page.page_location;
    }
  }, [consent, enabled, measurementId, pathname, scriptReady]);

  function chooseConsent(value: Exclude<AnalyticsConsent, null>) {
    const analytics = window;
    analytics[`ga-disable-${measurementId}`] = value !== "accepted";
    sessionConsent = value;
    try {
      window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    } catch {
      // The choice still applies to this visit if browser storage is unavailable.
      storageUnavailable = true;
    }
    window.dispatchEvent(new Event(CONSENT_EVENT));
    setPreferencesOpen(false);
    if (value === "declined") {
      clearAnalyticsCookies(measurementId);
      if (scriptReady) window.location.reload();
    }
  }

  return (
    <>
      {enabled && (
        <Script
          id="autolist-google-analytics"
          src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
        />
      )}
      {eligible && (
        !consent || preferencesOpen ? (
          <section
            aria-label="Analytics cookie preferences"
            className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-xl border border-border bg-background p-5 text-foreground shadow-lg"
          >
            <h2 className="text-base font-semibold">Your cookie preferences</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We use essential cookies to run Autolist. With your permission, Google Analytics helps us
              understand visits to public pages. You can change your choice at any time.{' '}
              <Link href="/cookies" className="underline underline-offset-2">Read our Cookie Policy</Link>.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => chooseConsent("declined")}>
                Decline analytics
              </Button>
              <Button type="button" onClick={() => chooseConsent("accepted")}>Allow analytics</Button>
            </div>
          </section>
        ) : (
          <button
            type="button"
            className="fixed bottom-3 left-3 z-40 rounded-full border border-border bg-background px-3 py-2 text-xs text-foreground shadow-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
            onClick={() => setPreferencesOpen(true)}
          >
            Cookie preferences
          </button>
        )
      )}
    </>
  );
}
