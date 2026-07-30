
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

const normalizeCondition = (value: unknown) => {
  if (typeof value !== "string") return value;
  if (value === "used") return "locally_used";
  return value;
};

export const listingSchema = z.object({
  category: z.enum(LISTING_CATEGORIES),
  make: z.string().trim().min(2, "Make must be at least 2 characters"),
  model: z.string().trim().min(1, "Model is required"),
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
  metadata: z
    .object({
      details: z.record(z.string(), z.string()),
    })
    .optional(),
});

export type ListingFormData = z.infer<typeof listingSchema>;
