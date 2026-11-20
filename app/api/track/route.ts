import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createOptionalAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  cleanTrackTarget,
  getDeviceType,
  getExternalReferrerOrigin,
  getTrackedPath,
  isLikelyBot,
  isSiteClickEvent,
  MAX_SITE_EVENTS_PER_REQUEST,
} from "@/lib/site-analytics";

const COOKIE = "al_interaction_vid";
const STAFF_ROLES = new Set(["support", "admin", "super_admin"]);
const uuid = z.string().uuid();
const bodySchema = z.object({
  visitId: uuid,
  events: z.array(z.object({
    name: z.string().max(40),
    path: z.string().max(400),
    target: z.string().max(400).optional(),
    referrer: z.string().max(1000).optional(),
  })).min(1).max(MAX_SITE_EVENTS_PER_REQUEST),
});

type SiteEventRow = { event_name: string; path: string; target: string | null; referrer_origin: string | null };

const accepted = () => new NextResponse(null, { status: 204 });

// Best-effort analytics: failures are swallowed so tracking never affects the visitor.
export async function POST(request: Request) {
  const host = request.headers.get("host") || new URL(request.url).host;
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== host) return new NextResponse(null, { status: 403 });
    } catch {
      return new NextResponse(null, { status: 403 });
    }
  }

  const payload = bodySchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return new NextResponse(null, { status: 400 });

  const userAgent = request.headers.get("user-agent") || "";
  if (isLikelyBot(userAgent)) return accepted();

  const events = payload.data.events.flatMap((event): SiteEventRow[] => {
    const path = getTrackedPath(event.path);
    if (!path) return [];
    if (event.name === "page_view") {
      return [{ event_name: event.name, path, target: null, referrer_origin: event.referrer ? getExternalReferrerOrigin(event.referrer, host) ?? null : null }];
    }
    if (!isSiteClickEvent(event.name)) return [];
    return [{ event_name: event.name, path, target: cleanTrackTarget(event.target) ?? null, referrer_origin: null }];
  });
  if (events.length === 0) return accepted();

  try {
    const admin = createOptionalAdminClient();
    if (!admin) return accepted();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle<{ role: string }>();
      if (profile && STAFF_ROLES.has(profile.role)) return accepted();
    }

    const store = await cookies();
    const existing = store.get(COOKIE)?.value;
    const visitorId = existing && uuid.safeParse(existing).success ? existing : crypto.randomUUID();
    if (visitorId !== existing) store.set(COOKIE, visitorId, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, path: "/",
    });

    const device = getDeviceType(userAgent);
    const { error } = await admin.from("site_events").insert(events.map((event) => ({
      ...event,
      visitor_id: visitorId,
      visit_id: payload.data.visitId,
      signed_in: Boolean(user),
      device,
    })));
    if (error) console.error("Site event tracking failed:", error.message);
  } catch {
    // Visitors never see tracking failures.
  }
  return accepted();
}
