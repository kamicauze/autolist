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

async function incrementCounter({
  table,
  id,
  column,
}: {
  table: "cms_banners" | "cms_special_offers";
  id: string;
  column: "impression_count" | "click_count" | "redemption_count";
}) {
  const supabase = createOptionalAdminClient();
  if (!supabase) return;

  const { data, error } = await supabase
    .from(table)
    .select(column)
    .eq("id", id)
    .maybeSingle<Record<string, number | null>>();

  if (error || !data) return;

  await supabase
    .from(table)
    .update({ [column]: (data[column] ?? 0) + 1 })
    .eq("id", id);
}

export async function POST(request: Request) {
  const payload = trackSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (payload.data.type === "banner_impression") {
    await Promise.all(
      payload.data.ids.map((id) =>
        incrementCounter({
          table: "cms_banners",
          id,
          column: "impression_count",
        })
      )
    );
  }

  if (payload.data.type === "banner_click") {
    await incrementCounter({
      table: "cms_banners",
      id: payload.data.id,
      column: "click_count",
    });
  }

  if (payload.data.type === "offer_redemption") {
    await incrementCounter({
      table: "cms_special_offers",
      id: payload.data.id,
      column: "redemption_count",
    });
  }

  return NextResponse.json({ ok: true });
}
