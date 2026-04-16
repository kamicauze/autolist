"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Bot,
  ClipboardList,
  Loader2,
  MessageSquareText,
  Paperclip,
  Search,
  SendHorizontal,
  SmilePlus,
  Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CommsAgentResult } from "@/lib/types/comms-agent";
import type { MessagingCenterData, ThreadListItem, ThreadMessageItem } from "@/lib/types/messaging";
import { SellerPageHeader, SellerSurface, getInitials } from "../seller-dashboard-ui";

type ChatLayoutProps = {
  initialData: MessagingCenterData | null;
};

function formatRelativeTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-KE", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatClockTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-KE", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function ChatLayout({ initialData }: ChatLayoutProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState("");
  const [threads, setThreads] = React.useState<ThreadListItem[]>(initialData?.threads || []);
  const [messagesByThread, setMessagesByThread] = React.useState<Record<string, ThreadMessageItem[]>>(
    initialData?.messagesByThread || {}
  );
  const [activeConversationId, setActiveConversationId] = React.useState(initialData?.threads[0]?.id || "");
  const [message, setMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isEscalating, setIsEscalating] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);
  const [ticketNotice, setTicketNotice] = React.useState<string | null>(null);
  const [agentResult, setAgentResult] = React.useState<CommsAgentResult | null>(null);
  const [isAgentLoading, setIsAgentLoading] = React.useState(false);
  const [agentError, setAgentError] = React.useState<string | null>(null);

  const viewer = initialData?.viewer || null;
  const canUseSellerAgent = viewer?.role === "seller" || viewer?.role === "dealer";
  const roleDescription =
    viewer?.role === "buyer"
      ? "Track seller replies and keep listing conversations moving without leaving the app."
      : "Use live buyer conversations, generate grounded reply drafts, and escalate a thread into a support ticket when intervention is needed.";

  const conversations = threads.filter((item) => {
    const search = query.toLowerCase();
    return (
      item.counterpartName.toLowerCase().includes(search) ||
      item.listingTitle.toLowerCase().includes(search) ||
      (item.lastMessagePreview || "").toLowerCase().includes(search)
    );
  });

  const activeConversation =
    conversations.find((item) => item.id === activeConversationId) ||
    threads.find((item) => item.id === activeConversationId) ||
    threads[0] ||
    null;
  const activeMessages = activeConversation ? messagesByThread[activeConversation.id] || [] : [];

  React.useEffect(() => {
    if (!activeConversationId && threads[0]?.id) {
      setActiveConversationId(threads[0].id);
    }
  }, [activeConversationId, threads]);

  React.useEffect(() => {
    const selectedThread = searchParams.get("thread");
    if (selectedThread && threads.some((thread) => thread.id === selectedThread)) {
      setActiveConversationId(selectedThread);
    }
  }, [searchParams, threads]);

  React.useEffect(() => {
    setAgentResult(null);
    setAgentError(null);
    setTicketNotice(null);
  }, [activeConversationId]);

  async function runCommsAgent() {
    if (!activeConversation) return;

    setIsAgentLoading(true);
    setAgentError(null);

    try {
      const response = await fetch("/api/ai/comms-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: activeConversation.counterpartName,
          listingTitle: activeConversation.listingTitle,
          conversationId: activeConversation.id,
          latestDraft: message,
          messages: activeMessages.map((item) => ({
            sender: item.senderRole === "me" ? "me" : "them",
            text: item.body,
            time: formatClockTime(item.createdAt),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to analyze this conversation.");
      }

      const result = (await response.json()) as CommsAgentResult;
      setAgentResult(result);
    } catch (error) {
      setAgentError(error instanceof Error ? error.message : "Unable to analyze this conversation.");
    } finally {
      setIsAgentLoading(false);
    }
  }

  async function sendMessage() {
    if (!activeConversation) return;

    const body = message.trim();
    if (!body) return;

    setIsSending(true);
    setSendError(null);

    try {
      const response = await fetch(`/api/messages/threads/${activeConversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });

      const payload = (await response.json()) as
        | (ThreadMessageItem & { senderName?: string })
        | { error?: string };

      if (!response.ok || !("id" in payload)) {
        throw new Error(("error" in payload && payload.error) || "Unable to send message.");
      }

      const nextMessage: ThreadMessageItem = {
        id: payload.id,
        threadId: payload.threadId,
        senderId: payload.senderId,
        senderName: payload.senderName || viewer?.fullName || viewer?.email || "You",
        senderRole: "me",
        body: payload.body,
        visibility: payload.visibility,
        messageType: payload.messageType,
        createdAt: payload.createdAt,
      };

      setMessagesByThread((current) => ({
        ...current,
        [activeConversation.id]: [...(current[activeConversation.id] || []), nextMessage],
      }));
      setThreads((current) =>
        current.map((thread) =>
          thread.id === activeConversation.id
            ? {
                ...thread,
                lastMessageAt: nextMessage.createdAt,
                lastMessagePreview: nextMessage.body,
                status: viewer?.role === "buyer" ? "waiting_on_seller" : "waiting_on_buyer",
              }
            : thread
        )
      );
      setMessage("");
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Unable to send message.");
    } finally {
      setIsSending(false);
    }
  }

  async function escalateThread() {
    if (!activeConversation || !agentResult) return;

    setIsEscalating(true);
    setTicketNotice(null);

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: activeConversation.id,
          subject: agentResult.supportHandoff.subject || `${activeConversation.listingTitle} follow-up`,
          category: agentResult.supportHandoff.category || "buyer_seller_chat",
          priority: agentResult.supportHandoff.priority || "medium",
          customerSummary:
            agentResult.supportHandoff.customerSummary || activeConversation.lastMessagePreview,
          internalNote: agentResult.supportHandoff.internalNote,
        }),
      });

      const payload = (await response.json()) as { error?: string; id?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to create support ticket.");
      }

      setThreads((current) =>
        current.map((thread) =>
          thread.id === activeConversation.id
            ? {
                ...thread,
                openTicketCount: thread.openTicketCount + 1,
                ticketCount: thread.ticketCount + 1,
                status: "escalated",
              }
            : thread
        )
      );
      setTicketNotice("Ticket created and routed to the admin/support queue.");
    } catch (error) {
      setTicketNotice(error instanceof Error ? error.message : "Unable to create support ticket.");
    } finally {
      setIsEscalating(false);
    }
  }

  if (!viewer) {
    return (
      <div className="space-y-6 lg:space-y-7">
        <SellerPageHeader title="Messages" description="Sign in to access buyer and seller conversations." />
        <SellerSurface className="p-6 text-[14px] text-[#5f6a7e]">
          Messaging is available after authentication.
        </SellerSurface>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Messages"
        description={roleDescription}
      />

      <SellerSurface className="overflow-hidden">
        <div className={`grid min-h-[740px] ${canUseSellerAgent ? "xl:grid-cols-[340px_minmax(0,1fr)_380px]" : "xl:grid-cols-[340px_minmax(0,1fr)]"}`}>
          <div className="border-b border-[#ededed] xl:border-b-0 xl:border-r">
            <div className="border-b border-[#ededed] p-5">
              <div className="flex h-12 items-center gap-3 rounded-[14px] border border-[#ededed] bg-white px-4">
                <Search className="h-4 w-4 text-[#939393]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search conversations..."
                  className="h-full flex-1 border-0 bg-transparent text-[14px] outline-none placeholder:text-[#9a9a9a]"
                />
              </div>
            </div>

            <div className="max-h-[640px] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="px-5 py-8 text-[13px] text-[#6f6f6f]">No conversations found.</div>
              ) : null}
              {conversations.map((conversation) => {
                const active = conversation.id === activeConversationId;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation.id)}
                    className={`flex w-full items-start gap-3 border-b border-[#efefef] px-5 py-4 text-left transition ${
                      active ? "bg-[#f7fbff]" : "bg-white hover:bg-[#fafafa]"
                    }`}
                  >
                    <Avatar
                      alt={conversation.counterpartName}
                      fallback={getInitials(conversation.counterpartName)}
                      size="md"
                      className="shrink-0 bg-[#eef4ff] text-[#2563eb]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[14px] font-semibold text-[#202224]">
                            {conversation.counterpartName}
                          </p>
                          <p className="mt-1 text-[12px] text-[#8a8a8a]">{conversation.listingTitle}</p>
                        </div>
                        <p className="text-[11px] text-[#999]">{formatRelativeTimestamp(conversation.lastMessageAt)}</p>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[#6f6f6f]">
                        {conversation.lastMessagePreview || "No messages yet."}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#f2f4f7] px-2 py-1 text-[11px] font-medium text-[#667085]">
                          {conversation.status}
                        </span>
                        {conversation.openTicketCount > 0 ? (
                          <span className="rounded-full bg-[#fff4e5] px-2 py-1 text-[11px] font-medium text-[#b54708]">
                            {conversation.openTicketCount} open ticket
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex min-h-[640px] flex-col border-b border-[#ededed] xl:border-b-0 xl:border-r">
            {activeConversation ? (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-[#ededed] px-5 py-5">
                  <div className="flex items-center gap-3">
                    <Avatar
                      alt={activeConversation.counterpartName}
                      fallback={getInitials(activeConversation.counterpartName)}
                      size="md"
                      className="bg-[#eef4ff] text-[#2563eb]"
                    />
                    <div>
                      <p className="text-[15px] font-semibold text-[#202224]">
                        {activeConversation.counterpartName}
                      </p>
                      <p className="mt-1 text-[12px] text-[#7d7d7d]">{activeConversation.listingTitle}</p>
                    </div>
                  </div>

                  {canUseSellerAgent ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-[14px]"
                      onClick={() => void runCommsAgent()}
                      disabled={isAgentLoading || activeMessages.length === 0}
                    >
                      {isAgentLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing
                        </>
                      ) : (
                        <>
                          <Bot className="mr-2 h-4 w-4" />
                          AI Assist
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>

                <div className="flex-1 space-y-4 bg-[#faf9f7] p-5">
                  {activeMessages.length === 0 ? (
                    <div className="rounded-[18px] border border-dashed border-[#d9dde7] bg-white px-4 py-5 text-[13px] text-[#667085]">
                      No messages in this thread yet.
                    </div>
                  ) : null}

                  {activeMessages.map((item) => (
                    <div
                      key={item.id}
                      className={`flex ${item.senderRole === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-[22px] px-4 py-3 text-[14px] leading-6 ${
                          item.senderRole === "me"
                            ? "rounded-br-[8px] bg-[#edf3ff] text-[#202224]"
                            : "rounded-bl-[8px] bg-[#fff2e7] text-[#202224]"
                        }`}
                      >
                        <p>{item.body}</p>
                        <p className="mt-2 text-[11px] text-[#8d8d8d]">{formatClockTime(item.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#ededed] px-5 py-4">
                  {sendError ? (
                    <div className="mb-3 rounded-[14px] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b42318]">
                      {sendError}
                    </div>
                  ) : null}
                  <div className="flex items-center gap-3 rounded-[20px] border border-[#ededed] bg-white px-4 py-3">
                    <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faf9f7] text-[#7f7f7f]">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faf9f7] text-[#7f7f7f]">
                      <SmilePlus className="h-4 w-4" />
                    </button>
                    <input
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Write your message..."
                      className="h-10 flex-1 border-0 bg-transparent text-[14px] outline-none placeholder:text-[#9a9a9a]"
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void sendMessage();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => void sendMessage()}
                      disabled={isSending || !message.trim()}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2563eb] text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-[14px] text-[#6f6f6f]">
                No conversation selected.
              </div>
            )}
          </div>

          {canUseSellerAgent ? (
          <div className="bg-[#fcfdff] p-5">
            <div className="rounded-[22px] border border-[#e4e9f2] bg-white p-5">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="h-4 w-4" />
                Buyer Comms Agent
              </p>
              <h3 className="mt-2 text-[21px] font-semibold text-[#202224]">
                Draft replies and escalate when needed
              </h3>
              <p className="mt-2 text-[14px] leading-6 text-[#667084]">
                The agent reads the active thread, drafts a grounded reply, and turns the same case into a structured support ticket if the seller needs help.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="h-11 rounded-[14px] bg-[#202224] px-4 text-white hover:bg-[#111315]"
                  onClick={() => void runCommsAgent()}
                  disabled={isAgentLoading || !activeConversation}
                >
                  {isAgentLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running
                    </>
                  ) : (
                    <>
                      <MessageSquareText className="mr-2 h-4 w-4" />
                      Generate Assist
                    </>
                  )}
                </Button>

                {agentResult ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-[14px]"
                    onClick={() => setMessage(agentResult.suggestedReply)}
                  >
                    Use Reply Draft
                  </Button>
                ) : null}
              </div>

              {agentError ? (
                <div className="mt-4 rounded-[16px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#b42318]">
                  {agentError}
                </div>
              ) : null}

              {ticketNotice ? (
                <div className="mt-4 rounded-[16px] border border-[#fedf89] bg-[#fffaeb] px-4 py-3 text-[13px] text-[#b54708]">
                  {ticketNotice}
                </div>
              ) : null}

              {agentResult ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-[18px] border border-[#e6ebf5] bg-[#f8fbff] p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5d6b82]">
                      Summary
                    </p>
                    <p className="mt-2 text-[14px] leading-6 text-[#202224]">{agentResult.summary}</p>
                    <p className="mt-3 text-[13px] leading-6 text-[#5f6a7e]">
                      <span className="font-semibold text-[#202224]">Buyer intent:</span> {agentResult.buyerIntent}
                    </p>
                  </div>

                  <div className="rounded-[18px] border border-[#e6ebf5] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5d6b82]">
                        Suggested Reply
                      </p>
                      <p className="text-[11px] text-[#7b8598]">
                        {agentResult.provider === "rules"
                          ? "Fallback rules"
                          : `${agentResult.provider} · ${agentResult.model}`}
                      </p>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-[14px] leading-6 text-[#202224]">
                      {agentResult.suggestedReply}
                    </p>
                  </div>

                  <div className="rounded-[18px] border border-[#e6ebf5] bg-white p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5d6b82]">
                      Seller Checklist
                    </p>
                    <div className="mt-3 space-y-2">
                      {agentResult.sellerChecklist.map((item) => (
                        <div
                          key={item}
                          className="rounded-[14px] border border-[#eef2f7] bg-[#fbfcfe] px-3 py-2 text-[13px] leading-6 text-[#3b4453]"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-[#e6ebf5] bg-white p-4">
                    <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5d6b82]">
                      <ClipboardList className="h-4 w-4" />
                      Support Handoff
                    </p>
                    <div className="mt-3 space-y-2 text-[13px] leading-6 text-[#3b4453]">
                      <p>
                        <span className="font-semibold text-[#202224]">Subject:</span>{" "}
                        {agentResult.supportHandoff.subject}
                      </p>
                      <p>
                        <span className="font-semibold text-[#202224]">Category:</span>{" "}
                        {agentResult.supportHandoff.category}
                      </p>
                      <p>
                        <span className="font-semibold text-[#202224]">Priority:</span>{" "}
                        {agentResult.supportHandoff.priority}
                      </p>
                      <p>
                        <span className="font-semibold text-[#202224]">Customer summary:</span>{" "}
                        {agentResult.supportHandoff.customerSummary}
                      </p>
                      <p>
                        <span className="font-semibold text-[#202224]">Internal note:</span>{" "}
                        {agentResult.supportHandoff.internalNote}
                      </p>
                      <p>
                        <span className="font-semibold text-[#202224]">Next action:</span>{" "}
                        {agentResult.supportHandoff.nextAction}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 h-11 rounded-[14px]"
                      onClick={() => void escalateThread()}
                      disabled={isEscalating || !activeConversation}
                    >
                      {isEscalating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Escalating
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Create Support Ticket
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[18px] border border-dashed border-[#d8e0ed] bg-[#fbfcfe] px-4 py-5 text-[13px] leading-6 text-[#667084]">
                  Run the agent on the active thread to get a buyer-facing reply and an internal handoff note for the admin/support queue.
                </div>
              )}
            </div>
          </div>
          ) : null}
        </div>
      </SellerSurface>
    </div>
  );
}
