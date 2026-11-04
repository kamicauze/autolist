import { NextResponse } from "next/server";
import { z } from "zod";
import { createOptionalAdminClient } from "@/lib/supabase/admin";

const trackSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("banner_impression"),
    ids: z.array(z.string().uuid()).min(1).max(12),
  }),
  z.object({
    type: z.literal("banner_click"),
    id: z.string().uuid(),
  }),
  z.object({
    type: z.literal("offer_redemption"),
    id: z.string().uuid(),
  }),
]);

export async function POST(request: Request) {
  const payload = trackSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = createOptionalAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const campaignIds = payload.data.type === "banner_impression"
    ? [...new Set(payload.data.ids)]
    : [payload.data.id];
  const { error } = await supabase.rpc("record_cms_campaign_event", {
    event_type: payload.data.type,
    campaign_ids: campaignIds,
  });
  if (error) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
