import assert from "node:assert/strict";
import { after, beforeEach, mock, test } from "node:test";

const keys = ["VERCEL_ENV", "QA_TOOLS_ENABLED", "QA_TOOLS_SECRET"] as const;
const environment = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
let clientCalls = 0;
mock.module("@/lib/supabase/admin", { namedExports: {
  createAdminClient: () => { clientCalls += 1; throw new Error("Account writes are forbidden in this test"); },
} });
const { POST } = await import("./route");

beforeEach(() => {
  process.env.VERCEL_ENV = "production";
  process.env.QA_TOOLS_ENABLED = "true";
  process.env.QA_TOOLS_SECRET = "sample_qa_secret";
  clientCalls = 0;
});
after(() => {
  for (const key of keys) {
    if (environment[key] === undefined) delete process.env[key];
    else process.env[key] = environment[key];
  }
});

test("production rejects QA account tools even with the enable flag and correct secret", async () => {
  const response = await POST(new Request("https://example.test/api/qa/users", {
    method: "POST", headers: { authorization: "Bearer sample_qa_secret" }, body: "invalid JSON",
  }));
  assert.equal(response.status, 404);
  assert.equal(clientCalls, 0);
});

test("preview still requires both the enable flag and the secret", async () => {
  process.env.VERCEL_ENV = "preview";
  let response = await POST(new Request("https://example.test/api/qa/users", { method: "POST" }));
  assert.equal(response.status, 401);
  process.env.QA_TOOLS_ENABLED = "false";
  response = await POST(new Request("https://example.test/api/qa/users", {
    method: "POST", headers: { authorization: "Bearer sample_qa_secret" },
  }));
  assert.equal(response.status, 404);
  assert.equal(clientCalls, 0);
});
