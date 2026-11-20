export type CommsAgentMessage = {
  sender: "me" | "them" | "system";
  text: string;
  time?: string;
};

export type CommsAgentFaqExcerpt = {
  question: string;
  answer: string;
};

export type CommsAgentInput = {
  buyerName: string;
  listingTitle: string;
  conversationId?: string;
  latestDraft?: string;
  messages: CommsAgentMessage[];
  /** Seller-provided facts for the advertised unit, loaded server-side. */
  listingFacts?: string[];
  /** Platform FAQ excerpts retrieved for the buyer's latest questions. */
  faqs?: CommsAgentFaqExcerpt[];
};

export type CommsAgentRequest = {
  conversationId: string;
  latestDraft?: string;
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
