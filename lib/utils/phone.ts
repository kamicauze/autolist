export const MAX_PHONE_DIGITS = 15;
export const MAX_PHONE_INPUT_LENGTH = MAX_PHONE_DIGITS + 1;
export const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

export function normalizePhoneInput(value: string) {
  const hasPlus = value.trim().startsWith("+");
  const digits = value.replace(/\D/g, "").slice(0, MAX_PHONE_DIGITS);

  if (!digits) {
    return hasPlus ? "+" : "";
  }

  return `${hasPlus ? "+" : ""}${digits}`;
}

export function isValidPhoneNumber(value: string) {
  return PHONE_REGEX.test(normalizePhoneInput(value));
}

export function normalizePhoneForVerification(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 10 && digits.startsWith("0")) {
    return `+254${digits.slice(1)}`;
  }

  if (
    digits.length === 9 &&
    (digits.startsWith("7") || digits.startsWith("1"))
  ) {
    return `+254${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("254")) {
    return `+${digits}`;
  }

  return trimmed.startsWith("+") ? `+${digits}` : trimmed;
}
