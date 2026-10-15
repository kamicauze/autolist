import assert from "node:assert/strict";
import { mock, test } from "node:test";
const { formatImportBudget, importInquirySchema } = await import("./validation");

const input = {
  category: "motorbike" as const, make: "Honda", model: "Africa Twin", yearFrom: "2020", yearTo: "2026",
  engineSize: "1100", color: "Blue" as const, budgetFrom: "1,000,000", budgetTo: "2,000,000",
  firstName: "Import Sample", email: "import-sample@autolist.test", phone: "+254700000000", notes: "Blue preferred",
};
const inserts: Record<string, unknown>[] = [];
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
  assert.match(String(inserts[0].customer_summary), /Budget: KES 1,000,000 - 2,000,000/);
  assert.match(String(inserts[0].customer_summary), /Email: import-sample@autolist.test/);
  signedIn = false;
  assert.equal((await submitImportInquiry(input)).success, true);
  assert.equal(inserts[1].created_by, "import-staff");
  assert.deepEqual(invalidations, ["/admin/car-inquiries", "/admin/car-inquiries"]);
  failInsert = true;
  assert.equal((await submitImportInquiry(input)).success, false);
});
