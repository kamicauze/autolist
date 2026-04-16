import { NextResponse } from "next/server";
import { getNotificationCenterData } from "@/lib/data/notifications";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawLimit = Number(url.searchParams.get("limit") || "8");
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50) : 8;
  const data = await getNotificationCenterData(limit);

  if (!data) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(data);
}

export async function PATCH() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timestamp = new Date().toISOString();
  const { error } = await supabase
    .from("notification_deliveries")
    .update({ status: "read", read_at: timestamp })
    .eq("recipient_id", user.id)
    .eq("channel", "in_app")
    .is("read_at", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, readAt: timestamp });
}
