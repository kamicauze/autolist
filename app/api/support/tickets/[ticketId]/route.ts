import { NextRequest, NextResponse } from "next/server";
import { emitNotificationEvent, getTicketHref } from "@/lib/server/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type TicketPatchPayload = {
  status?: "open" | "triaged" | "waiting_on_seller" | "waiting_on_buyer" | "resolved" | "closed";
  internalNote?: string;
  resolutionNote?: string;
  assignToSelf?: boolean;
  assignedToUserId?: string;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string }>();

  if (!profile || !["admin", "super_admin", "support"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { ticketId } = await params;
  const payload = (await request.json()) as TicketPatchPayload;

  const updates: Record<string, string | null> = {};
  const notes: string[] = [];

  if (payload.status) {
    updates.status = payload.status;
    notes.push(`Status changed to ${payload.status}.`);
  }

  if (typeof payload.internalNote === "string") {
    updates.internal_note = payload.internalNote.trim() || null;
    notes.push("Internal note updated.");
  }

  if (typeof payload.resolutionNote === "string") {
    updates.resolution_note = payload.resolutionNote.trim() || null;
    notes.push("Resolution note updated.");
  }

  if (payload.assignToSelf) {
    updates.assigned_to = user.id;
    notes.push("Ticket assigned to current staff member.");
  } else if (typeof payload.assignedToUserId === "string" && payload.assignedToUserId.trim()) {
    updates.assigned_to = payload.assignedToUserId.trim();
    notes.push("Ticket assigned.");
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates supplied." }, { status: 400 });
  }

  const { data: updatedTicket, error } = await adminSupabase
    .from("support_tickets")
    .update(updates)
    .eq("id", ticketId)
    .select("id, status, assigned_to, updated_at")
    .single();

  if (error || !updatedTicket) {
    return NextResponse.json({ error: error?.message || "Unable to update ticket." }, { status: 400 });
  }

  await adminSupabase.from("ticket_events").insert({
    ticket_id: ticketId,
    actor_id: user.id,
    event_type:
      payload.status === "resolved"
        ? "resolved"
        : payload.status === "closed"
          ? "closed"
          : payload.assignToSelf
            ? "assigned"
            : "status_changed",
    note: notes.join(" "),
  });

  if (updatedTicket.assigned_to && updatedTicket.assigned_to !== user.id) {
    const { data: assignee } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", updatedTicket.assigned_to)
      .maybeSingle<{ role: "admin" | "super_admin" | "support" }>();

    try {
      await emitNotificationEvent({
        eventType: "ticket_assigned",
        actorId: user.id,
        ticketId,
        payload: {
          status: updatedTicket.status,
        },
        deliveries: [
          {
            recipientId: updatedTicket.assigned_to,
            title: "Support ticket assigned to you",
            body: `Ticket ${ticketId.slice(0, 8)} is now assigned to you.`,
            href: getTicketHref(assignee?.role || "support", ticketId),
            metadata: {
              ticketId,
            },
          },
        ],
      });
    } catch (notificationError) {
      console.error("Failed to emit ticket-assigned notification", notificationError);
    }
  }

  return NextResponse.json(updatedTicket);
}
