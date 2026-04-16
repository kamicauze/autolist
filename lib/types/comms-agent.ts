export type CommsAgentMessage = {
  sender: "me" | "them";
  text: string;
  time?: string;
};

export type CommsAgentInput = {
  buyerName: string;
  listingTitle: string;
  conversationId?: string;
  latestDraft?: string;
  messages: CommsAgentMessage[];
};

export type SupportHandoffDraft = {
  category: string;
  priority: "low" | "medium" | "high";
  subject: string;
  customerSummary: string;
  internalNote: string;
  nextAction: string;
};

export type CommsAgentResult = {
  provider: "rules" | "local_llm" | "openai";
  model: string | null;
  summary: string;
  buyerIntent: string;
  suggestedReply: string;
  sellerChecklist: string[];
  supportHandoff: SupportHandoffDraft;
};
