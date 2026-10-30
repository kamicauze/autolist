import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The security upgrade adds React Compiler migration diagnostics. Keep them
    // visible without requiring unrelated component rewrites in this release.
    // Existing Rules of Hooks and dependency checks retain their default levels.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-dev/**",
    ".claude/**",
    ".playwright-cli/**",
    "out/**",
    "output/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
