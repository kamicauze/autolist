import "server-only";

type DeliveryResult = {
  success: boolean;
  externalId?: string | null;
  skipped?: boolean;
  error?: string;
};

type EmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type WhatsAppInput = {
  to: string;
  body: string;
};

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, "");
}

function parseFromAddress(value: string): { email: string; name?: string } {
  const match = value.match(/^(.*)<([^>]+)>\s*$/);
  if (match) {
    const name = match[1].trim().replace(/^"|"$/g, "");
    return name ? { email: match[2].trim(), name } : { email: match[2].trim() };
  }
  return { email: value.trim() };
}

async function sendMailtrapEmail(input: EmailInput): Promise<DeliveryResult> {
  const token = process.env.MAILTRAP_API_TOKEN;
  const inboxId = process.env.MAILTRAP_INBOX_ID;
  const from = process.env.EMAIL_FROM || "Autolist <notifications@autolist.africa>";

  if (!token || !inboxId) {
    return {
      success: false,
      skipped: true,
      error: "MAILTRAP_API_TOKEN and MAILTRAP_INBOX_ID are not configured.",
    };
  }

  const response = await fetch(`https://sandbox.api.mailtrap.io/api/send/${inboxId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: parseFromAddress(from),
      to: [{ email: input.to }],
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | { message_ids?: string[]; errors?: string[] }
    | null;

  if (!response.ok) {
    return {
      success: false,
      error: payload?.errors?.join("; ") || `Email provider returned ${response.status}.`,
    };
  }

  return { success: true, externalId: payload?.message_ids?.[0] || null };
}

export async function sendProviderEmail(input: EmailInput): Promise<DeliveryResult> {
  if (process.env.EMAIL_PROVIDER === "mailtrap") {
    return sendMailtrapEmail(input);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Autolist <notifications@autolist.africa>";

  if (!apiKey) {
    return { success: false, skipped: true, error: "RESEND_API_KEY is not configured." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });

  const payload = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;

  if (!response.ok) {
    return {
      success: false,
      error: payload?.message || `Email provider returned ${response.status}.`,
    };
  }

  return { success: true, externalId: payload?.id || null };
}

export async function sendProviderWhatsApp(input: WhatsAppInput): Promise<DeliveryResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";

  if (!accessToken || !phoneNumberId) {
    return {
      success: false,
      skipped: true,
      error: "WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID are not configured.",
    };
  }

  const to = normalizePhone(input.to);
  if (!to) {
    return { success: false, skipped: true, error: "Recipient WhatsApp number is missing." };
  }

  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: input.body,
        },
      }),
    }
  );

  const payload = (await response.json().catch(() => null)) as
    | { messages?: Array<{ id?: string }>; error?: { message?: string } }
    | null;

  if (!response.ok) {
    return {
      success: false,
      error: payload?.error?.message || `WhatsApp provider returned ${response.status}.`,
    };
  }

  return { success: true, externalId: payload?.messages?.[0]?.id || null };
}
