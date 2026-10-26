import { z } from "zod";

export const advertisingBusinessTypes = ["Bank", "Insurance", "Automotive Franchise", "Auto Finance", "Other"] as const;
export const advertisingPlacements = ["Hero Banner", "Top Banner", "Featured Dealer Banner", "Category Page Banner", "Sidebar Rectangle", "In-Feed Sponsored Listing", "Sponsored Email Feature", "Dealer Profile Badge"] as const;
export const advertisingBudgetRanges = ["Under KES 50,000", "KES 50,000–100,000", "KES 100,000–250,000", "KES 250,000+"] as const;

const singleLine = (max: number) => z.string().trim().min(1).max(max).regex(/^[^\r\n]+$/);

export const advertisingInquirySchema = z.object({
  companyName: singleLine(160),
  contactName: singleLine(120),
  jobTitle: singleLine(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(7).max(30).regex(/^\+?[\d\s().-]+$/).refine((value) => value.replace(/\D/g, "").length >= 7),
  businessType: z.enum(advertisingBusinessTypes),
  placements: z.array(z.enum(advertisingPlacements)).max(advertisingPlacements.length).optional(),
  budgetRange: z.union([z.enum(advertisingBudgetRanges), z.literal("")]).optional(),
  message: z.string().trim().max(2000).optional(),
});

export type AdvertisingInquiryInput = z.input<typeof advertisingInquirySchema>;
