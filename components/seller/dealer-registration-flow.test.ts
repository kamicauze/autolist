import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const flow = readFileSync(path.join(process.cwd(), "components/seller/dealer-registration-flow.tsx"), "utf8");
const page = readFileSync(path.join(process.cwd(), "app/register/dealer/page.tsx"), "utf8");

function loadFileProblem() {
  const source = flow.slice(flow.indexOf("function fileProblem"), flow.indexOf("function FieldError"));
  const run = new Function("acceptedFiles", "maxFileBytes", ts.transpile(source) + "\nreturn fileProblem;");
  return run("application/pdf,image/jpeg,image/png", 10 * 1024 * 1024) as (file: { name: string; type: string; size: number }) => string;
}

test("an ended session keeps the form and offers sign-in in a new tab", () => {
  assert.match(flow, /setSessionEnded\(result\.code === "session_expired"\)/);
  assert.match(flow, /<Link href="\/login\?next=\/register\/dealer" target="_blank" rel="noopener noreferrer"/);
  assert.match(flow, /\(opens in a new tab\), then come back here and press Create dealer account again\. Your details are kept\./);
});

test("validation marks each field and links it to its own message", () => {
  for (const field of ["name", "phone", "search", "address", "town", "county"]) {
    assert.match(flow, new RegExp(`aria-invalid=\\{Boolean\\(shown\\.${field}\\) \\|\\| undefined\\}`), field);
    assert.match(flow, new RegExp(`aria-describedby=\\{shown\\.${field} \\? "dealership-${field}-error" : undefined\\}`), field);
    assert.match(flow, new RegExp(`<FieldError id="dealership-${field}-error" message=\\{shown\\.${field}\\} />`), field);
  }
  assert.match(flow, /aria-invalid=\{Boolean\(shown\.document\) \|\| undefined\}/);
  assert.match(flow, /"dealer-verification-file-help dealership-document-error"/);
  assert.match(flow, /<p id="dealership-document-error" role="alert"/);
  assert.match(flow, /title="Verification document" required \/>/);
  assert.match(flow, /!documentType \? "Select a document type, then choose the file\." : !file \? "Choose the file to upload\."/);
  assert.equal((flow.match(/aria-invalid=\{typeMissing \|\| undefined\}/g) ?? []).length, 2);
  assert.match(flow, /"Fix the highlighted fields\."/);
  assert.match(flow, /fieldMessage\(dealerRegistrationSchema\.shape\.name, name, "Enter the dealership name\."\)/);
  assert.match(flow, /fieldMessage\(dealerRegistrationSchema\.shape\.phone, phone, "Enter a valid listing phone number\."\)/);
  assert.doesNotMatch(flow, /listingPhoneSchema/);
});

test("address search keeps manual entries and explains short queries", () => {
  assert.match(flow, /setSearchError\("Type at least 3 characters to search\."\)/);
  assert.match(flow, /onClick=\{\(\) => setManual\(false\)\}>\s*<Search aria-hidden className="size-4" \/> Search for an address/);
  assert.doesNotMatch(flow, /setManual\(false\); setLocation\(emptyAddress\); \}\}>\s*<Search[^>]*\/> Search for an address/);
});

test("rejected verification files explain what to do next", () => {
  const fileProblem = loadFileProblem();
  assert.match(fileProblem({ name: "cr12.pdf", type: "application/pdf", size: 0 }), /This file is empty/);
  assert.match(fileProblem({ name: "cr12.pdf", type: "application/pdf", size: 10 * 1024 * 1024 + 1 }), /over 10 MB/);
  assert.match(fileProblem({ name: "IMG_0001.HEIC", type: "", size: 512 }), /iPhone HEIC photos aren't supported\. Export as JPG or take a screenshot/);
  assert.match(fileProblem({ name: "id.heif", type: "image/heif", size: 512 }), /HEIC/);
  assert.match(fileProblem({ name: "cr12.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 512 }), /Save it as PDF/);
  assert.match(fileProblem({ name: "cr12.doc", type: "application/msword", size: 512 }), /Save it as PDF/);
  assert.equal(fileProblem({ name: "notes.txt", type: "text/plain", size: 512 }), "Choose a PDF, JPG or PNG file up to 10 MB.");
  for (const [name, type] of [["cr12.pdf", "application/pdf"], ["id.jpg", "image/jpeg"], ["id.png", "image/png"]]) {
    assert.equal(fileProblem({ name, type, size: 10 * 1024 * 1024 }), "");
  }
  assert.match(flow, /const acceptedFiles = "application\/pdf,image\/jpeg,image\/png";/);
  assert.match(flow, /const maxFileBytes = 10 \* 1024 \* 1024;/);
});

test("dealer setup header shows the account, sign-out and a buyer exit", () => {
  assert.match(page, /<DealerSetupAccountBar email=\{user\.email\} canLeave=\{!dealer && profile\.role !== "seller"\} \/>/);
  assert.match(flow, /await createClient\(\)\.auth\.signOut\(\)/);
  assert.match(flow, /await leaveDealerSetup\(\)/);
  assert.match(flow, /Signed in as/);
  assert.match(flow, /Not a dealer\?/);
  assert.match(flow, /Continue as a buyer/);
});
