import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deliveryId } = await params;
  const payload = (await request.json().catch(() => ({}))) as { read?: boolean };
  const read = payload.read !== false;

  const update = read
    ? { status: "read", read_at: new Date().toISOString() }
    : { status: "sent", read_at: null };

  const { error } = await supabase
    .from("notification_deliveries")
    .update(update)
    .eq("id", deliveryId)
    .eq("recipient_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
