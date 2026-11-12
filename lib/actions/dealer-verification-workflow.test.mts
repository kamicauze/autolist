import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import type { DealerRegistration } from "../validations/registration";

const registration = createRequire(import.meta.url)("../validations/registration.ts");

type Row = Record<string, unknown>;
type Write = { table: string; operation: string; values: Row; privileged: boolean };
type Options = {
  storedCertificateSize?: number;
  signedIn?: boolean;
  userId?: string;
  role?: string;
  profilePresent?: boolean;
  dealerPresent?: boolean;
  deactivated?: boolean;
  staff?: boolean;
  status?: string;
  queueFails?: boolean;
  workflowFails?: boolean;
  auditFails?: boolean;
  auditThrows?: boolean;
};
type ActionResult = { success?: boolean; error?: string; code?: string; warning?: string; intent?: string };
type Actions = {
  createDealerRegistration: (input: DealerRegistration) => Promise<ActionResult>;
  createDealerOnboardingUpload: (field: string, file: { name: string; type: string; size: number }) => Promise<{ error?: string; code?: string; path?: string }>;
  leaveDealerSetup: () => Promise<ActionResult>;
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
  function client(privileged: boolean) {
    return {
      async rpc(name: string, values: Row) {
        assert.equal(privileged, true);
        assert.equal(name, "save_dealer_registration");
        writes.push({ table: name, operation: "rpc", values, privileged });
        Object.assign(dealer, values.dealership);
        return { data: { id: dealer.id, name: dealer.name }, error: null };
      },
      auth: { getUser: async () => ({ data: { user: options.signedIn === false ? null : { id: userId } }, error: null }) },
      storage: { from: () => ({
        remove: async () => ({ error: null }),
        createSignedUploadUrl: async () => ({ data: { token: "sample-token" }, error: null }),
        list: async (_folder: string, { search }: { search: string }) => ({
          data: options.storedCertificateSize ? [{
            name: search, metadata: { size: options.storedCertificateSize, mimetype: "application/pdf" },
          }] : [],
          error: null,
        }),
      }) },
      from(table: string) {
        let operation = "select";
        let values: Row = {};
        const filters: Array<(row: Row) => boolean> = [];
        function execute() {
          let rows: Row[];
          if (table === "dealers") rows = options.dealerPresent === false ? [] : [dealer];
          else if (table === "profiles") rows = options.profilePresent === false ? [] : [{ id: userId, role: options.role ?? "dealer", deactivated_at: options.deactivated ? "2026-01-01" : null }];
          else if (table === "dealer_verification_workflows") {
            assert.equal(privileged, true, "private workflow reads/writes require the service client");
            rows = [workflow];
          } else if (table === "dealer_verification_documents") rows = [{ dealer_id: dealer.id, document_type: "contact_photo", r2_key: "sample-photo" }, { dealer_id: dealer.id, document_type: "incorporation_certificate", r2_key: "sample-certificate" }];
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
    "@aws-sdk/client-s3": { PutObjectCommand: class {} },
    nanoid: { nanoid: (size: number) => "a".repeat(size) },
    "next/cache": { revalidatePath() {} },
    "@/lib/validations/registration": registration,
    "@/lib/location/dealer-address": {},
    "@/lib/r2": { r2: { send: () => { throw new Error("Unexpected upload"); } } },
    "@/lib/admin/guard": { requireAdminAction: async () => options.staff ? { user: { id: "sample-staff" } } : { error: "Unauthorized" } },
    "@/lib/dealers/kyc-storage": load("../dealers/kyc-storage.ts", { "@/lib/supabase/admin": {} }),
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

test("onboarding only signs valid attachments for the signed-in applicant", async () => {
  const file = { name: "Certificate.pdf", type: "application/pdf", size: 10 * 1024 * 1024 };
  const sample = harness();
  const { path } = await sample.actions().createDealerOnboardingUpload("incorporationCertificate", file);
  assert.equal(path, "sample-owner/onboarding-incorporation_certificate/aaaaaaaaaaaaaaaaaaaa-certificate.pdf");
  assert.ok((await sample.actions().createDealerOnboardingUpload("companyLogo", file)).error);
  assert.ok((await sample.actions().createDealerOnboardingUpload("incorporationCertificate", { ...file, size: file.size + 1 })).error);
  assert.ok((await harness({ signedIn: false }).actions().createDealerOnboardingUpload("incorporationCertificate", file)).error);
});

function completedVerificationForm() {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    dealershipName: "Sample Motors", dealershipAddress: "Sample Road", county: "Nairobi",
    cityTown: "Nairobi", locationArea: "Sample Area", mobileNumber: "+254700000001",
    officialEmail: "sample@example.test", whatsappNumber: "+254700000001",
    contactFullName: "Sample Owner", contactRole: "Owner", contactMobile: "+254700000001",
    contactEmail: "sample@example.test", acceptDealerTerms: "true", acceptPrivacyPolicy: "true",
  })) form.set(key, value);
  return form;
}

test("onboarding accepts a verified 10 MB private certificate reference and rejects foreign or oversized objects", async () => {
  const form = completedVerificationForm();
  const suffix = "/onboarding-incorporation_certificate/aaaaaaaaaaaaaaaaaaaa-certificate.pdf";
  for (const [owner, size, accepted] of [
    ["sample-owner", 10 * 1024 * 1024, true],
    ["sample-owner", 10 * 1024 * 1024 + 1, false],
    ["another-owner", 10 * 1024 * 1024, false],
  ] as const) {
    const sample = harness({ storedCertificateSize: size, status: "INCOMPLETE" });
    form.set("incorporationCertificateUploadPath", owner + suffix);
    const result = await sample.actions().submitDealerVerification(form);
    if (accepted) {
      assert.equal(result.success, true, result.error);
      assert.equal(sample.dealer.doc_incorporation_key, "supabase://dealer-kyc/" + owner + suffix);
    } else {
      assert.ok(result.error);
      assert.equal(sample.writes.length, 0);
    }
  }
});

test("a certificate saved during registration satisfies deferred verification without a duplicate attachment", async () => {
  const file = { name: "Certificate.pdf", type: "application/pdf", size: 512 };
  const sample = harness({ storedCertificateSize: file.size, status: "INCOMPLETE" });
  const actions = sample.actions();
  const { path } = await actions.createDealerOnboardingUpload("incorporation_certificate", file);
  assert.ok(path);
  assert.equal(path, "sample-owner/onboarding-incorporation_certificate/aaaaaaaaaaaaaaaaaaaa-certificate.pdf");
  const result = await actions.createDealerRegistration({
    name: "Sample Motors", phone: "0700000001", address: "Sample Road", town: "Nairobi",
    county: "Nairobi", area: "", document: { type: "incorporation_certificate", name: file.name, path },
  });
  assert.equal(result.success, true, result.error);
  const registration = sample.writes[0].values;
  const key = "supabase://dealer-kyc/" + path;
  assert.equal(registration.submit_for_review, false);
  assert.equal((registration.dealership as Row).doc_incorporation_key, key);
  const [certificate] = registration.evidence as Row[];
  assert.equal(certificate.document_type, "incorporation_certificate");
  assert.equal(certificate.r2_key, key);

  const submission = await actions.submitDealerVerification(completedVerificationForm());
  assert.equal(submission.success, true, submission.error);
  const review = sample.writes[1].values;
  assert.equal(review.submit_for_review, true);
  assert.equal((review.dealership as Row).doc_incorporation_key, key);
  assert.equal((review.evidence as Row[]).length, 0);

  for (const invalidKey of [null, key.replace("sample-owner", "another-owner"), key.replace("incorporation_certificate", "cr12")]) {
    const invalid = harness({ storedCertificateSize: file.size, status: "INCOMPLETE" });
    invalid.dealer.doc_incorporation_key = invalidKey;
    assert.match((await invalid.actions().submitDealerVerification(completedVerificationForm())).error || "", /required|does not belong/i);
    assert.equal(invalid.writes.length, 0);
  }
});

test("registration saves typed evidence without submitting the dealership for review", async () => {
  const details = {
    name: "Sample Motors", phone: "0700 000 001", address: "Sample Road",
    town: "Nairobi", county: "Nairobi", area: "",
  };
  for (const type of ["cr12", "national_id", "passport"] as const) {
    const sample = harness({ role: "buyer", storedCertificateSize: 512, status: "INCOMPLETE" });
    const path = "sample-owner/onboarding-" + type + "/aaaaaaaaaaaaaaaaaaaa-sample.pdf";
    const result = await sample.actions().createDealerRegistration({
      ...details, document: { type, path, name: "Sample evidence.pdf" },
    });
    assert.equal(result.success, true, result.error);
    const save = sample.writes[0].values;
    assert.equal(save.submit_for_review, false);
    assert.equal((save.dealership as Row).mobile, "+254700000001");
    assert.equal((save.dealership as Row).email, undefined);
    const [document] = save.evidence as Row[];
    assert.equal(document.document_type, type);
    assert.equal(document.r2_key, "supabase://dealer-kyc/" + path);
  }

  const evidence = { type: "cr12" as const, name: "Sample.pdf", path: "sample-owner/onboarding-cr12/aaaaaaaaaaaaaaaaaaaa-sample.pdf" };
  for (const options of [{ role: "support" }, { deactivated: true }, { signedIn: false }]) {
    const sample = harness(options);
    assert.ok((await sample.actions().createDealerRegistration({ ...details, document: evidence })).error);
    assert.equal(sample.adminClients, 0);
  }
  const withoutDocument = harness({ role: "buyer", status: "INCOMPLETE" });
  assert.match((await withoutDocument.actions().createDealerRegistration(details as DealerRegistration)).error || "", /attach one verification document/);
  assert.equal(withoutDocument.writes.length, 0);
  const sample = harness({ storedCertificateSize: 512 });
  const invalid = await sample.actions().createDealerRegistration({
    ...details,
    document: { type: "passport", name: "Sample.pdf", path: "sample-owner/onboarding-national_id/aaaaaaaaaaaaaaaaaaaa-sample.pdf" },
  });
  assert.match(invalid.error || "", /does not belong/);
  assert.equal(sample.writes.length, 0);
});

test("incomplete dealer registrations cannot enter the review queue through document resubmission or staff review", async () => {
  const sample = harness({ status: "INCOMPLETE", staff: true });
  const actions = sample.actions();
  assert.match((await actions.resubmitDealerVerificationDocuments(new FormData())).error || "", /Complete the dealership details/);
  assert.match((await actions.approveDealer("sample-dealer")).error || "", /has not submitted/);
  assert.match((await actions.rejectDealer("sample-dealer", "Needs evidence")).error || "", /has not submitted/);
  assert.equal(sample.writes.length, 0);
});

test("an ended session returns a clear, coded message from dealer setup and verification actions", async () => {
  const sample = harness({ signedIn: false });
  const actions = sample.actions();
  for (const result of [
    await actions.createDealerRegistration({ name: "Sample Motors", phone: "0700000001", address: "Sample Road", town: "Nairobi", county: "Nairobi", area: "", document: { type: "cr12", name: "Sample.pdf", path: "sample-owner/onboarding-cr12/sample.pdf" } }),
    await actions.createDealerOnboardingUpload("incorporationCertificate", { name: "Certificate.pdf", type: "application/pdf", size: 512 }),
    await actions.submitDealerVerification(completedVerificationForm()),
    await actions.leaveDealerSetup(),
  ]) {
    assert.equal(result.error, "Your session has ended. Sign in again to continue.");
    assert.equal(result.code, "session_expired");
  }
  const resubmission = await actions.resubmitDealerVerificationDocuments(new FormData());
  assert.equal(resubmission.error, "Unauthorized");
  assert.equal(resubmission.code, "session_expired");
  assert.equal(sample.adminClients, 0);
  assert.equal(sample.writes.length, 0);
});

test("verification stores normalized phone numbers and names the field that is invalid", async () => {
  const upload = "sample-owner/onboarding-incorporation_certificate/aaaaaaaaaaaaaaaaaaaa-certificate.pdf";
  const sample = harness({ storedCertificateSize: 512, status: "INCOMPLETE" });
  const form = completedVerificationForm();
  form.set("incorporationCertificateUploadPath", upload);
  form.set("mobileNumber", "0700 000 002");
  form.set("whatsappNumber", "0711 000 003");
  form.set("contactMobile", "+254 700 000 004");
  form.set("contactWhatsapp", "0700 000 005");
  const result = await sample.actions().submitDealerVerification(form);
  assert.equal(result.success, true, result.error);
  const { dealership, profile_details: profile } = sample.writes[0].values as { dealership: Row; profile_details: Row };
  assert.equal(dealership.mobile, "+254700000002");
  assert.equal(dealership.whatsapp, "+254711000003");
  assert.equal((dealership.contact_person as Row).mobile, "+254700000004");
  assert.equal((dealership.contact_person as Row).whatsapp, "+254700000005");
  assert.equal(profile.phone, "+254700000002");
  assert.equal(profile.whatsapp, "+254711000003");

  for (const [field, message] of [
    ["mobileNumber", /dealership mobile/],
    ["whatsappNumber", /dealership WhatsApp/],
    ["contactMobile", /contact mobile/],
    ["contactWhatsapp", /contact WhatsApp/],
  ] as const) {
    const invalid = harness({ storedCertificateSize: 512, status: "INCOMPLETE" });
    const next = completedVerificationForm();
    next.set("incorporationCertificateUploadPath", upload);
    next.set(field, "07abc");
    assert.match((await invalid.actions().submitDealerVerification(next)).error || "", message);
    assert.equal(invalid.writes.length, 0);
  }
  const withoutContactWhatsapp = harness({ storedCertificateSize: 512, status: "INCOMPLETE" });
  const optional = completedVerificationForm();
  optional.set("incorporationCertificateUploadPath", upload);
  assert.equal((await withoutContactWhatsapp.actions().submitDealerVerification(optional)).success, true);
  assert.equal(((withoutContactWhatsapp.writes[0].values.dealership as Row).contact_person as Row).whatsapp, null);
});

test("leaving dealer setup returns only a dealer account without a dealership to buyer", async () => {
  const dealer = harness({ role: "dealer", dealerPresent: false });
  assert.equal((await dealer.actions().leaveDealerSetup()).success, true);
  assert.deepEqual(dealer.writes.map(({ table, operation, values, privileged }) => ({ table, operation, values, privileged })), [
    { table: "profiles", operation: "update", values: { role: "buyer" }, privileged: true },
  ]);

  const saved = harness({ role: "dealer" });
  assert.match((await saved.actions().leaveDealerSetup()).error || "", /already saved/);
  assert.equal(saved.writes.length, 0);

  for (const role of ["buyer", "seller"]) {
    const other = harness({ role, dealerPresent: false });
    assert.equal((await other.actions().leaveDealerSetup()).success, true);
    assert.equal(other.writes.length, 0);
    assert.equal(other.adminClients, 0);
  }

  for (const options of [{ role: "support" }, { deactivated: true }]) {
    const blocked = harness({ ...options, dealerPresent: false });
    assert.ok((await blocked.actions().leaveDealerSetup()).error);
    assert.equal(blocked.writes.length, 0);
    assert.equal(blocked.adminClients, 0);
  }
});
