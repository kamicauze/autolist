"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { importInquirySchema, importYearLabel, type ImportInquiryInput } from "@/lib/import-inquiry/validation";
import { LISTING_CATEGORY_OPTIONS } from "@/lib/constants/marketplace";

export async function submitImportInquiry(input: ImportInquiryInput) {
  const parsed = importInquirySchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message || "Check your requirements." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();
  let creatorId = user?.id;
  if (!creatorId) {
    const { data } = await admin.from("profiles").select("id")
      .in("role", ["support", "admin", "super_admin"]).order("created_at").limit(1).maybeSingle();
    creatorId = data?.id;
  }
  if (!creatorId) return { success: false as const, error: "Import inquiries are unavailable. Please try again shortly." };
  const value = parsed.data;
  const category = LISTING_CATEGORY_OPTIONS.find((option) => option.value === value.category)?.label;
  const summary = [
    `Name: ${value.firstName}`, `Email: ${value.email}`, `Phone: ${value.phone}`,
    `Category: ${category}`, `Make: ${value.make}`, `Model: ${value.model}`,
    `Year from: ${importYearLabel(value.yearFrom)}`, `Year to: ${importYearLabel(value.yearTo)}`,
    `Engine size: ${value.engineSize || "Not specified"}`, `Colour: ${value.color || "Not specified"}`,
    `Budget: KES ${value.budgetFrom.toLocaleString("en-KE")} - ${value.budgetTo.toLocaleString("en-KE")}`,
    `Additional notes: ${value.notes || "None"}`,
  ].join("\n");
  const { data: ticket, error } = await admin.from("support_tickets").insert({
    created_by: creatorId, subject: `Import inquiry: ${value.make} ${value.model}`,
    category: "import_inquiry", status: "open", priority: "medium",
    customer_summary: summary, internal_note: "Submitted from /import-inquiry",
  }).select("id").single();
  if (error || !ticket) {
    console.error("Failed to store import inquiry", error);
    return { success: false as const, error: "Unable to send your inquiry. Please try again." };
  }
  revalidatePath("/admin/car-inquiries");
  return { success: true as const, message: "Your import inquiry has been sent. Our team will contact you shortly." };
}
