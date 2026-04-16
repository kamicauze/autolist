import { NextRequest, NextResponse } from "next/server";
import { evaluateCommsAgent } from "@/lib/ai/comms-agent";
import type { CommsAgentInput } from "@/lib/types/comms-agent";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<CommsAgentInput>;

  if (!payload.buyerName || !payload.listingTitle || !Array.isArray(payload.messages)) {
    return NextResponse.json(
      { error: "buyerName, listingTitle, and messages are required." },
      { status: 400 }
    );
  }

  const result = await evaluateCommsAgent({
    buyerName: payload.buyerName,
    listingTitle: payload.listingTitle,
    conversationId: payload.conversationId,
    latestDraft: payload.latestDraft,
    messages: payload.messages,
  });

  return NextResponse.json(result);
}
