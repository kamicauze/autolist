import { z } from "zod";
import type { SellerVerificationDocumentType } from "@/lib/types/seller-verification";
import { KENYA_COUNTIES } from "@/lib/constants/filters";
import { LISTING_PHONE_ERROR, normalizeListingPhone } from "@/lib/utils/phone";

export const listingPhoneSchema = z.string().trim().max(32, LISTING_PHONE_ERROR)
  .transform((phone, ctx) => {
    const normalized = normalizeListingPhone(phone);
    if (normalized) return normalized;
    ctx.addIssue({ code: "custom", message: LISTING_PHONE_ERROR });
    return z.NEVER;
  });

export const DEALERSHIP_NAME_ERROR =
  "Dealership name can't include emoji, < or > characters, or control characters.";
// Extended_Pictographic also covers the ©, ® and ™ signs, which stay allowed;
// flags are regional-indicator pairs that it misses.
const DISALLOWED_DEALERSHIP_NAME_CHARACTERS =
  /(?![©®™])[<>\p{Cc}\p{Extended_Pictographic}\p{Regional_Indicator}]/u;

export const dealerRegistrationSchema = z.object({
  name: z.string().trim()
    .min(1, "Dealership name is required.")
    .max(160, "Dealership name must be 160 characters or fewer.")
    .refine((name) => !DISALLOWED_DEALERSHIP_NAME_CHARACTERS.test(name), DEALERSHIP_NAME_ERROR),
  phone: listingPhoneSchema,
  address: z.string().trim().min(1).max(250),
  town: z.string().trim().min(1).max(120),
  county: z.string().pipe(z.enum(KENYA_COUNTIES)),
  area: z.string().trim().max(120),
  document: z.object({
    type: z.enum(["cr12", "incorporation_certificate", "national_id", "passport"]),
    path: z.string().min(1).max(512),
    name: z.string().trim().min(1).max(255),
  }).optional(),
});

export const dealerRegistrationDocumentLabels = {
  cr12: "CR12",
  incorporation_certificate: "Certificate of Incorporation",
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
