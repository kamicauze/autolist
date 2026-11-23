import { NextRequest, NextResponse } from "next/server";
import { evaluateCommsAgent } from "@/lib/ai/comms-agent";
import { getCommsAgentContext } from "@/lib/data/comms-agent-context";
import type { CommsAgentRequest } from "@/lib/types/comms-agent";

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as Partial<CommsAgentRequest>;
  const conversationId = typeof payload.conversationId === "string" ? payload.conversationId.trim() : "";

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is required." }, { status: 400 });
  }

  const context = await getCommsAgentContext(
    conversationId,
    typeof payload.latestDraft === "string" ? payload.latestDraft : undefined
  );

  if (context.status !== "ok") {
    return context.status === "unauthenticated"
      ? NextResponse.json({ error: "Sign in to use the reply assistant." }, { status: 401 })
      : NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const result = await evaluateCommsAgent(context.input);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
