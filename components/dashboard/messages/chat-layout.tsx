"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  ChevronDown,
  Loader2,
  MessageSquareText,
  Search,
  SendHorizontal,
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

type ConversationTab = "all" | "unread" | "other";

const OTHER_THREAD_STATUSES = new Set(["resolved", "closed", "escalated"]);

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

function formatStatusLabel(value: string) {
  const labels: Record<string, string> = {
    open: "Open",
    waiting_on_buyer: "Waiting on buyer",
    waiting_on_seller: "Waiting on seller",
    escalated: "Needs review",
    resolved: "Resolved",
    closed: "Closed",
  };

  return labels[value] || value.replace(/_/g, " ");
}

function isUnreadThread(thread: ThreadListItem, messages: ThreadMessageItem[]) {
  const latest = messages[messages.length - 1];
  if (latest) {
    return latest.senderRole === "them";
  }

  return Boolean(thread.lastMessageSenderId);
}

export function ChatLayout({ initialData }: ChatLayoutProps) {
  const searchParams = useSearchParams();
  const composerRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<ConversationTab>("all");
  const [threads, setThreads] = React.useState<ThreadListItem[]>(initialData?.threads || []);
  const [messagesByThread, setMessagesByThread] = React.useState<Record<string, ThreadMessageItem[]>>(
    initialData?.messagesByThread || {}
  );
  const [activeConversationId, setActiveConversationId] = React.useState(initialData?.threads[0]?.id || "");
  const [message, setMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);
  const [agentResult, setAgentResult] = React.useState<CommsAgentResult | null>(null);
  const [isAgentLoading, setIsAgentLoading] = React.useState(false);
  const [agentError, setAgentError] = React.useState<string | null>(null);
  const [isAgentOpen, setIsAgentOpen] = React.useState(false);

  const viewer = initialData?.viewer || null;
  const loadError = initialData?.error || null;
  const canUseSellerAgent = viewer?.role === "seller" || viewer?.role === "dealer";
  const roleDescription =
    viewer?.role === "buyer"
      ? "Track seller replies and keep listing conversations moving without leaving the app."
      : "Use live buyer conversations, review listing context, and draft grounded replies when needed.";

  const searchedConversations = threads.filter((item) => {
    const search = query.toLowerCase();
    return (
      item.counterpartName.toLowerCase().includes(search) ||
      item.listingTitle.toLowerCase().includes(search) ||
      (item.lastMessagePreview || "").toLowerCase().includes(search)
    );
  });

  const unreadCount = searchedConversations.filter((item) =>
    isUnreadThread(item, messagesByThread[item.id] || [])
  ).length;
  const otherCount = searchedConversations.filter((item) => OTHER_THREAD_STATUSES.has(item.status)).length;
  const conversations = searchedConversations.filter((item) => {
    if (activeTab === "unread") {
      return isUnreadThread(item, messagesByThread[item.id] || []);
    }

    if (activeTab === "other") {
      return OTHER_THREAD_STATUSES.has(item.status);
    }

    return true;
  });

  const activeConversation =
    conversations.find((item) => item.id === activeConversationId) ||
    conversations[0] ||
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

  function applyReplyDraft() {
    if (!agentResult) return;

    setMessage(agentResult.suggestedReply);
    setSendError(null);

    requestAnimationFrame(() => {
      composerRef.current?.focus();
      const nextLength = agentResult.suggestedReply.length;
      composerRef.current?.setSelectionRange(nextLength, nextLength);
    });
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
                lastMessageSenderId: nextMessage.senderId,
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

  if (!viewer) {
    return (
      <div className="space-y-6 lg:space-y-7">
        <SellerPageHeader
          title="Messages"
          description={
            loadError
              ? "Messaging is unavailable until the account profile and conversation access issue is resolved."
              : "Sign in to access buyer and seller conversations."
          }
        />
        <SellerSurface className="p-6 text-[14px] text-[#5f6a7e]">
          {loadError || "Messaging is available after authentication."}
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

      {loadError ? (
        <SellerSurface className="border border-[#fecdca] bg-[#fef3f2] p-4 text-[14px] text-[#b42318]">
          {loadError}
        </SellerSurface>
      ) : null}

      <SellerSurface className="overflow-hidden">
        <div
          className={`grid min-h-[740px] ${
            canUseSellerAgent && isAgentOpen
              ? "xl:grid-cols-[340px_minmax(0,1fr)_360px]"
              : "xl:grid-cols-[340px_minmax(0,1fr)]"
          }`}
        >
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
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { key: "all", label: "All", count: searchedConversations.length },
                  { key: "unread", label: "Unread", count: unreadCount },
                  { key: "other", label: "Other", count: otherCount },
                ].map((tab) => {
                  const active = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key as ConversationTab)}
                      className={`h-9 rounded-full text-[12px] font-semibold transition ${
                        active
                          ? "bg-[#2563eb] text-white"
                          : "bg-[#f3f6fb] text-[#667085] hover:bg-[#e9eef8]"
                      }`}
                    >
                      {tab.label}
                      <span className={active ? "ml-1 text-white/80" : "ml-1 text-[#98a2b3]"}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="max-h-[640px] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="px-5 py-8 text-[13px] text-[#6f6f6f]">No conversations found.</div>
              ) : null}
              {conversations.map((conversation) => {
                const active = conversation.id === activeConversationId;
                const unread = isUnreadThread(conversation, messagesByThread[conversation.id] || []);
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
                          <div className="flex items-center gap-2">
                            {unread ? <span className="h-2 w-2 rounded-full bg-[#2563eb]" /> : null}
                            <p className="text-[14px] font-semibold text-[#202224]">
                              {conversation.counterpartName}
                            </p>
                          </div>
                          <p className="mt-1 text-[12px] font-medium text-[#475467]">{conversation.listingTitle}</p>
                        </div>
                        <p className="text-[11px] text-[#999]">{formatRelativeTimestamp(conversation.lastMessageAt)}</p>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[#6f6f6f]">
                        {conversation.lastMessagePreview || "No messages yet."}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#f2f4f7] px-2 py-1 text-[11px] font-medium text-[#667085]">
                          {formatStatusLabel(conversation.status)}
                        </span>
                        {unread ? (
                          <span className="rounded-full bg-[#eaf1ff] px-2 py-1 text-[11px] font-medium text-[#1d4ed8]">
                            unread
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
                <div className="border-b border-[#ededed] px-5 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <Avatar
                        alt={activeConversation.counterpartName}
                        fallback={getInitials(activeConversation.counterpartName)}
                        size="md"
                        className="bg-[#eef4ff] text-[#2563eb]"
                      />
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-[#202224]">
                          {activeConversation.counterpartName}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[#667085]">
                          <span>{viewer.role === "buyer" ? "Seller" : "Enquirer"}</span>
                          <span className="h-1 w-1 rounded-full bg-[#cbd5e1]" />
                          <span>{formatStatusLabel(activeConversation.status)}</span>
                        </div>
                      </div>
                    </div>

                    {canUseSellerAgent ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 shrink-0 rounded-[14px]"
                        onClick={() => setIsAgentOpen((open) => !open)}
                      >
                        <Bot className="mr-2 h-4 w-4" />
                        AI Assist
                        <ChevronDown className={`ml-2 h-4 w-4 transition ${isAgentOpen ? "rotate-180" : ""}`} />
                      </Button>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 rounded-[18px] border border-[#e7edf6] bg-[#f8fbff] p-4 text-[13px] text-[#475467] md:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                        Listing
                      </p>
                      <Link
                        href={`/vehicle/${activeConversation.listingId}`}
                        className="mt-1 block truncate text-[14px] font-semibold text-[#2563eb] hover:underline"
                      >
                        {activeConversation.listingTitle}
                      </Link>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                        {viewer.role === "buyer" ? "Seller details" : "Enquirer details"}
                      </p>
                      <div className="mt-1 space-y-1">
                        <p className="truncate font-semibold text-[#202224]">{activeConversation.counterpartName}</p>
                        {activeConversation.counterpartEmail ? (
                          <p className="truncate">{activeConversation.counterpartEmail}</p>
                        ) : null}
                        {activeConversation.counterpartPhone ? (
                          <p>{activeConversation.counterpartPhone}</p>
                        ) : null}
                        {activeConversation.counterpartWhatsapp ? (
                          <p>WhatsApp: {activeConversation.counterpartWhatsapp}</p>
                        ) : null}
                        {!activeConversation.counterpartEmail &&
                        !activeConversation.counterpartPhone &&
                        !activeConversation.counterpartWhatsapp ? (
                          <p>Contact details not provided.</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
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
                  <div className="flex items-end gap-3 rounded-[20px] border border-[#ededed] bg-white px-4 py-3">
                    <textarea
                      ref={composerRef}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Write your message..."
                      rows={message ? Math.min(Math.max(message.split("\n").length, 2), 6) : 2}
                      className="min-h-[44px] flex-1 resize-none border-0 bg-transparent py-2 text-[14px] leading-6 outline-none placeholder:text-[#9a9a9a]"
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

          {canUseSellerAgent && isAgentOpen ? (
          <div className="bg-[#fcfdff] p-5">
            <div className="rounded-[22px] border border-[#e4e9f2] bg-white p-5">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="h-4 w-4" />
                Buyer Comms Agent
              </p>
              <h3 className="mt-2 text-[21px] font-semibold text-[#202224]">
                Draft replies with thread context
              </h3>
              <p className="mt-2 text-[14px] leading-6 text-[#667084]">
                The agent reads the active thread and listing context, then suggests a buyer-facing reply and seller follow-up checklist.
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
                    onClick={applyReplyDraft}
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
                </div>
              ) : (
                <div className="mt-5 rounded-[18px] border border-dashed border-[#d8e0ed] bg-[#fbfcfe] px-4 py-5 text-[13px] leading-6 text-[#667084]">
                  Run the agent on the active thread to get a buyer-facing reply and a practical seller checklist.
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
