import { buildListingFacts, retrieveRelevantFaqs } from "@/lib/ai/comms-agent-grounding";
import { getListingById } from "@/lib/data/listings";
import { getMessagingCenterData } from "@/lib/data/messaging";
import type { CommsAgentInput, CommsAgentMessage } from "@/lib/types/comms-agent";

const MAX_TRANSCRIPT_MESSAGES = 30;
const FAQ_QUERY_MESSAGES = 3;

export type CommsAgentContextResult =
  | { status: "ok"; input: CommsAgentInput }
  | { status: "unauthenticated" | "not_found" };

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? undefined
    : date.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" });
}

/**
 * Builds the comms-agent input from server-side records only. Thread access
 * reuses the messaging center's viewer scoping, so a caller can only analyze a
 * conversation they can already open, and staff-only notes never reach a
 * buyer-facing draft.
 */
export async function getCommsAgentContext(
  conversationId: string,
  latestDraft?: string
): Promise<CommsAgentContextResult> {
  const center = await getMessagingCenterData();
  if (!center?.viewer) return { status: "unauthenticated" };

  const thread = center.threads.find((item) => item.id === conversationId);
  if (!thread) return { status: "not_found" };

  const messages: CommsAgentMessage[] = (center.messagesByThread[thread.id] || [])
    .filter((message) => message.visibility === "participants" && message.messageType !== "ticket_note")
    .slice(-MAX_TRANSCRIPT_MESSAGES)
    .map((message) => ({
      sender: message.messageType === "system" ? "system" : message.senderRole,
      text: message.body,
      time: formatTime(message.createdAt),
    }));

  const listing = thread.listingId ? await getListingById(thread.listingId) : null;
  const buyerQuestions = messages
    .filter((message) => message.sender === "them")
    .slice(-FAQ_QUERY_MESSAGES)
    .map((message) => message.text)
    .join(" ");

  return {
    status: "ok",
    input: {
      buyerName: thread.counterpartName,
      listingTitle: thread.listingTitle,
      conversationId: thread.id,
      latestDraft: latestDraft?.slice(0, 2000),
      messages,
      listingFacts: buildListingFacts(listing),
      faqs: retrieveRelevantFaqs(buyerQuestions),
    },
  };
}
