export const MAX_PHONE_DIGITS = 15;
export const MAX_PHONE_INPUT_LENGTH = MAX_PHONE_DIGITS + 1;
export const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

export function normalizePhoneInput(value: string) {
  const hasPlus = value.trim().startsWith("+");
  const digits = value.replace(/\D/g, "").slice(0, MAX_PHONE_DIGITS);

  if (!digits) {
    return "";
  }

  return `${hasPlus ? "+" : ""}${digits}`;
}

export function isValidPhoneNumber(value: string) {
  return PHONE_REGEX.test(normalizePhoneInput(value));
}
