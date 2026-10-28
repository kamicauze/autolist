"use server";

import { cookies, headers } from "next/headers";
import { z } from "zod";
import { createOptionalAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const inputSchema = z.object({ listingId: z.string().uuid(), interaction: z.enum(["call", "financing"]) });
const viewerSchema = z.string().uuid();
const COOKIE = "al_interaction_vid";

// Best-effort analytics must never block a call or opening the financing form.
export async function recordListingInteraction(input: unknown) {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return;
  try {
    const userAgent = (await headers()).get("user-agent") || "";
    if (!userAgent || /bot|crawl|spider|slurp|preview|headless|lighthouse/i.test(userAgent)) return;
    const admin = createOptionalAdminClient();
    if (!admin) return;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError && authError.name !== "AuthSessionMissingError") return;
    const { data: listing, error } = await admin.from("listings")
      .select("seller_id, status, sale_channel")
      .eq("id", parsed.data.listingId)
      .maybeSingle<{ seller_id: string; status: string; sale_channel: string }>();
    if (error || !listing || listing.status !== "active" || !["standard", "dealer_public"].includes(listing.sale_channel)) return;
    if (user && listing.seller_id === user.id) return;
    let viewerKey = user ? `u:${user.id}` : "";
    if (!viewerKey) {
      const store = await cookies();
      const existing = store.get(COOKIE)?.value;
      const viewerId = existing && viewerSchema.safeParse(existing).success ? existing : crypto.randomUUID();
      if (viewerId !== existing) store.set(COOKIE, viewerId, {
        httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365, path: "/",
      });
      viewerKey = `a:${viewerId}`;
    }
    const { error: writeError } = await admin.from("listing_interactions").upsert({
      listing_id: parsed.data.listingId, interaction_type: parsed.data.interaction, viewer_key: viewerKey,
    }, { onConflict: "listing_id,interaction_type,viewer_key,interacted_on", ignoreDuplicates: true });
    if (writeError) console.error("Listing interaction tracking failed:", writeError.message);
  } catch {
    // Preserve the user's contact action even when telemetry is unavailable.
  }
}
