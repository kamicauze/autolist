import fs from "fs";
import path from "path";

type Check = {
  key: string;
  label: string;
  requiredFor: string;
};

const build = process.argv.includes("--build");
const production = process.argv.includes("--production") || (build && process.env.VERCEL_ENV === "production");
const emailProvider = () => process.env.EMAIL_PROVIDER?.trim() || "resend";
const checks: Check[] = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase project URL", requiredFor: "Auth, database and storage" },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase public key", requiredFor: "Browser auth" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase service key", requiredFor: "Privileged server operations" },
  { key: "NEXT_PUBLIC_SITE_URL", label: "Public site URL", requiredFor: "Auth redirects and notification links" },
  { key: "R2_ACCOUNT_ID", label: "R2 account", requiredFor: "Listing media" },
  { key: "R2_ACCESS_KEY_ID", label: "R2 access key", requiredFor: "Listing media" },
  { key: "R2_SECRET_ACCESS_KEY", label: "R2 secret key", requiredFor: "Listing media" },
  { key: "R2_BUCKET_NAME", label: "R2 bucket", requiredFor: "Listing media" },
  { key: "NEXT_PUBLIC_R2_PUBLIC_URL", label: "Public media URL", requiredFor: "Listing images" },
  { key: "EMAIL_FROM", label: "Verified email sender", requiredFor: "Email delivery" },
  { key: "WHATSAPP_ACCESS_TOKEN", label: "WhatsApp token", requiredFor: "Phone verification" },
  { key: "WHATSAPP_PHONE_NUMBER_ID", label: "WhatsApp phone number ID", requiredFor: "Phone verification" },
  { key: "NOTIFICATION_PROCESS_SECRET", label: "Notification processor secret", requiredFor: "Protected delivery worker" },
];

function loadLocalEnv() {
  const envFiles = [".env", ".env.local"];

  for (const fileName of envFiles) {
    const filePath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }

      const normalized = line.startsWith("export ") ? line.slice(7) : line;
      const separatorIndex = normalized.indexOf("=");
      if (separatorIndex <= 0) {
        continue;
      }

      const key = normalized.slice(0, separatorIndex).trim();
      let value = normalized.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

function statusFor(key: string) {
  return process.env[key]?.trim() ? "set" : "missing";
}

function main() {
  if (build && !production) return;
  // Production checks must inspect the supplied deployment environment. Local QA
  // credentials must never make an incomplete production configuration pass.
  if (!production) loadLocalEnv();
  const providerChecks: Check[] = emailProvider() === "mailtrap"
    ? [
        { key: "MAILTRAP_API_TOKEN", label: "Mailtrap token", requiredFor: "Sandbox email" },
        { key: "MAILTRAP_INBOX_ID", label: "Mailtrap inbox", requiredFor: "Sandbox email" },
      ]
    : [{ key: "RESEND_API_KEY", label: "Resend API key", requiredFor: "Live email delivery" }];
  const productionChecks: Check[] = production ? [
    { key: "SELLER_PHONE_OTP_SECRET", label: "Phone OTP signing secret", requiredFor: "Phone verification" },
    { key: "WHATSAPP_OTP_TEMPLATE_NAME", label: "Approved authentication template", requiredFor: "Phone OTP delivery" },
    { key: "WHATSAPP_OTP_TEMPLATE_LANGUAGE", label: "Authentication template language", requiredFor: "Phone OTP delivery" },
  ] : [];
  const rows = [...checks, ...providerChecks, ...productionChecks].map((check) => ({
    ...check, status: statusFor(check.key),
  }));
  console.table(rows);
  const issues = rows.filter((row) => row.status === "missing").map((row) => `Missing ${row.key}`);
  if (production) {
    if (process.env.EMAIL_PROVIDER !== "resend") issues.push("Production EMAIL_PROVIDER must be resend.");
    if (process.env.QA_TOOLS_ENABLED === "true") issues.push("QA account tools must be disabled in production.");
    if ((process.env.SELLER_PHONE_OTP_SECRET?.trim().length || 0) < 32) {
      issues.push("SELLER_PHONE_OTP_SECRET must contain at least 32 characters.");
    }
    for (const key of ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_R2_PUBLIC_URL"]) {
      try {
        const url = new URL(process.env[key] || "");
        if (url.protocol !== "https:" || ["localhost", "127.0.0.1"].includes(url.hostname)
          || url.username || url.password || url.search || url.hash) throw new Error("Invalid public URL");
      } catch {
        issues.push(`${key} must be a public HTTPS URL without credentials or query parameters.`);
      }
    }
  }
  if (issues.length) {
    console.error(issues.join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log("Required application settings are present. Provider delivery, environment isolation and database permissions still require live acceptance.");
}

main();
