import { z } from "zod";
import { COLORS } from "@/lib/constants/filters";

const year = z.string().refine(
  (value) => /^(1989|199\d|20\d\d)$/.test(value) && Number(value) <= new Date().getFullYear(),
  "Select a valid year."
);
const budget = z.string().regex(/^\d[\d,]*$/, "Enter a valid budget.")
  .transform((value) => Number(value.replace(/,/g, "")))
  .refine((value) => Number.isSafeInteger(value) && value > 0, "Enter a valid budget.");

export const importInquirySchema = z.object({
  category: z.enum(["car", "van", "motorbike", "truck", "plant_construction", "farm_agricultural"]),
  make: z.string().trim().min(1, "Select a make.").max(100),
  model: z.string().trim().min(1, "Enter a model.").max(100),
  yearFrom: year,
  yearTo: year,
  engineSize: z.string().trim().max(100),
  color: z.enum(COLORS),
  budgetFrom: budget,
  budgetTo: budget,
  firstName: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(160),
  phone: z.string().trim().min(7, "Enter your phone number.").max(40),
  notes: z.string().trim().max(2000),
}).superRefine((value, context) => {
  if (Number(value.yearFrom) > Number(value.yearTo)) {
    context.addIssue({ code: "custom", path: ["yearTo"], message: "Year To must be the same as or later than Year From." });
  }
  if (value.budgetFrom > value.budgetTo) {
    context.addIssue({ code: "custom", path: ["budgetTo"], message: "Budget To must be the same as or greater than Budget From." });
  }
});

export type ImportInquiryInput = z.input<typeof importInquirySchema>;

export function formatImportBudget(value: string) {
  return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function importYearLabel(value: string) {
  return value === "1989" ? "Older than 1990" : value;
}
