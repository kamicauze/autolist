import { generateAiJson } from "@/lib/ai/provider";
import type { CommsAgentInput, CommsAgentResult, SupportHandoffDraft } from "@/lib/types/comms-agent";

function buildFallbackReply(input: CommsAgentInput) {
  const latestBuyerMessage = [...input.messages].reverse().find((message) => message.sender === "them");
  const latestSellerMessage = [...input.messages].reverse().find((message) => message.sender === "me");
  const latestText = latestBuyerMessage?.text || "The buyer asked for more details.";
  const previousContext = latestSellerMessage ? `You already told them: "${latestSellerMessage.text}"` : "";

  return `Hi ${input.buyerName}, thanks for the message about the ${input.listingTitle}. ${previousContext} Based on your latest question, "${latestText}", I can confirm the details and help line up the next step. Let me know whether you want a viewing slot, extra photos, service records, or a price discussion and I will send that next.`;
}

function inferIntent(input: CommsAgentInput) {
  const joined = input.messages.map((message) => message.text.toLowerCase()).join(" ");

  if (/\b(viewing|inspect|inspection|tomorrow|friday|available)\b/.test(joined)) {
    return "The buyer is trying to schedule or confirm a viewing.";
  }
  if (/\b(service|history|mileage|logbook|records|paperwork)\b/.test(joined)) {
    return "The buyer wants proof of condition, history, or paperwork before moving forward.";
  }
  if (/\b(trade|cash|price|negotiat|offer)\b/.test(joined)) {
    return "The buyer is testing price flexibility or deal structure.";
  }

  return "The buyer is still qualifying the vehicle and needs a confident next-step reply.";
}

function buildFallbackHandoff(input: CommsAgentInput): SupportHandoffDraft {
  const latestBuyerMessage = [...input.messages].reverse().find((message) => message.sender === "them");
  return {
    category: "buyer_conversation",
    priority: /\b(logbook|paperwork|complaint|issue|problem)\b/i.test(
      latestBuyerMessage?.text || ""
    )
      ? "high"
      : "medium",
    subject: `${input.listingTitle}: ${input.buyerName} follow-up`,
    customerSummary:
      latestBuyerMessage?.text || `Buyer ${input.buyerName} needs follow-up on the ${input.listingTitle}.`,
    internalNote:
      "Review the conversation, confirm the exact listing details, and ensure the next reply includes a concrete action.",
    nextAction:
      "Support should confirm the requested information, then help the seller send a clear buyer-facing response.",
  };
}

function buildPrompt(input: CommsAgentInput) {
  return `
You are an automotive marketplace communications assistant.
Return strict JSON only with these top-level keys:
- summary (string)
- buyerIntent (string)
- suggestedReply (string)
- sellerChecklist (string array, max 5)
- supportHandoff (object with category, priority, subject, customerSummary, internalNote, nextAction)

Context:
- Buyer: ${input.buyerName}
- Listing: ${input.listingTitle}
- Conversation ID: ${input.conversationId || "n/a"}
- Current draft reply: ${input.latestDraft || "none"}

Conversation transcript:
${input.messages
  .map((message) => `- ${message.sender === "me" ? "Seller" : "Buyer"}${message.time ? ` (${message.time})` : ""}: ${message.text}`)
  .join("\n")}

Requirements:
- The summary must be concise and factual.
- The buyerIntent must explain what the buyer is trying to achieve now.
- The suggestedReply must sound like a competent seller, stay grounded in the transcript, and end with a concrete next step.
- The checklist must tell the seller what to verify before sending.
- The support handoff must be suitable for an internal help ticket if the conversation needs escalation.
- Do not invent facts not supported by the transcript.
  `.trim();
}

function sanitizeResult(
  input: CommsAgentInput,
  provider: "rules" | "local_llm" | "openai",
  model: string | null,
  data?: Partial<CommsAgentResult> | null
): CommsAgentResult {
  return {
    provider,
    model,
    summary:
      data?.summary?.trim() ||
      `Conversation with ${input.buyerName} about the ${input.listingTitle}.`,
    buyerIntent: data?.buyerIntent?.trim() || inferIntent(input),
    suggestedReply: data?.suggestedReply?.trim() || buildFallbackReply(input),
    sellerChecklist:
      data?.sellerChecklist?.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, 5) || [
        "Confirm the exact vehicle details mentioned in the thread.",
        "Make sure the next reply ends with one concrete action.",
        "Do not promise documents, pricing, or availability you have not verified.",
      ],
    supportHandoff: {
      ...buildFallbackHandoff(input),
      ...(data?.supportHandoff || {}),
    },
  };
}

export async function evaluateCommsAgent(input: CommsAgentInput): Promise<CommsAgentResult> {
  try {
    const generated = await generateAiJson<CommsAgentResult>({
      prompt: buildPrompt(input),
      maxTokens: 420,
    });

    if (!generated) {
      return sanitizeResult(input, "rules", null, null);
    }

    return sanitizeResult(
      input,
      generated.provider === "local" ? "local_llm" : generated.provider,
      generated.model,
      generated.data
    );
  } catch {
    return sanitizeResult(input, "rules", null, null);
  }
}
