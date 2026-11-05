import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { profileUpdateSchema } = require("../profile/profile-update.ts") as typeof import("../profile/profile-update");
const { createOpeningHours } = require("../dealer-opening-hours.ts") as typeof import("../dealer-opening-hours");

type Row = Record<string, unknown>;
type Write = { table: string; operation: string; values: Row; privileged: boolean };
type Options = {
  signedIn?: boolean;
  allowUploads?: boolean;
  userId?: string;
  role?: string;
  profilePresent?: boolean;
  deactivated?: boolean;
  staff?: boolean;
  status?: string;
  queueFails?: boolean;
  workflowFails?: boolean;
  auditFails?: boolean;
  auditThrows?: boolean;
  noContactPhoto?: boolean;
  noCertificate?: boolean;
};
type ActionResult = { success?: boolean; error?: string; warning?: string; intent?: string };
type Actions = {
  submitDealerVerification: (form: FormData) => Promise<ActionResult>;
  resubmitDealerVerificationDocuments: (form: FormData) => Promise<ActionResult>;
  approveDealer: (dealerId: string, note?: string) => Promise<ActionResult>;
  rejectDealer: (dealerId: string, reason: string) => Promise<ActionResult>;
};
const privateFields = ["submitted_at", "reviewed_by", "reviewed_at", "review_notes", "verification_notes", "preferred_confirmation_channel"];

function load<T>(file: string, dependencies: Record<string, unknown>): T {
  const source = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(source, {
    exports: loaded.exports, module: loaded, FormData, File, Buffer,
    process: { env: { R2_BUCKET_NAME: "sample-media" } },
    console: { error() {}, warn() {} },
    require(name: string) {
      if (!(name in dependencies)) throw new Error(`Unexpected verification dependency: ${name}`);
      return dependencies[name];
    },
  });
  return loaded.exports as T;
}

function harness(options: Options = {}) {
  const userId = options.userId ?? "sample-owner";
  const writes: Write[] = [];
  const notifications: Row[] = [];
  let adminClients = 0;
  const dealer: Row = { id: "sample-dealer", profile_id: "sample-owner", status: options.status ?? "PENDING", contact_person: { photo_url: "sample-photo" }, doc_incorporation_key: "sample-certificate" };
  const workflow: Row = { dealer_id: dealer.id, submitted_at: "2026-01-01T09:00:00Z", reviewed_by: "prior-reviewer", reviewed_at: "2026-01-02T09:00:00Z", review_notes: "Prior review", verification_notes: "Prior owner notes", preferred_confirmation_channel: "email" };
  if (options.noContactPhoto) dealer.contact_person = {};
  if (options.noCertificate) dealer.doc_incorporation_key = null;
  function client(privileged: boolean) {
    return {
      auth: { getUser: async () => ({ data: { user: options.signedIn === false ? null : { id: userId } }, error: null }) },
      storage: { from: () => ({ remove: async () => ({ error: null }), upload: async () => { assert.ok(options.allowUploads, "Unexpected KYC upload"); return { error: null }; } }) },
      from(table: string) {
        let operation = "select";
        let values: Row = {};
        const filters: Array<(row: Row) => boolean> = [];
        function execute() {
          let rows: Row[];
          if (table === "dealers") rows = [dealer];
          else if (table === "profiles") rows = options.profilePresent === false ? [] : [{ id: userId, role: options.role ?? "dealer", deactivated_at: options.deactivated ? "2026-01-01" : null }];
          else if (table === "dealer_verification_workflows") {
            assert.equal(privileged, true, "private workflow reads/writes require the service client");
            rows = [workflow];
          } else if (table === "dealer_verification_documents") rows = [
            ...(!options.noContactPhoto ? [{ dealer_id: dealer.id, document_type: "contact_photo", r2_key: "sample-photo" }] : []),
            ...(!options.noCertificate ? [{ dealer_id: dealer.id, document_type: "incorporation_certificate", r2_key: "sample-certificate" }] : []),
          ];
          else if (table === "audit_logs") {
            assert.equal(privileged, true, "audit writes require the service client after authorization");
            if (options.auditThrows) throw new Error("Audit service unavailable");
            if (options.auditFails) return { data: [], error: { message: "Audit insert denied" } };
            rows = [];
          }
          else throw new Error(`Unexpected verification table: ${table}`);
          rows = rows.filter(row => filters.every(filter => filter(row)));
          if (table === "dealer_verification_workflows" && operation === "upsert" && options.workflowFails) return { data: [], error: { message: "Private workflow unavailable" } };
          if (operation !== "select" && (operation !== "update" || rows.length)) {
            if (table === "dealers") for (const key of privateFields) assert.equal(key in values, false, `${key} must never be written to public dealers`);
            writes.push({ table, operation, values: { ...values }, privileged });
            if (table === "dealers") Object.assign(dealer, values);
            if (table === "dealer_verification_workflows") Object.assign(workflow, values);
          }
          return { data: rows, error: null };
        }
        const query = {
          select() { return query; },
          eq(key: string, value: unknown) { filters.push(row => row[key] === value); return query; },
          neq(key: string, value: unknown) { filters.push(row => row[key] !== value); return query; },
          in(key: string, expected: unknown[]) { filters.push(row => expected.includes(row[key])); return query; },
          update(next: Row) { operation = "update"; values = next; return query; },
          upsert(next: Row) { operation = "upsert"; values = next; return query; },
          insert(next: Row) { operation = "insert"; values = next; return query; },
          delete() { operation = "delete"; return query; },
          maybeSingle: async () => { const result = execute(); return { ...result, data: result.data[0] ?? null }; },
          single: async () => { const result = execute(); return { ...result, data: result.data[0] ?? null }; },
          then(resolve: (result: unknown) => unknown) { return Promise.resolve(execute()).then(resolve); },
        };
        return query;
      },
    };
  }
  const dependencies: Record<string, unknown> = {
    "server-only": {},
    "@/lib/profile/profile-update": { profileUpdateSchema },
    "@/lib/constants/filters": { KENYA_COUNTIES: ["Kiambu", "Nairobi"] },
    "@/lib/location/normalize": load("../location/normalize.ts", {}),
    "@aws-sdk/client-s3": { PutObjectCommand: class {} },
    nanoid: { nanoid: () => "sample-upload" },
    "next/cache": { revalidatePath() {} },
    "@/lib/r2": { r2: { send: async () => { assert.ok(options.allowUploads, "Unexpected upload"); } } },
    "@/lib/admin/guard": { requireAdminAction: async () => options.staff ? { user: { id: "sample-staff" } } : { error: "Unauthorized" } },
    "@/lib/dealers/kyc-storage": { DEALER_KYC_BUCKET: "dealer-kyc", getDealerKycStoragePath: () => null, createDealerKycReference: (path: string) => `supabase://dealer-kyc/${path}` },
    "@/lib/data/dealer-verification-schema": load("../data/dealer-verification-schema.ts", {}),
    "@/lib/supabase/admin": { createAdminClient: () => { adminClients++; return client(true); } },
    "@/lib/supabase/server": { createClient: async () => client(false) },
    "@/lib/utils/listings": { getImageUrl: (key: string) => key },
    "@/lib/server/notifications": { emitNotificationEvent: async (event: Row) => {
      if (options.queueFails) throw new Error("Queue unavailable");
      notifications.push(event);
      return "sample-review-event";
    } },
  };
  return {
    actions: () => load<Actions>("./dealers.ts", dependencies),
    privateReads: () => load<{ getDealerVerificationWorkflows: (ids: string[]) => Promise<Map<string, Row>> }>("../data/dealer-verification-workflows.ts", dependencies),
    dealer, workflow, writes, notifications,
    get adminClients() { return adminClients; },
  };
}

test("private workflow reads reject signed-out, deactivated and unrelated accounts before creating a service client", async () => {
  for (const options of [{ signedIn: false }, { deactivated: true }, { profilePresent: false }, { userId: "another-owner" }]) {
    const sample = harness(options);
    assert.equal((await sample.privateReads().getDealerVerificationWorkflows(["sample-dealer"])).size, 0);
    assert.equal(sample.adminClients, 0);
  }
});

test("private workflow reads are scoped to an authorized owner or staff member", async () => {
  for (const options of [{}, { userId: "sample-admin", role: "admin" }, { userId: "sample-admin", role: "super_admin" }]) {
    const sample = harness(options);
    const records = await sample.privateReads().getDealerVerificationWorkflows(["sample-dealer"]);
    assert.equal(records.get("sample-dealer")?.verification_notes, "Prior owner notes");
    assert.equal(sample.adminClients, 1);
  }
  const owner = harness();
  assert.equal((await owner.privateReads().getDealerVerificationWorkflows(["another-dealer"])).size, 0);
  assert.equal(owner.adminClients, 0);
});

test("saving a notes-only verification draft preserves review status and timestamps", async () => {
  const sample = harness({ status: "REJECTED" });
  const form = new FormData();
  form.set("intent", "draft");
  form.set("verificationNotes", "Updated business name explained privately.");
  form.set("preferredConfirmationChannel", "email");
  assert.equal((await sample.actions().resubmitDealerVerificationDocuments(form)).success, true);
  assert.equal(sample.workflow.verification_notes, "Updated business name explained privately.");
  assert.equal(sample.workflow.preferred_confirmation_channel, "email");
  assert.equal(sample.workflow.submitted_at, "2026-01-01T09:00:00Z");
  assert.equal(sample.workflow.reviewed_at, "2026-01-02T09:00:00Z");
  assert.equal(sample.workflow.review_notes, "Prior review");
  assert.equal(sample.dealer.status, "REJECTED");
  assert.equal(sample.notifications.length, 0);
  const audit = sample.writes.find(write => write.table === "audit_logs");
  assert.ok(audit);
  assert.equal(audit.privileged, true);
  assert.equal(audit.values.user_id, "sample-owner");
  assert.equal(audit.values.action, "dealer_verification_documents_saved");
  assert.equal(audit.values.entity_type, "dealer");
  assert.equal(audit.values.entity_id, "sample-dealer");
  assert.equal(Array.isArray((audit.values.details as Row).document_types), true);
});

test("resubmission records its actual submission time and clears the previous review privately", async () => {
  const sample = harness({ status: "REJECTED" });
  const form = new FormData();
  form.set("intent", "submit");
  form.set("verificationNotes", "Updated evidence ready for review.");
  const before = Date.now();
  assert.equal((await sample.actions().resubmitDealerVerificationDocuments(form)).success, true);
  assert.equal(sample.dealer.status, "PENDING");
  const submittedAt = Date.parse(String(sample.workflow.submitted_at));
  assert.ok(submittedAt >= before && submittedAt <= Date.now());
  for (const key of ["reviewed_at", "reviewed_by", "review_notes"]) assert.equal(sample.workflow[key], null);
  assert.equal(sample.workflow.verification_notes, "Updated evidence ready for review.");
  assert.equal(sample.writes.find(write => write.table === "audit_logs")?.values.action, "dealer_verification_resubmitted");
});

test("approval and rejection queue one owner-addressed in-app/email event only for an actual status transition", async () => {
  for (const [method, status, href] of [["approveDealer", "APPROVED", "/dashboard"], ["rejectDealer", "REJECTED", "/dashboard/verification"]] as const) {
    const sample = harness({ staff: true });
    const review = sample.actions()[method];
    const before = Date.now();
    assert.equal((await review("sample-dealer", "Review result")).success, true);
    assert.equal(sample.dealer.status, status);
    assert.equal(sample.workflow.reviewed_by, "sample-staff");
    const reviewedAt = Date.parse(String(sample.workflow.reviewed_at));
    assert.ok(reviewedAt >= before && reviewedAt <= Date.now());
    assert.equal(sample.workflow.review_notes, "Review result");
    const audit = sample.writes.find(write => write.table === "audit_logs");
    assert.ok(audit);
    assert.equal(audit.privileged, true);
    assert.equal(audit.values.user_id, "sample-staff");
    assert.equal(audit.values.action, status === "APPROVED" ? "dealer_approved" : "dealer_rejected");
    assert.equal(audit.values.entity_type, "dealer");
    assert.equal(audit.values.entity_id, "sample-dealer");
    assert.equal((audit.values.details as Row)[status === "APPROVED" ? "note" : "reason"], "Review result");
    assert.equal(sample.notifications.length, 1);
    assert.equal(sample.writes.filter(write => write.table === "audit_logs").length, 1);
    const event = sample.notifications[0];
    assert.equal(event.eventType, "dealer_verification_status_changed");
    const deliveries = event.deliveries as Row[];
    assert.equal(deliveries.length, 2);
    assert.equal(deliveries.map(row => row.channel).sort().join(","), "email,in_app");
    for (const delivery of deliveries) {
      assert.equal(delivery.recipientId, "sample-owner");
      assert.equal(delivery.href, href);
    }
    assert.equal((await review("sample-dealer", "Repeated review")).success, true);
    assert.equal(sample.notifications.length, 1);
  }
});

test("a failed review notification reports that the review was saved without claiming delivery", async () => {
  const sample = harness({ staff: true, queueFails: true });
  const result = await sample.actions().approveDealer("sample-dealer");
  assert.equal(result.success, true);
  assert.match(String(result.warning), /notification|email/i);
  assert.equal(sample.dealer.status, "APPROVED");
});

test("a failed private review write warns accurately while retaining the saved status and queued notification", async () => {
  const sample = harness({ staff: true, workflowFails: true });
  const result = await sample.actions().rejectDealer("sample-dealer", "Updated evidence needed");
  assert.equal(result.success, true);
  assert.match(String(result.warning), /private|notes|timeline/i);
  assert.equal(sample.dealer.status, "REJECTED");
  assert.equal(sample.notifications.length, 1);
});

test("unauthorized staff review attempts perform no privileged write or notification", async () => {
  const sample = harness();
  for (const result of [await sample.actions().approveDealer("sample-dealer"), await sample.actions().rejectDealer("sample-dealer", "No review access")]) assert.equal(result.error, "Unauthorized");
  assert.equal(sample.adminClients, 0);
  assert.equal(sample.writes.length, 0);
  assert.equal(sample.notifications.length, 0);
});

test("signed-out and unrelated dealer submissions cannot create an audit record", async () => {
  for (const options of [{ signedIn: false }, { userId: "another-owner" }]) {
    const sample = harness(options);
    const form = new FormData();
    form.set("intent", "draft");
    form.set("verificationNotes", "Unrelated request");
    assert.ok((await sample.actions().resubmitDealerVerificationDocuments(form)).error);
    assert.equal(sample.writes.length, 0);
  }
});

test("audit insertion errors and exceptions warn without failing an already saved review", async () => {
  for (const options of [{ auditFails: true }, { auditThrows: true }, { auditFails: true, queueFails: true }]) {
    const sample = harness({ staff: true, ...options });
    const result = await sample.actions().approveDealer("sample-dealer", "Review completed");
    assert.equal(result.success, true);
    assert.equal(result.error, undefined);
    assert.match(String(result.warning), /saved.*audit log/i);
    assert.equal(sample.dealer.status, "APPROVED");
    assert.equal(sample.workflow.review_notes, "Review completed");
    assert.equal(sample.writes.filter(write => write.table === "audit_logs").length, 0);
    assert.equal(sample.notifications.length, options.queueFails ? 0 : 1);
    if (options.queueFails) assert.match(String(result.warning), /email notification/i);
  }
});

test("dealer resubmission permits no contact photo but still requires incorporation evidence", async () => {
  for (const noCertificate of [false, true]) {
    const sample = harness({ status: "REJECTED", noContactPhoto: true, noCertificate });
    const form = new FormData();
    form.set("intent", "submit");
    const result = await sample.actions().resubmitDealerVerificationDocuments(form);
    if (noCertificate) {
      assert.match(String(result.error), /Certificate of incorporation is required/);
      assert.equal(sample.writes.length, 0);
    } else {
      assert.equal(result.success, true);
    }
  }
});

for (const includePhoto of [false, true]) {
test(`onboarding saves locations and long About with contact photo ${includePhoto ? "provided" : "omitted"}`, async () => {
  const sample = harness({ allowUploads: true });
  const form = new FormData();
  for (const [key, value] of Object.entries({
    dealershipName: "Sample Motors", dealershipAddress: "  plot 12B   near ABC HQ ",
    county: "Kiambu", cityTown: "  custom   town ", locationArea: "  market   area ",
    mobileNumber: "+254700000001", officialEmail: "sample@example.test", whatsappNumber: "+254700000001",
    contactFullName: "Sample Owner", contactRole: "Owner", contactMobile: "+254700000001", contactEmail: "sample@example.test",
    acceptDealerTerms: "true", acceptPrivacyPolicy: "true",
  })) form.set(key, value);
  form.set("aboutDealership", "a".repeat(3001));
  const hours = createOpeningHours();
  hours.week.Monday = { closed: false, opens: "09:00", closes: "18:00" };
  if (includePhoto) {
    form.set("openingHours", JSON.stringify(hours));
    form.set("companyLogo", new File(["sample"], "dealership.jpg", { type: "image/jpeg" }));
  }
  if (includePhoto) form.set("contactPhoto", new File(["sample"], "contact.jpg", { type: "image/jpeg" }));
  form.set("incorporationCertificate", new File(["sample"], "certificate.pdf", { type: "application/pdf" }));
  assert.equal((await sample.actions().submitDealerVerification(form)).success, true);
  const dealer = sample.writes.find((write) => write.table === "dealers")!.values;
  assert.equal(dealer.county, "Kiambu");
  assert.equal(dealer.city, "Custom Town");
  assert.equal(dealer.location, "Market Area");
  assert.equal(dealer.address, "Plot 12B Near ABC HQ");
  assert.equal(dealer.about_text, "a".repeat(3001));
  assert.equal(Boolean(dealer.logo_url), includePhoto);
  assert.equal((dealer.social_links as Row | null)?.opening_hours, includePhoto ? JSON.stringify(hours) : undefined);
  assert.equal(dealer.status, "PENDING");
  assert.equal(Boolean((dealer.contact_person as Row).photo_url), includePhoto);
  const profile = sample.writes.find((write) => write.table === "profiles")!.values;
  assert.equal(profile.city, "Custom Town");
  assert.equal(profile.address, "Plot 12B Near ABC HQ");
});
}


test("invalid onboarding hours are rejected before uploads or writes", async () => {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    dealershipName: "Sample Motors", dealershipAddress: "Sample Road", county: "Nairobi", cityTown: "Nairobi", locationArea: "Sample Area",
    mobileNumber: "+254700000001", officialEmail: "sample@example.test", whatsappNumber: "+254700000001",
    contactFullName: "Sample Owner", contactRole: "Owner", contactMobile: "+254700000001", contactEmail: "sample@example.test",
    acceptDealerTerms: "true", acceptPrivacyPolicy: "true",
  })) form.set(key, value);
  const hours = createOpeningHours();
  hours.week.Monday = { closed: false, opens: "18:00", closes: "09:00" };
  for (const value of [JSON.stringify(hours), "{".repeat(10001)]) {
    const sample = harness();
    form.set("openingHours", value);
    assert.ok((await sample.actions().submitDealerVerification(form)).error);
    assert.equal(sample.writes.length, 0);
  }
});
