export const MAX_PHONE_DIGITS = 15;
export const MAX_PHONE_INPUT_LENGTH = MAX_PHONE_DIGITS + 1;
export const PHONE_REGEX = /^\+?[0-9]{8,15}$/;
export const LISTING_PHONE_ERROR =
  "Enter a valid phone number, e.g. 0712 345 678 or +254 712 345 678.";

const KENYA_PHONE_REGEX = /^\+254\d{9}$/;
const INTERNATIONAL_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;
const PHONE_CHARACTERS_REGEX = /^\+?[\d\s()-]+$/;

// Numbers written with a Kenyan prefix (0..., 254... or +254...).
function hasKenyanPrefix(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+")
    ? digits.startsWith("254")
    : digits.startsWith("0") || digits.startsWith("254");
}

export function normalizePhoneInput(value: string) {
  const hasPlus = value.trim().startsWith("+");
  const digits = value.replace(/\D/g, "").slice(0, MAX_PHONE_DIGITS);

  if (!digits) {
    return hasPlus ? "+" : "";
  }

  return `${hasPlus ? "+" : ""}${digits}`;
}

export function isValidPhoneNumber(value: string) {
  const phone = normalizePhoneInput(value);
  if (!PHONE_REGEX.test(phone)) return false;
  return !hasKenyanPrefix(phone) ||
    KENYA_PHONE_REGEX.test(normalizePhoneForVerification(phone));
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

  // "+254 0712 345 678" repeats the local trunk 0 after the country code.
  if (digits.length === 13 && digits.startsWith("2540")) {
    return `+254${digits.slice(4)}`;
  }

  return trimmed.startsWith("+") ? `+${digits}` : trimmed;
}

// Strict E.164 form for numbers buyers call: Kenyan numbers must normalize to
// +254 plus 9 digits, and anything else needs an explicit + country code.
export function normalizeListingPhone(value: string) {
  const trimmed = value.trim();
  if (!PHONE_CHARACTERS_REGEX.test(trimmed)) return null;

  if (trimmed.startsWith("+") && !hasKenyanPrefix(trimmed)) {
    const international = `+${trimmed.replace(/\D/g, "")}`;
    return INTERNATIONAL_PHONE_REGEX.test(international) ? international : null;
  }

  const kenyan = normalizePhoneForVerification(trimmed);
  return KENYA_PHONE_REGEX.test(kenyan) ? kenyan : null;
}

// Digits-only international number for wa.me links; local 07.../01... and
// 9-digit numbers are assumed to be Kenyan.
export function normalizeWhatsAppPhone(value?: string | null) {
  const digits = value?.replace(/\D/g, "") ?? "";
  const phone = digits.startsWith("00") ? digits.slice(2) : digits;

  if (!phone) {
    return null;
  }

  if (phone.startsWith("0") && phone.length >= 10) {
    return `254${phone.slice(1)}`;
  }

  if (/^[17]\d{8}$/.test(phone)) {
    return `254${phone}`;
  }

  return phone;
}
