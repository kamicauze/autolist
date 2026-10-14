import { normalizePhoneForVerification } from "./phone";

export const PHONE_COUNTRY_CODES = [
  { code: "+254", label: "Kenya" },
  { code: "+256", label: "Uganda" },
  { code: "+255", label: "Tanzania" },
  { code: "+250", label: "Rwanda" },
  { code: "+257", label: "Burundi" },
  { code: "+211", label: "South Sudan" },
  { code: "+252", label: "Somalia" },
  { code: "+251", label: "Ethiopia" },
  { code: "+243", label: "DR Congo" },
  { code: "+27", label: "South Africa" },
  { code: "+234", label: "Nigeria" },
  { code: "+233", label: "Ghana" },
  { code: "+20", label: "Egypt" },
  { code: "+44", label: "United Kingdom" },
  { code: "+1", label: "United States / Canada" },
  { code: "+971", label: "United Arab Emirates" },
  { code: "+91", label: "India" },
  { code: "+86", label: "China" },
  { code: "+49", label: "Germany" },
  { code: "+61", label: "Australia" },
];

export function splitPhoneCountry(value: string) {
  if (!value) return { code: "+254", number: "" };
  const normalized = normalizePhoneForVerification(value);
  const country = PHONE_COUNTRY_CODES.find(({ code }) => normalized.startsWith(code));
  return country
    ? { code: country.code, number: normalized.slice(country.code.length) }
    : { code: "", number: value };
}

export function joinPhoneCountry(code: string, number: string) {
  if (!number.trim()) return "";
  if (!code || number.trim().startsWith("+")) return normalizePhoneForVerification(number);
  const digits = number.replace(/\D/g, "");
  return `${code}${code === "+254" && digits.startsWith("0") ? digits.slice(1) : digits}`;
}
