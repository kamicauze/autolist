import assert from "node:assert/strict";
import { resolveDealerRegistrationPath } from "./auth-routing";

assert.equal(resolveDealerRegistrationPath(null), null);
assert.equal(resolveDealerRegistrationPath("PENDING"), "/dashboard/verification");
assert.equal(resolveDealerRegistrationPath("REJECTED"), "/dashboard/verification");
assert.equal(resolveDealerRegistrationPath("APPROVED"), "/dashboard");
