import { readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const files = ["app", "components", "lib", "scripts"].flatMap((root) =>
  readdirSync(root, { recursive: true })
    .filter((name) => /\.test\.(?:ts|mts|tsx)$/.test(name))
    .map((name) => join(root, name))
).sort();

const result = spawnSync(process.execPath, [
  "--experimental-test-module-mocks", "--import", "tsx", "--test",
  "--test-concurrency=4", ...files,
], { stdio: "inherit" });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
