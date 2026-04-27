import fs from "fs";
import path from "path";

type Check = {
  key: string;
  label: string;
  requiredFor: string;
};

const checks: Check[] = [
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    label: "Supabase project URL",
    requiredFor: "Auth, database, and storage access",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    label: "Supabase anon key",
    requiredFor: "Browser auth and Supabase client access",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    label: "Supabase service role key",
    requiredFor: "Admin scripts, sales-agent invites, and notification processor",
  },
  {
    key: "NEXT_PUBLIC_SITE_URL",
    label: "Public site URL",
    requiredFor: "Invite links, OAuth redirects, and notification deep links",
  },
  {
    key: "RESEND_API_KEY",
    label: "Resend API key",
    requiredFor: "Email delivery",
  },
  {
    key: "EMAIL_FROM",
    label: "Email from address",
    requiredFor: "Email delivery sender identity",
  },
  {
    key: "WHATSAPP_ACCESS_TOKEN",
    label: "WhatsApp access token",
    requiredFor: "WhatsApp Cloud API delivery",
  },
  {
    key: "WHATSAPP_PHONE_NUMBER_ID",
    label: "WhatsApp phone number id",
    requiredFor: "WhatsApp Cloud API delivery",
  },
  {
    key: "NOTIFICATION_PROCESS_SECRET",
    label: "Notification processor secret",
    requiredFor: "Protected /api/notifications/process route",
  },
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
  loadLocalEnv();

  const rows = checks.map((check) => ({
    key: check.key,
    label: check.label,
    status: statusFor(check.key),
    requiredFor: check.requiredFor,
  }));

  const missing = rows.filter((row) => row.status === "missing");
  console.table(rows);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) {
    console.log(`OAuth callback URL: ${siteUrl.replace(/\/$/, "")}/auth/callback`);
    console.log(`Sales-agent invite base: ${siteUrl.replace(/\/$/, "")}/join/sales-agent/[token]`);
  }

  if (missing.length > 0) {
    console.log(
      `Missing ${missing.length} integration setting${missing.length === 1 ? "" : "s"}: ${missing
        .map((row) => row.key)
        .join(", ")}`
    );
    process.exitCode = 1;
    return;
  }

  console.log("All integration settings are present.");
}

main();
