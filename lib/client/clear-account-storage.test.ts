import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { clearAccountStorage } from "./clear-account-storage";

function createStorage(entries: Record<string, string>) {
  const values = new Map(Object.entries(entries));
  return {
    values,
    get length() {
      return values.size;
    },
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}

test("removes every listing draft key and keeps unrelated storage", () => {
  const storage = createStorage({
    autolist_listing_draft: "{}",
    "autolist_listing_draft:new:user-a": "{}",
    "autolist_listing_draft:listing-1": "{}",
    autolist_compare: "[]",
    theme: "dark",
  });

  clearAccountStorage(storage);

  assert.deepEqual(Array.from(storage.values.keys()).sort(), ["autolist_compare", "theme"]);
});

test("storage failures never block signing out", () => {
  const storage = {
    get length(): number {
      throw new Error("blocked");
    },
    key: () => null,
    removeItem: () => undefined,
  };

  assert.doesNotThrow(() => clearAccountStorage(storage));
  assert.doesNotThrow(() => clearAccountStorage());
});

test("every client sign-out path clears listing drafts before signing out", () => {
  for (const path of [
    "components/layout/header.tsx",
    "components/dashboard/sidebar.tsx",
    "components/admin/admin-shell.tsx",
    "app/account-deactivated/page.tsx",
  ]) {
    const source = readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
    assert.match(
      source,
      /import \{ clearAccountStorage \} from "@\/lib\/client\/clear-account-storage";/,
      path
    );
    assert.match(source, /clearAccountStorage\(\);\s*(?:const \{ error \} = |void )?(?:await )?supabase\.auth\.signOut\(\)/, path);
  }
});
