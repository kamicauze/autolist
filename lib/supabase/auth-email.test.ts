import assert from "node:assert/strict";
import { normalizeAuthEmail } from "./auth-email";

assert.equal(normalizeAuthEmail("User@Example.COM"), "user@example.com");
assert.equal(normalizeAuthEmail(" user@example.com "), "user@example.com");
assert.equal(normalizeAuthEmail("\u00a0User@Example.COM\u00a0"), "user@example.com");
