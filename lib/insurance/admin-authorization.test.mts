import assert from "node:assert/strict";
import { mock, test } from "node:test";

let guardResult = { error: "Unauthorized" };
let privilegedClients = 0;
mock.module("@/lib/admin/guard", { namedExports: { requireAdminAction: async () => guardResult } });
mock.module("@/lib/supabase/admin", { namedExports: {
  createAdminClient: () => { privilegedClients++; throw new Error("Unexpected privileged access"); },
  createOptionalAdminClient: () => { privilegedClients++; throw new Error("Unexpected privileged access"); },
} });
mock.module("@/lib/supabase/server", { namedExports: {
  createClient: async () => { throw new Error("Unexpected database access"); },
} });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });

const { getAdminInsuranceRequestsData } = await import("../data/insurance");
const { updateInsuranceRequestAdminState } = await import("../actions/insurance");

test("insurance reads and saves reject unauthorized/non-admin access before creating any privileged client", async () => {
  for (const error of ["Unauthorized", "Forbidden: Admin only."]) {
    guardResult = { error };
    assert.deepEqual((await getAdminInsuranceRequestsData()).requests, []);
    assert.deepEqual(await updateInsuranceRequestAdminState({
      requestId: "c157af29-d812-4816-9627-50d6c03e5240", status: "quoted", insurerName: "Example insurer",
      quoteAmount: "82500", adminNotes: "Private note",
    }), { error });
  }
  assert.equal(privilegedClients, 0);
});
