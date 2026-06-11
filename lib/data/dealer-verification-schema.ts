export type PostgrestSchemaError = {
  message?: string | null;
  details?: string | null;
  hint?: string | null;
  code?: string | null;
};

export function schemaErrorIncludes(
  error: PostgrestSchemaError | null | undefined,
  value: string
) {
  if (!error) return false;
  return [error.message, error.details, error.hint].some((part) =>
    typeof part === "string" ? part.includes(value) : false
  );
}

export function isMissingDealerVerificationDocumentsStorageShape(
  error: PostgrestSchemaError | null | undefined
) {
  return ["r2_key", "mime_type", "size_bytes", "display_name"].some((column) =>
    schemaErrorIncludes(error, column)
  );
}

export function isDealerVerificationDocumentsUnavailable(
  error: PostgrestSchemaError | null | undefined
) {
  return (
    schemaErrorIncludes(error, "dealer_verification_documents") ||
    isMissingDealerVerificationDocumentsStorageShape(error)
  );
}

export function isDealerVerificationSchemaMismatch(
  error: PostgrestSchemaError | null | undefined
) {
  return (
    isDealerVerificationDocumentsUnavailable(error) ||
    [
      "submitted_at",
      "reviewed_by",
      "reviewed_at",
      "review_notes",
      "verification_notes",
      "preferred_confirmation_channel",
    ].some((value) => schemaErrorIncludes(error, value))
  );
}
