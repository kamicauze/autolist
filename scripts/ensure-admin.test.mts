import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test } from "node:test";

const script = fileURLToPath(new URL("./ensure-admin.ts", import.meta.url));
const loader = pathToFileURL(createRequire(import.meta.url).resolve("tsx")).href;

for (const password of [undefined, "short"]) {
  test(`admin bootstrap rejects ${password ? "short" : "missing"} passwords before reaching Supabase`, () => {
    const directory = mkdtempSync(join(tmpdir(), "admin-bootstrap-preflight-"));
    try {
      // No project env files or provider credentials can reach this subprocess.
      const env: Record<string, string> = { PATH: process.env.PATH || "", NODE_ENV: "test" };
      if (password) env.SEED_ADMIN_PASSWORD = password;
      const result = spawnSync(process.execPath, ["--import", loader, script], {
        cwd: directory, env, encoding: "utf8", timeout: 15000,
      });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, password ? /at least 12 characters/ : /Provide a unique password/);
      assert.doesNotMatch(result.stderr, /Supabase service role environment variables are missing/);
      assert.equal(result.stdout, "");
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
}
