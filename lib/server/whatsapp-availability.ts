// Shared by server code and the build-time configuration check.
// Keep this setting server-side; client views receive only an availability prop.
export function isWhatsAppEnabled() {
  return process.env.WHATSAPP_ENABLED !== "false";
}
