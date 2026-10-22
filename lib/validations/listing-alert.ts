import { z } from "zod";
import {
  LISTING_ALERT_CATEGORY_CONFIG,
} from "@/lib/constants/listing-alerts";
import { LISTING_CATEGORY_OPTIONS } from "@/lib/constants/marketplace";

const CATEGORY_VALUES = LISTING_CATEGORY_OPTIONS.map(({ value }) => value) as [
  (typeof LISTING_CATEGORY_OPTIONS)[number]["value"],
  ...(typeof LISTING_CATEGORY_OPTIONS)[number]["value"][],
];
const optionalText = z
  .string()
  .trim()
  .max(100, "Keep this preference under 100 characters.")
  .optional()
  .transform((value) => value || undefined);

const optionalYear = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.coerce
    .number()
    .int()
    .min(1900, "Year must be 1900 or later.")
    .max(new Date().getFullYear() + 1, "Year is too far in the future.")
    .optional()
);

const optionalPrice = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.coerce.number().int().nonnegative("Price must be zero or more.")
    .max(Number.MAX_SAFE_INTEGER, "Price is too large.").optional()
);

export const listingAlertInputSchema = z
  .object({
    category: z.enum(CATEGORY_VALUES),
    make: optionalText,
    model: optionalText,
    location: optionalText,
    minYear: optionalYear,
    maxYear: optionalYear,
    minPrice: optionalPrice,
    maxPrice: optionalPrice,
    primaryValue: optionalText,
    secondaryValue: optionalText,
    emailEnabled: z.boolean(),
    priceDropEnabled: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.minYear && value.maxYear && value.minYear > value.maxYear) {
      ctx.addIssue({
        code: "custom",
        path: ["maxYear"],
        message: "Year To must be the same as or later than Year From.",
      });
    }

    if (value.minPrice !== undefined && value.maxPrice !== undefined && value.minPrice > value.maxPrice) {
      ctx.addIssue({
        code: "custom",
        path: ["maxPrice"],
        message: "Price To must be the same as or greater than Price From.",
      });
    }

    const fields = LISTING_ALERT_CATEGORY_CONFIG[value.category].fields;
    [value.primaryValue, value.secondaryValue].forEach((criterion, index) => {
      if (!criterion || criterion === "any") return;
      if (fields[index].options.some((option) => option.value === criterion)) return;

      ctx.addIssue({
        code: "custom",
        path: [index === 0 ? "primaryValue" : "secondaryValue"],
        message: `${fields[index].label} is not valid for this category.`,
      });
    });
  });

export type ValidatedListingAlertInput = z.infer<typeof listingAlertInputSchema>;
