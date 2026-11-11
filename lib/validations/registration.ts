import { z } from "zod";
import type { SellerVerificationDocumentType } from "@/lib/types/seller-verification";
import { KENYA_COUNTIES } from "@/lib/constants/filters";
import { normalizePhoneForVerification, PHONE_REGEX } from "@/lib/utils/phone";

export const listingPhoneSchema = z.string().trim().max(32)
  .regex(/^\+?[\d\s()-]+$/, "Enter a valid phone number.")
  .transform((phone) => normalizePhoneForVerification(phone.replace(/[\s()-]/g, "")))
  .refine((phone) => PHONE_REGEX.test(phone), "Enter a valid phone number.");

export const dealerRegistrationSchema = z.object({
  name: z.string().trim().min(1).max(160),
  phone: listingPhoneSchema,
  address: z.string().trim().min(1).max(250),
  town: z.string().trim().min(1).max(120),
  county: z.string().pipe(z.enum(KENYA_COUNTIES)),
  area: z.string().trim().max(120),
  document: z.object({
    type: z.enum(["cr12", "national_id", "passport"]),
    path: z.string().min(1).max(512),
    name: z.string().trim().min(1).max(255),
  }).optional(),
});

export const dealerRegistrationDocumentLabels = {
  cr12: "CR12",
  national_id: "National ID",
  passport: "Passport",
} as const;

export type DealerRegistrationDocumentType = keyof typeof dealerRegistrationDocumentLabels;
export type DealerRegistration = z.input<typeof dealerRegistrationSchema>;

export const sellerIdentityDocuments = {
  national_id_front: "National ID front",
  national_id_back: "National ID back",
  passport: "Passport photo page",
} satisfies Record<SellerVerificationDocumentType, string>;

export function hasCompleteSellerIdentity(types: readonly string[]) {
  return types.includes("passport") ||
    (types.includes("national_id_front") && types.includes("national_id_back"));
}

export function getDealerRegistrationDocumentLabel(type: string) {
  return Object.hasOwn(dealerRegistrationDocumentLabels, type)
    ? dealerRegistrationDocumentLabels[type as DealerRegistrationDocumentType]
    : undefined;
}
