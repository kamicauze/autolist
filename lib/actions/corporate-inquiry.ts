"use server";

import { z } from "zod";
import { advertisingInquirySchema } from "@/lib/validations/advertising-inquiry";
import { sendProviderEmail } from "@/lib/server/delivery-providers";

const emailSchema = z.string().trim().email("Enter a valid email address.").max(160);

export async function submitCorporateInquiry(email: string) {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { success: false as const, error: "Enter a valid email address." };
  }

  // Preview submissions must remain inside the existing QA email sandbox.
  if (process.env.VERCEL_ENV !== "production" && process.env.EMAIL_PROVIDER !== "mailtrap") {
    return { success: false as const, error: "We couldn't send your request. Please email sales@autolist.co.ke directly." };
  }

  try {
    const delivery = await sendProviderEmail({
      to: "sales@autolist.co.ke",
      subject: "Corporate advertising and partnership inquiry",
      text: `Please contact ${parsed.data} about corporate advertising, brand collaborations or partnership opportunities on Autolist.\n\nSubmitted from the Autolist corporate inquiry form.`,
    });
    if (delivery.success) {
      return { success: true as const, message: "Thank you. Your request has been sent to our sales team." };
    }
  } catch {
    // Keep provider details out of the public form and retain the entered email.
  }

  return { success: false as const, error: "We couldn't send your request. Please email sales@autolist.co.ke directly." };
}

export async function submitAdvertisingInquiry(input: unknown) {
  const parsed = advertisingInquirySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Check your company and contact details, business type and selected options." };
  }

  if (process.env.VERCEL_ENV !== "production" && process.env.EMAIL_PROVIDER !== "mailtrap") {
    return { success: false as const, error: "We couldn't send your request. Please email sales@autolist.co.ke directly." };
  }

  const inquiry = parsed.data;
  const text = [
    "Advertising media kit request",
    `Company: ${inquiry.companyName}`,
    `Contact person: ${inquiry.contactName}`,
    `Job title: ${inquiry.jobTitle}`,
    `Email: ${inquiry.email}`,
    `Phone: ${inquiry.phone}`,
    `Business type: ${inquiry.businessType}`,
    `Placements: ${inquiry.placements?.length ? inquiry.placements.join(", ") : "Not specified"}`,
    `Monthly budget: ${inquiry.budgetRange || "Not specified"}`,
    `Additional message: ${inquiry.message || "None"}`,
    "",
    "Submitted from the Autolist advertising page.",
  ].join("\n");

  try {
    const delivery = await sendProviderEmail({
      to: "sales@autolist.co.ke",
      subject: "Advertising media kit request",
      text,
    });
    if (delivery.success) {
      return { success: true as const, message: "Thank you. Your request has been sent to our sales team. We'll be in touch within 24 hours to discuss your campaign." };
    }
  } catch {
    // Keep private provider details out of public responses.
  }

  return { success: false as const, error: "We couldn't send your request. Please email sales@autolist.co.ke directly." };
}
