import assert from "node:assert/strict";
import { mock, test } from "node:test";
const { formatImportBudget, importInquirySchema } = await import("./validation");

const input = {
  category: "motorbike" as const, make: "Honda", model: "Africa Twin", yearFrom: "2020", yearTo: "2026",
  engineSize: "1100", fuelType: "Petrol" as const, color: "Blue" as const, budgetFrom: "1,000,000", budgetTo: "2,000,000",
  firstName: "Import Sample", email: "import-sample@autolist.test", phone: "+254700000000", notes: "Blue preferred",
};
const inserts: Record<string, unknown>[] = [];
const emails: Array<Record<string, unknown>> = [];
let failEmail = false;
mock.module("@/lib/server/delivery-providers", { namedExports: { sendProviderEmail: async (input: Record<string, unknown>) => { emails.push(input); if (failEmail) throw Error("Provider unavailable"); return { success: true }; } } });
const invalidations: string[] = [];
let failInsert = false;
let signedIn = true;
mock.module("next/cache", { namedExports: { revalidatePath: (path: string) => invalidations.push(path) } });
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: signedIn ? { id: "import-requester" } : null } }) } }) } });
mock.module("@/lib/supabase/admin", { namedExports: { createAdminClient: () => ({
  from(table: string) {
    const chain = {
      select() { return chain; }, in() { return chain; }, order() { return chain; }, limit() { return chain; },
      insert(value: Record<string, unknown>) { assert.equal(table, "support_tickets"); inserts.push(value); return chain; },
      maybeSingle: async () => ({ data: { id: "import-staff" }, error: null }),
      single: async () => ({ data: failInsert ? null : { id: "import-ticket" }, error: failInsert ? { message: "Unavailable" } : null }),
    };
    return chain;
  },
}) } });
const { submitImportInquiry } = await import("../actions/import-inquiry");

test("import budgets, older years, and both range validations share server/client rules", () => {
  assert.equal(formatImportBudget("10000000"), "10,000,000");
  assert.equal(formatImportBudget(""), "");
  assert.equal(importInquirySchema.parse(input).budgetFrom, 1000000);
  assert.equal(importInquirySchema.safeParse({ ...input, fuelType: "Steam" }).success, false);
  assert.equal(importInquirySchema.safeParse({ ...input, fuelType: "" }).success, true);
  assert.equal(importInquirySchema.safeParse({ ...input, fuelType: undefined }).success, true);
  assert.equal(importInquirySchema.safeParse({ ...input, yearFrom: "2026", yearTo: "2020" }).success, false);
  assert.equal(importInquirySchema.safeParse({ ...input, yearFrom: "1989", yearTo: "1989" }).success, true);
  assert.equal(importInquirySchema.safeParse({ ...input, budgetFrom: "3,000,000" }).success, false);
  assert.equal(importInquirySchema.safeParse({ ...input, phone: "" }).success, false);
});

test("submission persists actual requirements with import-only category; failures never claim success", async () => {
  assert.equal((await submitImportInquiry({ ...input, yearFrom: "2026", yearTo: "2020" })).success, false);
  assert.equal(inserts.length, 0);
  assert.equal((await submitImportInquiry(input)).success, true);
  assert.equal(inserts[0].created_by, "import-requester");
  assert.equal(inserts[0].category, "import_inquiry");
  assert.match(String(inserts[0].customer_summary), /Category: Motorbike/);
  assert.match(String(inserts[0].customer_summary), /Fuel type: Petrol/);
  assert.match(String(inserts[0].customer_summary), /Budget: KES 1,000,000 - 2,000,000/);
  assert.match(String(inserts[0].customer_summary), /Email: import-sample@autolist.test/);
  signedIn = false;
  assert.equal((await submitImportInquiry(input)).success, true);
  assert.equal(inserts[1].created_by, "import-staff");
  assert.deepEqual(invalidations, ["/admin/car-inquiries", "/admin/car-inquiries"]);
  assert.equal((await submitImportInquiry({ ...input, color: "" })).success, true);
  assert.match(String(inserts[2].customer_summary), /Colour: Not specified/);
  assert.equal((await submitImportInquiry({ ...input, color: ["Blue", "White"] })).success, true);
  assert.match(String(inserts[3].customer_summary), /Colour: Blue, White/);
  assert.deepEqual(importInquirySchema.parse({ ...input, color: ["Blue", "White", "Blue"] }).color, ["Blue", "White"]);
  assert.equal(importInquirySchema.safeParse({ ...input, color: ["Invisible"] }).success, false);
  failInsert = true;
  assert.equal((await submitImportInquiry(input)).success, false);
});


test("import notification is production opt-in, follows ticket persistence, and never loses saved inquiries", async () => {
  failInsert = false;
  const previousEnvironment = process.env.VERCEL_ENV;
  const previousRecipient = process.env.IMPORT_INQUIRY_EMAIL_TO;
  try {
    process.env.IMPORT_INQUIRY_EMAIL_TO = "import-operations@example.test";
    process.env.VERCEL_ENV = "preview";
    await submitImportInquiry(input);
    assert.equal(emails.length, 0);
    process.env.VERCEL_ENV = "production";
    delete process.env.IMPORT_INQUIRY_EMAIL_TO;
    await submitImportInquiry(input);
    assert.equal(emails.length, 0);
    process.env.IMPORT_INQUIRY_EMAIL_TO = "import-operations@example.test";
    failInsert = true;
    await submitImportInquiry(input);
    assert.equal(emails.length, 0);
    failInsert = false;
    assert.equal((await submitImportInquiry(input)).success, true);
    assert.equal(emails.length, 1);
    assert.equal(emails[0].to, "import-operations@example.test");
    assert.match(String(emails[0].text), /Fuel type: Petrol/);
    assert.match(String(emails[0].text), /Email: import-sample@autolist.test/);
    failEmail = true;
    assert.equal((await submitImportInquiry(input)).success, true);
  } finally {
    if (previousEnvironment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousEnvironment;
    if (previousRecipient === undefined) delete process.env.IMPORT_INQUIRY_EMAIL_TO;
    else process.env.IMPORT_INQUIRY_EMAIL_TO = previousRecipient;
  }
});
