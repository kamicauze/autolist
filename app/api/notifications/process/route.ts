import { NextResponse } from "next/server";
import { processQueuedNotificationDeliveries } from "@/lib/server/notification-delivery";
import { processQueuedListingAlertJobs } from "@/lib/server/listing-alerts";

function isAuthorized(request: Request) {
  const secret = process.env.NOTIFICATION_PROCESS_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization") || "";
  const cronHeader = request.headers.get("x-cron-secret") || "";
  return authHeader === `Bearer ${secret}` || cronHeader === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alertJobs = await processQueuedListingAlertJobs();
  const deliveries = await processQueuedNotificationDeliveries();
  return NextResponse.json({ alertJobs, ...deliveries });
}
