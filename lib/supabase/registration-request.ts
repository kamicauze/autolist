export const EMAIL_ALREADY_REGISTERED_MESSAGE =
  "This email is already registered. Sign in instead, or reset your password if needed. If you registered with Google, use Continue with Google.";

export function isExistingRegistration(user: { identities?: readonly unknown[] } | null) {
  // Supabase obscures confirmed duplicate signups with an empty identities array.
  return Array.isArray(user?.identities) && user.identities.length === 0;
}

export const PASSWORD_REQUIREMENTS = [
  { label: "8 characters", requirement: "at least 8 characters", isMet: (password: string) => password.length >= 8 },
  { label: "Capital letter", requirement: "a capital letter", isMet: (password: string) => /[A-Z]/.test(password) },
  { label: "Number", requirement: "a number", isMet: (password: string) => /\d/.test(password) },
];

export function getPasswordRequirementError(password: string) {
  const missing = PASSWORD_REQUIREMENTS.filter((item) => !item.isMet(password)).map((item) => item.requirement);
  if (missing.length === 0) return null;
  return `Your password needs ${new Intl.ListFormat("en", { type: "conjunction" }).format(missing)}.`;
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

  if (normalized.includes("for security purposes") || normalized.includes("only request this after")) {
    const seconds = normalized.match(/after (\d+) seconds?/)?.[1];
    const wait = seconds ? `in ${seconds} second${seconds === "1" ? "" : "s"}` : "shortly";
    return `We just sent a verification email to this address. Check your inbox and spam folder. You can request another ${wait}.`;
  }

  if (normalized.includes("rate limit")) {
    return "Our email service is busy right now, so we could not send your verification email. Your details are still here. Please try again in a few minutes.";
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
