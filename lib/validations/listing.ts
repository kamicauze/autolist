
import { z } from "zod";

export const listingSchema = z.object({
    make: z.string().min(2, "Make must be at least 2 characters"),
    model: z.string().min(1, "Model is required"),
    year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
    price: z.coerce.number().positive("Price must be positive"),
    currency: z.enum(["KES", "USD"]).default("KES"),
    mileage: z.coerce.number().min(0, "Mileage cannot be negative"),
    condition: z.enum(["new", "used", "foreign_used"]),
    description: z.string().min(10, "Description must be at least 10 characters"),
    features: z.array(z.string()).min(1, "Select at least one feature"),
    body_type: z.string().optional(),
    transmission: z.string().optional(),
    fuel_type: z.string().optional(),
    color: z.string().optional(),
});

export type ListingFormData = z.infer<typeof listingSchema>;
