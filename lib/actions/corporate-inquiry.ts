"use server";

import { z } from "zod";
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
