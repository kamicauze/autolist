import assert from "node:assert/strict";
import test from "node:test";
import { getListingSupportingMedia } from "./listing-supporting-media";

test("preserves actual uploaded documents, legacy names, and vehicle video without duplicating documents", () => {
  assert.deepEqual(getListingSupportingMedia({ metadata: {
    videoUrl: "https://example.com/vehicle.mp4",
    documents: [
      { name: " Inspection report ", url: "https://example.com/report.pdf" },
      { fileName: "Inspection report", publicUrl: "https://example.com/report.pdf" },
      { displayName: "Service history", r2_key: "https://example.com/history.pdf" },
    ],
    documentNames: ["Inspection report", " Registration ", "Registration", ""],
  } }), {
    videoUrl: "https://example.com/vehicle.mp4",
    documents: [
      { name: "Inspection report", url: "https://example.com/report.pdf" },
      { name: "Service history", url: "https://example.com/history.pdf" },
      { name: "Registration", url: null },
    ],
  });
});

test("does not render unsafe links or fabricate media when no file is attached", () => {
  assert.deepEqual(getListingSupportingMedia({ metadata: {
    videoUrl: "javascript:alert(1)",
    documents: [null, { name: "Unattached document", url: "javascript:alert(1)" }, { url: "https://example.com/unnamed.pdf" }],
  } }), { videoUrl: null, documents: [{ name: "Unattached document", url: null }] });
  assert.deepEqual(getListingSupportingMedia({ metadata: null }), { videoUrl: null, documents: [] });
});
