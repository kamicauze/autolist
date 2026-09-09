import assert from "node:assert/strict";
import {
  isMissingDealerDetailWorkflowColumn,
  normalizeLegacyAdminDealerDocument,
  normalizeAdminDealerDetailRow,
  shouldIgnoreOptionalMissingHistoryError,
} from "./admin-user-detail";

assert.deepEqual(
  normalizeLegacyAdminDealerDocument({
    id: "document-1",
    document_type: "incorporation_certificate",
    file_url: "dealer-verification/document-1.pdf",
    uploaded_at: "2026-09-09T00:00:00.000Z",
  }),
  {
    id: "document-1",
    document_type: "incorporation_certificate",
    display_name: "Certificate of incorporation",
    mime_type: null,
    size_bytes: null,
    created_at: "2026-09-09T00:00:00.000Z",
  }
);

assert.equal(
  isMissingDealerDetailWorkflowColumn({
    code: "42703",
    message: "column dealers.submitted_at does not exist",
  }),
  true
);

assert.equal(
  isMissingDealerDetailWorkflowColumn({
    code: "42703",
    message: "column dealers.logo_url does not exist",
  }),
  false
);

assert.equal(
  shouldIgnoreOptionalMissingHistoryError(
    {
      code: "PGRST205",
      message: "Could not find the table 'public.listing_reviews' in the schema cache",
    },
    true
  ),
  true
);

assert.equal(
  shouldIgnoreOptionalMissingHistoryError(
    {
      code: "PGRST205",
      message: "Could not find the table 'public.listing_reviews' in the schema cache",
    },
    false
  ),
  false
);

assert.deepEqual(
  normalizeAdminDealerDetailRow({
    id: "dealer-1",
    profile_id: "profile-1",
    name: "Pilot Motors",
    business_name: null,
    status: "PENDING",
    address: null,
    city: "Nairobi",
    location: null,
    mobile: null,
    email: null,
    whatsapp: null,
    website: null,
    about_text: null,
    contact_person: null,
    created_at: "2026-06-17T00:00:00.000Z",
    updated_at: "2026-06-17T00:00:00.000Z",
  }),
  {
    id: "dealer-1",
    profile_id: "profile-1",
    name: "Pilot Motors",
    business_name: null,
    status: "PENDING",
    address: null,
    city: "Nairobi",
    location: null,
    mobile: null,
    email: null,
    whatsapp: null,
    website: null,
    about_text: null,
    contact_person: null,
    submitted_at: null,
    reviewed_at: null,
    verified_at: null,
    rejection_reason: null,
    review_notes: null,
    verification_notes: null,
    created_at: "2026-06-17T00:00:00.000Z",
    updated_at: "2026-06-17T00:00:00.000Z",
  }
);
