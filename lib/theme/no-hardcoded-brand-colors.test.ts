import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCANNED_DIRS = ["app", "components"];
const SCANNED_EXTENSIONS = new Set([".css", ".ts", ".tsx"]);

const FORBIDDEN_BRAND_COLOR_PATTERNS = [
  /#2563eb/i,
  /#1d4ed8/i,
  /#bfdbfe/i,
  /#dbeafe/i,
  /#eff6ff/i,
  /#f6f9ff/i,
  /#f7faff/i,
  /#f8fbff/i,
  /rgba\(37,\s*99,\s*235/i,
  /\b(?:bg|text|border|from|via|to|hover:bg|hover:text|hover:border|focus:border|focus:ring|accent)-blue-(?:50|100|200|600|700|800)\b/,
];

const ALLOWED_FILES = new Set([
  "app/globals.css", // canonical CSS variable definitions for theme palettes
  "components/dashboard/wizard/step-vehicle-details.tsx", // vehicle paint option named "Blue"
]);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) return walk(path);
    if (![...SCANNED_EXTENSIONS].some((extension) => path.endsWith(extension))) return [];
    return [path];
  });
}

const violations = SCANNED_DIRS.flatMap((dir) => walk(join(ROOT, dir)))
  .map((file) => ({
    file,
    relativePath: relative(ROOT, file),
    lines: readFileSync(file, "utf8").split("\n"),
  }))
  .filter(({ relativePath }) => !ALLOWED_FILES.has(relativePath))
  .flatMap(({ relativePath, lines }) =>
    lines.flatMap((line, index) =>
      FORBIDDEN_BRAND_COLOR_PATTERNS.some((pattern) => pattern.test(line))
        ? [`${relativePath}:${index + 1}: ${line.trim()}`]
        : []
    )
  );

assert.deepEqual(
  violations,
  [],
  `Replace hard-coded brand blue with theme tokens:\n${violations.join("\n")}`
);
