"use server";

import { z } from "zod";
import { getMessagingCenterData } from "@/lib/data/messaging";

const messageCursors = z.record(z.uuid(), z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime({ offset: true }),
}));

export async function refreshMessagingCenter(cursors: unknown) {
  const parsed = messageCursors.safeParse(cursors);
  if (!parsed.success) return null;
  return getMessagingCenterData(parsed.data);
}
