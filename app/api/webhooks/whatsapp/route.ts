import { createHmac, timingSafeEqual } from "node:crypto";

function matches(actual: string, expected: string) {
  const left = Buffer.from(actual);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function GET(request: Request) {
  const token = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  const params = new URL(request.url).searchParams;
  const challenge = params.get("hub.challenge");

  if (
    !token ||
    params.get("hub.mode") !== "subscribe" ||
    !matches(params.get("hub.verify_token") ?? "", token) ||
    !challenge
  ) {
    return new Response(null, { status: 403 });
  }

  return new Response(challenge);
}

type DeliveryEvent = {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: {
        metadata?: { phone_number_id?: string };
        statuses?: Array<{
          id?: string;
          status?: string;
          errors?: Array<{ code?: number }>;
        }>;
      };
    }>;
  }>;
};

export async function POST(request: Request) {
  const secret = process.env.WHATSAPP_WEBHOOK_APP_SECRET;
  const accountId = process.env.WHATSAPP_WEBHOOK_ACCOUNT_ID;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!secret || !accountId || !phoneId) {
    return new Response(null, { status: 503 });
  }

  const body = Buffer.from(await request.arrayBuffer());
  const signature = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  if (!matches(request.headers.get("x-hub-signature-256") ?? "", signature)) {
    return new Response(null, { status: 403 });
  }

  let event: DeliveryEvent;
  try {
    event = JSON.parse(body.toString("utf8"));
  } catch {
    return new Response(null, { status: 400 });
  }

  if (event?.object === "whatsapp_business_account") {
    for (const entry of event.entry ?? []) {
      if (entry.id !== accountId) continue;
      for (const change of entry.changes ?? []) {
        if (change.field !== "messages" || change.value?.metadata?.phone_number_id !== phoneId) continue;
        for (const update of change.value.statuses ?? []) {
          if (!update.id || !update.status || !["sent", "delivered", "read", "failed"].includes(update.status)) continue;
          console.info("WhatsApp delivery status", {
            messageId: update.id,
            status: update.status,
            errorCodes: update.errors?.map(({ code }) => code).filter(Number.isInteger),
          });
        }
      }
    }
  }

  return new Response(null, { status: 200 });
}
