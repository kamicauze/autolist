import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

type Element = { type: unknown; props: Record<string, unknown> };
type Account = {
  path: string;
  role?: string;
  status?: "PENDING" | "REJECTED" | "APPROVED";
  signedIn?: boolean;
  deactivatedAt?: string | null;
};

function compile(sourceUrl: URL) {
  return ts.transpileModule(readFileSync(sourceUrl, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
}

const layoutSource = compile(new URL("./layout.tsx", import.meta.url));
const routingModule = { exports: {} };
vm.runInNewContext(compile(new URL("../../lib/supabase/auth-routing.ts", import.meta.url)), {
  exports: routingModule.exports,
  module: routingModule,
});

class Redirect extends Error {
  destination: string;
  constructor(destination: string) {
    super(`Redirect to ${destination}`);
    this.destination = destination;
  }
}

async function renderLayout({ path, role = "dealer", status = "PENDING", signedIn = true, deactivatedAt = null }: Account) {
  const client = {
    auth: { getUser: async () => ({ data: { user: signedIn ? { id: "sample-owner", user_metadata: {} } : null } }) },
    from(table: string) {
      const query = {
        select() { return query; },
        eq() { return query; },
        maybeSingle: async () => ({ data: table === "profiles" ? { role, deactivated_at: deactivatedAt } : { status } }),
      };
      return query;
    },
  };
  const dependencies: Record<string, unknown> = {
    "next/link": "navigation-link",
    "@/components/layout/header": { Header: "site-header" },
    "@/components/layout/footer": { Footer: "site-footer" },
    "next/headers": { headers: async () => new Headers({ "x-autolist-pathname": path }) },
    "next/navigation": { redirect: (destination: string) => { throw new Redirect(destination); } },
    "@/lib/supabase/server": { createClient: async () => client },
    "@/lib/supabase/auth-routing": routingModule.exports,
    "@/components/dashboard/dashboard-layout": { DashboardLayout: "dashboard-frame" },
    "@/lib/data/dashboard-account": { getDashboardAccountContext: async () => ({ kind: role === "dealer" ? "dealer" : "seller" }) },
    "@/lib/data/membership": { getSellerPackageAccessForUser: async () => ({ access: null }) },
    "@/lib/data/sales-agent-permissions": { getSalesAgentViewerContext: async () => null },
    "react/jsx-runtime": { jsxs: (type: unknown, props: Element["props"]) => ({ type, props }), jsx: (type: unknown, props: Element["props"]) => ({ type, props }) },
  };
  const layoutModule = { exports: {} as { default: (props: { children: string }) => Promise<Element> } };
  vm.runInNewContext(layoutSource, {
    exports: layoutModule.exports,
    module: layoutModule,
    require(name: string) {
      if (!(name in dependencies)) throw new Error(`Unexpected layout dependency: ${name}`);
      return dependencies[name];
    },
  });
  return layoutModule.exports.default({ children: "sample-content" });
}

async function expectRedirect(account: Account, destination: string) {
  await assert.rejects(renderLayout(account), (error: unknown) => error instanceof Redirect && error.destination === destination);
}

test("pending and rejected dealers can render their verification page without redirecting to itself", async () => {
  for (const status of ["PENDING", "REJECTED"] as const) {
    for (const path of ["/dashboard/verification", "/dashboard/verification?source=login"]) {
      const element = await renderLayout({ path, status });
      assert.equal(element.type, "dashboard-frame");
      assert.equal(element.props.accountKind, "dealer");
      assert.equal(element.props.children, "sample-content");
    }
  }
});

test("unapproved dealers remain redirected away from listing tools and verification lookalike routes", async () => {
  for (const status of ["PENDING", "REJECTED"] as const) {
    for (const path of ["/dashboard", "/dashboard/listings/new", "/dashboard/profile", "/dashboard/verification/history", "/dashboard/verification-copy"]) {
      await expectRedirect({ path, status }, "/dashboard/verification");
    }
  }
});

test("verification access preserves approved dealer, authentication, deactivation and buyer routing", async () => {
  assert.equal((await renderLayout({ path: "/dashboard/listings/new", status: "APPROVED" })).type, "dashboard-frame");
  await expectRedirect({ path: "/dashboard/verification", signedIn: false }, "/login?next=%2Fdashboard%2Fverification");
  await expectRedirect({ path: "/dashboard/verification", deactivatedAt: "2026-01-01" }, "/account-deactivated");
  await expectRedirect({ path: "/dashboard/verification", role: "buyer" }, "/");
  await expectRedirect({ path: "/dashboard/listings/new", role: "buyer" }, "/register/onboarding?role=seller&next=%2Fdashboard%2Flistings%2Fnew");
  await expectRedirect({ path: "/dashboard/listings/new", role: "buyer", deactivatedAt: "2026-01-01" }, "/account-deactivated");
  for (const path of ["/dashboard", "/dashboard/profile", "/dashboard/favorites"]) {
    assert.equal((await renderLayout({ path, role: "buyer" })).type, "div");
  }
  await expectRedirect({ path: "/dashboard/verification", role: "admin" }, "/admin/dashboard");
});
