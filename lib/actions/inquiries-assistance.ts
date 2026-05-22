"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  emitNotificationEvent,
  getStaffRecipients,
  getTicketHref,
} from "@/lib/server/notifications";

const inquiryAssistanceSchema = z.object({
  roleType: z.enum(["buyer", "seller", "dealer", "other"]),
  fullName: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(160),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(4, "Enter a subject.").max(160),
  message: z.string().trim().min(20, "Tell us how we can help.").max(2000),
});

export type InquiryAssistanceInput = z.infer<typeof inquiryAssistanceSchema>;

export type InquiryAssistanceResult =
  | { success: true; message: string }
  | { success: false; error: string };

async function resolveFallbackCreatorId() {
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("profiles")
    .select("id")
    .in("role", ["support", "admin", "super_admin"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (error || !data?.id) return null;
  return data.id;
}

function roleCategory(roleType: InquiryAssistanceInput["roleType"]) {
  if (roleType === "buyer") return "buyer_assistance";
  if (roleType === "seller" || roleType === "dealer") return "seller_assistance";
  return "inquiries_assistance";
}

function buildCustomerSummary(input: InquiryAssistanceInput) {
  return [
    `Requester type: ${input.roleType}`,
    `Name: ${input.fullName}`,
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : null,
    "",
    input.message,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export async function submitInquiryAssistanceRequest(
  input: InquiryAssistanceInput
): Promise<InquiryAssistanceResult> {
  const parsed = inquiryAssistanceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Complete the inquiry form.",
    };
  }

  const payload = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const createdBy = user?.id ?? (await resolveFallbackCreatorId());

  if (!createdBy) {
    return {
      success: false,
      error: "Assistance requests are not ready yet. Please try again shortly.",
    };
  }

  const adminSupabase = createAdminClient();
  const customerSummary = buildCustomerSummary(payload);
  const { data: ticket, error } = await adminSupabase
    .from("support_tickets")
    .insert({
      thread_id: null,
      listing_id: null,
      created_by: createdBy,
      subject: payload.subject,
      category: roleCategory(payload.roleType),
      priority: "medium",
      status: "open",
      customer_summary: customerSummary,
      internal_note: "Submitted from /inquiries-assistance",
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !ticket) {
    return {
      success: false,
      error: error?.message || "Unable to send your inquiry right now.",
    };
  }

  await adminSupabase.from("ticket_events").insert({
    ticket_id: ticket.id,
    actor_id: createdBy,
    event_type: "created",
    note: "Inquiry and assistance request submitted.",
    metadata: {
      requesterType: payload.roleType,
      requesterEmail: payload.email,
    },
  });

  const staffRecipients = await getStaffRecipients([createdBy]);
  try {
    await emitNotificationEvent({
      eventType: "ticket_created",
      actorId: createdBy,
      ticketId: ticket.id,
      payload: {
        subject: payload.subject,
        category: roleCategory(payload.roleType),
        requesterType: payload.roleType,
      },
      deliveries: staffRecipients.map((recipient) => ({
        recipientId: recipient.id,
        title: `New inquiry: ${payload.subject}`,
        body: payload.message,
        href: getTicketHref(recipient.role, ticket.id),
        metadata: {
          ticketId: ticket.id,
          category: roleCategory(payload.roleType),
        },
      })),
    });
  } catch (notificationError) {
    console.error("Failed to emit inquiry assistance notification", notificationError);
  }

  revalidatePath("/admin/car-inquiries");

  return {
    success: true,
    message: "Your inquiry has been sent. The Autolist team will review it and respond.",
  };
}
