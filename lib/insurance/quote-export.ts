import type { AdminInsuranceRequestItem } from "@/lib/data/insurance";

// Export only customer/quote fields. Operational notes and linked account data stay private.
type InsuranceQuoteExportItem = Pick<AdminInsuranceRequestItem,
  "reference" | "requesterName" | "requesterEmail" | "requesterPhone" |
  "vehicleMakeModel" | "vehicleYear" | "coverType" | "preferredStartDate" |
  "status" | "insurerName" | "quoteAmount" | "quoteCurrency" | "createdAt"
>;

function csvCell(value: string | number | null) {
  let text = String(value ?? "");
  // Spreadsheets interpret these prefixes as formulas, including after whitespace.
  if (/^[\s\uFEFF]*[=+@-]/u.test(text) || /^[\t\r\n]/u.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildInsuranceQuotesCsv(requests: readonly InsuranceQuoteExportItem[]) {
  const rows: Array<Array<string | number | null>> = [[
    "Reference", "Customer name", "Customer email", "Customer phone", "Vehicle", "Year",
    "Cover type", "Requested start date", "Status", "Insurer", "Quote amount", "Currency", "Submitted at",
  ]];
  for (const request of requests) {
    rows.push([
      request.reference, request.requesterName, request.requesterEmail, request.requesterPhone,
      request.vehicleMakeModel, request.vehicleYear, request.coverType, request.preferredStartDate,
      request.status, request.insurerName, request.quoteAmount, request.quoteCurrency, request.createdAt,
    ]);
  }
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}

export function insuranceCustomerEmailLink(email: string, reference: string) {
  // Encode the address and subject separately so stored data cannot inject mail headers.
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Insurance quote ${reference}`)}`;
}
