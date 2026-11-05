export const EMAIL_ALREADY_REGISTERED_MESSAGE =
  "This email is already registered. Sign in instead, or reset your password if needed. If you registered with Google, use Continue with Google.";

export function isExistingRegistration(user: { identities?: readonly unknown[] } | null) {
  // Supabase obscures confirmed duplicate signups with an empty identities array.
  return Array.isArray(user?.identities) && user.identities.length === 0;
}

export const REGISTRATION_REQUEST_TIMEOUT_MS = 20_000;

export class RegistrationRequestTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Registration request timed out after ${timeoutMs}ms.`);
    this.name = "RegistrationRequestTimeoutError";
  }
}

export function getRegistrationErrorMessage(message: string | null | undefined) {
  const normalized = (message || "").toLowerCase();

  if (normalized.includes("error sending confirmation email")) {
    return "We could not send the verification email. Your details are still here. Wait a minute and try again, or sign in if the account was already created.";
  }

  if (normalized.includes("rate limit")) {
    return "Too many registration attempts were made. Your details are still here. Wait a few minutes before trying again.";
  }

  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return EMAIL_ALREADY_REGISTERED_MESSAGE;
  }

  return message || "We could not create the account. Your details are still here, so you can try again.";
}

export async function withRegistrationRequestTimeout<T>(
  request: PromiseLike<T>,
  timeoutMs = REGISTRATION_REQUEST_TIMEOUT_MS
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      Promise.resolve(request),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new RegistrationRequestTimeoutError(timeoutMs)),
          timeoutMs
        );
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
