import assert from "node:assert/strict";
import { test } from "node:test";
import { buildInsuranceQuotesCsv, insuranceCustomerEmailLink } from "./quote-export";

const request = {
  reference: "INS-20261015-12345678",
  requesterName: 'Wanjikũ, "Customer"',
  requesterEmail: "customer@example.test",
  requesterPhone: "+254 712345678",
  vehicleMakeModel: "Toyota\nCorolla",
  vehicleYear: 2020,
  coverType: "comprehensive" as const,
  preferredStartDate: "2026-10-20",
  status: "quoted" as const,
  insurerName: "Example insurer",
  quoteAmount: 82500,
  quoteCurrency: "KES",
  createdAt: "2026-10-15T12:00:00.000Z",
  adminNotes: "Private operational note",
  requesterAccountEmail: "private-account@example.test",
  requesterProfileId: "private-profile",
};

test("CSV preserves UTF-8, quotes commas/newlines and exports only selected customer quote fields", () => {
  const csv = buildInsuranceQuotesCsv([request]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.endsWith("\r\n"));
  assert.ok(csv.includes('"Wanjikũ, ""Customer"""'));
  assert.ok(csv.includes('"Toyota\nCorolla"'));
  assert.ok(csv.includes('"82500","KES"'));
  assert.ok(csv.includes('"\'+254 712345678"'));
  assert.doesNotMatch(csv, /Private operational note|private-account|private-profile/);
  assert.equal(buildInsuranceQuotesCsv([]).split("\r\n").length, 2);
  assert.equal(buildInsuranceQuotesCsv([{ ...request, quoteAmount: null, insurerName: null }]).includes('"quoted","","","KES"'), true);
});

test("CSV neutralizes spreadsheet formulas, including whitespace prefixes", () => {
  for (const name of ["=SUM(1,2)", "+cmd", "-cmd", "@SUM(1)", "   =SUM(1)", "\t=SUM(1)", "\r=SUM(1)", "\n=SUM(1)", "\uFEFF=SUM(1)"]) {
    const csv = buildInsuranceQuotesCsv([{ ...request, requesterName: name }]);
    assert.ok(csv.includes(`"'${name}"`), `Unsafe CSV prefix: ${JSON.stringify(name)}`);
  }
});

test("customer email links cannot introduce another recipient or mail header", () => {
  assert.equal(insuranceCustomerEmailLink("customer@example.test", "INS-123"), "mailto:customer%40example.test?subject=Insurance%20quote%20INS-123");
  const link = insuranceCustomerEmailLink("customer@example.test?bcc=another@example.test", "INS-123\r\nBcc: another@example.test");
  assert.equal((link.match(/\?/g) || []).length, 1);
  assert.equal((link.match(/&/g) || []).length, 0);
  assert.doesNotMatch(link, /[\r\n]/);
});
