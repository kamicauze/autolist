import { z } from "zod";
import {
  LISTING_ALERT_CATEGORY_CONFIG,
  LISTING_ALERT_PRICE_OPTIONS,
} from "@/lib/constants/listing-alerts";
import { LISTING_CATEGORY_OPTIONS } from "@/lib/constants/marketplace";

const CATEGORY_VALUES = LISTING_CATEGORY_OPTIONS.map(({ value }) => value) as [
  (typeof LISTING_CATEGORY_OPTIONS)[number]["value"],
  ...(typeof LISTING_CATEGORY_OPTIONS)[number]["value"][],
];
const PRICE_RANGE_VALUES = LISTING_ALERT_PRICE_OPTIONS.map(({ value }) => value) as [
  (typeof LISTING_ALERT_PRICE_OPTIONS)[number]["value"],
  ...(typeof LISTING_ALERT_PRICE_OPTIONS)[number]["value"][],
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

export const listingAlertInputSchema = z
  .object({
    category: z.enum(CATEGORY_VALUES),
    make: optionalText,
    model: optionalText,
    location: optionalText,
    minYear: optionalYear,
    maxYear: optionalYear,
    priceRange: z.enum(PRICE_RANGE_VALUES),
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
