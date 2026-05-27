type SupabaseErrorLike =
  | {
      code?: string | null;
      message?: string | null;
    }
  | Error
  | null
  | undefined;

export function isMissingRelationError(error: SupabaseErrorLike) {
  if (!error) return false;

  const code = typeof error === "object" && "code" in error ? error.code : null;
  const message: string =
    error instanceof Error
      ? error.message
      : typeof error === "object" && "message" in error
        ? error.message ?? ""
        : "";

  return code === "PGRST205" || message.includes("Could not find the table");
}

export function isMissingColumnError(error: SupabaseErrorLike) {
  if (!error) return false;

  const code = typeof error === "object" && "code" in error ? error.code : null;
  const message: string =
    error instanceof Error
      ? error.message
      : typeof error === "object" && "message" in error
        ? error.message ?? ""
        : "";

  return (
    code === "42703" ||
    code === "PGRST204" ||
    (message.includes("Could not find") && message.includes("column")) ||
    (message.includes("column") && message.includes("does not exist"))
  );
}
