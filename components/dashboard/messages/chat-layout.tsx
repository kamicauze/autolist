"use client";

import * as React from "react";
import { Paperclip, Search, SendHorizontal, SmilePlus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  SellerPageHeader,
  SellerSurface,
  getInitials,
  sellerConversations,
  sellerMessages,
} from "../seller-dashboard-ui";

export function ChatLayout() {
  const [activeConversationId, setActiveConversationId] = React.useState("1");
  const [query, setQuery] = React.useState("");
  const [message, setMessage] = React.useState("");

  const conversations = sellerConversations.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );
  const activeConversation =
    sellerConversations.find((item) => item.id === activeConversationId) || sellerConversations[0];
  const activeMessages = sellerMessages[activeConversation.id] || [];

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Messages"
        description="Reply to buyer questions, send viewing details, and keep active deal conversations in one place."
      />

      <SellerSurface className="overflow-hidden">
        <div className="grid min-h-[740px] xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="border-b border-[#ededed] xl:border-b-0 xl:border-r">
            <div className="border-b border-[#ededed] p-5">
              <div className="flex h-12 items-center gap-3 rounded-[14px] border border-[#ededed] bg-white px-4">
                <Search className="h-4 w-4 text-[#939393]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search here..."
                  className="h-full flex-1 border-0 bg-transparent text-[14px] outline-none placeholder:text-[#9a9a9a]"
                />
              </div>
            </div>

            <div className="max-h-[640px] overflow-y-auto">
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
                      alt={conversation.name}
                      fallback={getInitials(conversation.name)}
                      size="md"
                      className="shrink-0 bg-[#eef4ff] text-[#2563eb]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[14px] font-semibold text-[#202224]">
                            {conversation.name}
                          </p>
                          <p className="mt-1 text-[12px] text-[#8a8a8a]">{conversation.listing}</p>
                        </div>
                        <p className="text-[11px] text-[#999]">{conversation.time}</p>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[#6f6f6f]">
                        {conversation.preview}
                      </p>
                    </div>
                    {conversation.unread > 0 ? (
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#2563eb] px-2 text-[11px] font-semibold text-white">
                        {conversation.unread}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex min-h-[640px] flex-col">
            <div className="flex items-center gap-3 border-b border-[#ededed] px-5 py-5">
              <Avatar
                alt={activeConversation.name}
                fallback={getInitials(activeConversation.name)}
                size="md"
                className="bg-[#eef4ff] text-[#2563eb]"
              />
              <div>
                <p className="text-[15px] font-semibold text-[#202224]">{activeConversation.name}</p>
                <p className="mt-1 text-[12px] text-[#7d7d7d]">{activeConversation.listing}</p>
              </div>
            </div>

            <div className="flex-1 space-y-4 bg-[#faf9f7] p-5">
              {activeMessages.map((item) => (
                <div
                  key={item.id}
                  className={`flex ${item.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-[22px] px-4 py-3 text-[14px] leading-6 ${
                      item.sender === "me"
                        ? "rounded-br-[8px] bg-[#edf3ff] text-[#202224]"
                        : "rounded-bl-[8px] bg-[#fff2e7] text-[#202224]"
                    }`}
                  >
                    <p>{item.text}</p>
                    <p className="mt-2 text-[11px] text-[#8d8d8d]">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#ededed] px-5 py-4">
              <div className="flex items-center gap-3 rounded-[20px] border border-[#ededed] bg-white px-4 py-3">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faf9f7] text-[#7f7f7f]">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faf9f7] text-[#7f7f7f]">
                  <SmilePlus className="h-4 w-4" />
                </button>
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write your message..."
                  className="h-10 flex-1 border-0 bg-transparent text-[14px] outline-none placeholder:text-[#9a9a9a]"
                />
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2563eb] text-white transition hover:bg-[#1d4ed8]">
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </SellerSurface>
    </div>
  );
}
