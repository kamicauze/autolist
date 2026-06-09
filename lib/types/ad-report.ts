export const AD_REPORT_REASONS = [
  { value: "sold", label: "Sold" },
  { value: "suspected_fraud_or_scam", label: "Suspected fraud or scam" },
  { value: "incorrect_or_misleading", label: "Incorrect or misleading advert" },
  { value: "incorrect_model_badge", label: "Incorrect vehicle model/badge" },
  { value: "incorrect_price", label: "Incorrect/inconsistent pricing" },
  { value: "incorrect_year", label: "Incorrect year" },
  { value: "incorrect_transmission_mileage_location", label: "Incorrect transmission, mileage, or location" },
  { value: "vehicle_written_off", label: "Vehicle written off" },
  { value: "duplicate_advertisement", label: "Duplication of advertisement" },
  { value: "no_response_from_seller", label: "No response from seller" },
  { value: "invalid_contact_number", label: "Invalid contact number" },
  { value: "incorrect_blur_no_images", label: "Incorrect, blurred, or no images" },
  { value: "watermark_or_external_url", label: "Watermark/URL of another website" },
  { value: "irrelevant_services", label: "Other irrelevant services offered" },
] as const;

export type AdReportReason = (typeof AD_REPORT_REASONS)[number]["value"];
export type AdReportTargetType = "listing" | "dealer";
export type AdReportStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type AdReportPriority = "low" | "medium" | "high" | "urgent";

export function getAdReportReasonLabel(reason: string) {
  return AD_REPORT_REASONS.find((option) => option.value === reason)?.label || reason;
}

export function getAdReportPriority(reason: string): AdReportPriority {
  if (reason === "suspected_fraud_or_scam") return "urgent";
  if (
    reason === "invalid_contact_number" ||
    reason === "vehicle_written_off" ||
    reason === "watermark_or_external_url"
  ) {
    return "high";
  }
  if (reason === "sold" || reason === "no_response_from_seller") return "medium";
  return "low";
}
