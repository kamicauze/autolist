
import { z } from "zod";

const LISTING_CONDITIONS = ["new", "locally_used", "foreign_used"] as const;
const LISTING_CATEGORIES = [
  "car",
  "van",
  "motorbike",
  "truck",
  "plant_construction",
  "farm_agricultural",
] as const;
const LISTING_AVAILABILITY = ["available", "reserved", "sold"] as const;
const LISTING_SELLER_TYPES = ["dealer", "individual"] as const;

const normalizeCondition = (value: unknown) => {
  if (typeof value !== "string") return value;
  if (value === "used") return "locally_used";
  return value;
};

export const listingSchema = z.object({
  make: z.string().trim().min(2, "Make must be at least 2 characters"),
  model: z.string().trim().min(1, "Model is required"),
  trim: z.string().trim().optional(),
  variant: z.string().trim().optional(),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  price: z.coerce.number().positive("Price must be positive"),
  currency: z.literal("KES").default("KES"),
  mileage: z.coerce.number().min(0, "Mileage cannot be negative").optional(),
  condition: z.preprocess(normalizeCondition, z.enum(LISTING_CONDITIONS)),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(800, "Description cannot exceed 800 characters."),
  features: z
    .array(z.string().trim().min(1))
    .min(1, "Select at least one feature")
    .max(200, "Too many features selected"),
  body_type: z.string().trim().optional(),
  transmission: z.string().trim().optional(),
  fuel_type: z.string().trim().optional(),
  color: z.string().trim().optional(),
  seats: z.coerce.number().int().min(1).max(100).optional(),
  doors: z.coerce.number().int().min(1).max(10).optional(),
  drive_type: z.string().trim().optional(),
  details: z.record(z.string(), z.string().trim()).optional(),
  category: z.enum(LISTING_CATEGORIES).optional(),
  country: z.string().trim().optional(),
  cityTown: z.string().trim().optional(),
  locationArea: z.string().trim().optional(),
  availability: z.enum(LISTING_AVAILABILITY).optional(),
  negotiable: z.boolean().optional(),
  tradeInAccepted: z.boolean().optional(),
  videoUrl: z.string().trim().url("Enter a valid video URL.").optional().or(z.literal("")),
  sellerType: z.enum(LISTING_SELLER_TYPES).optional(),
  useDealerAutoFill: z.boolean().optional(),
  contactName: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
  whatsappEnabled: z.boolean().optional(),
  whatsappNumber: z.string().trim().optional(),
  allowPhoneCalls: z.boolean().optional(),
  hidePhoneNumber: z.boolean().optional(),
});

export type ListingFormData = z.infer<typeof listingSchema>;
