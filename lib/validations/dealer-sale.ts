import { z } from "zod";
import { normalizePhoneInput, PHONE_REGEX } from "@/lib/utils/phone";

export const DEALER_SALE_CHANNELS = ["dealer_public", "dealer_only"] as const;
export const DEALER_SALE_MARKET_CONDITIONS = [
  "Brand new",
  "Locally used",
  "Foreign used",
] as const;
export const DEALER_SALE_REPORTED_CONDITIONS = [
  "Excellent",
  "Good",
  "Below average",
  "Poor",
] as const;

const optionalEmail = z
  .string()
  .trim()
  .max(254, "Email address is too long.")
  .email("Enter a valid email address.")
  .optional()
  .or(z.literal(""));

export const dealerSaleIntakeSchema = z.object({
  requestId: z.string().uuid("Dealer-sale request id is invalid."),
  saleChannel: z.enum(DEALER_SALE_CHANNELS),
  year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  make: z.string().trim().min(2).max(100),
  model: z.string().trim().min(1).max(100),
  variant: z.string().trim().max(100).optional().or(z.literal("")),
  fuelType: z.enum(["Petrol", "Diesel", "Hybrid", "Electric"]),
  transmission: z.enum(["Automatic", "Manual"]),
  mileage: z.coerce.number().int().min(0).max(5_000_000),
  expectedPrice: z.coerce.number().positive().max(1_000_000_000),
  marketCondition: z.enum(DEALER_SALE_MARKET_CONDITIONS),
  condition: z.enum(DEALER_SALE_REPORTED_CONDITIONS),
  serviceHistory: z.enum(["Full with dealer", "Full", "Partial", "None"]),
  ownershipDuration: z.enum([
    "0-6 months",
    "6-12 months",
    "1-2 years",
    "2-5 years",
    "5+ years",
  ]),
  financed: z.enum(["Yes", "No"]),
  warranty: z.enum(["Yes", "No"]),
  documents: z.enum(["Yes", "No"]),
  registration: z.string().trim().max(30).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(100),
  fullName: z.string().trim().min(2).max(100),
  phone: z.preprocess(
    (value) => (typeof value === "string" ? normalizePhoneInput(value) : value),
    z
      .string()
      .trim()
      .refine(
        (value) => PHONE_REGEX.test(value),
        "Enter a valid phone number.",
      ),
  ),
  email: optionalEmail,
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type DealerSaleIntake = z.infer<typeof dealerSaleIntakeSchema>;
