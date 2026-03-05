"use client";

import * as React from "react";
import { Search, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  time: string;
}

const CONTACTS: Contact[] = [
  { id: "1", name: "John Mwangi", lastMessage: "Is the Toyota Prado still available?", time: "2m ago", unread: 2 },
  { id: "2", name: "Sarah Kamau", lastMessage: "What's the lowest price you can do?", time: "1h ago", unread: 0 },
  { id: "3", name: "David Ochieng", lastMessage: "Can I come for a test drive tomorrow?", time: "3h ago", unread: 1 },
  { id: "4", name: "Mary Wanjiku", lastMessage: "Thanks for the quick response!", time: "1d ago", unread: 0 },
  { id: "5", name: "Peter Otieno", lastMessage: "I'm interested in the BMW X3", time: "2d ago", unread: 0 },
];

const MESSAGES: Record<string, Message[]> = {
  "1": [
    { id: "1", text: "Hi, I saw your listing for the 2022 Toyota Prado TX", sender: "them", time: "10:30 AM" },
    { id: "2", text: "Is it still available?", sender: "them", time: "10:30 AM" },
    { id: "3", text: "Yes, it's still available! Would you like to schedule a viewing?", sender: "me", time: "10:35 AM" },
    { id: "4", text: "That would be great. When are you free this week?", sender: "them", time: "10:38 AM" },
  ],
};

export function ChatLayout() {
  const [selectedContact, setSelectedContact] = React.useState<string>("1");
  const [message, setMessage] = React.useState("");
  const [search, setSearch] = React.useState("");

  const messages = MESSAGES[selectedContact] || [];
  const contact = CONTACTS.find((c) => c.id === selectedContact);

  const filteredContacts = search
    ? CONTACTS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : CONTACTS;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground">Chat with buyers and sellers</p>
      </div>

      <div className="flex h-[600px] overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        {/* Contact List */}
        <div className="w-80 shrink-0 border-r border-border">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 text-sm"
              />
            </div>
          </div>
          <div className="overflow-y-auto">
            {filteredContacts.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedContact(c.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-border px-3 py-3 text-left transition-colors hover:bg-gray-50",
                  selectedContact === c.id && "bg-primary/5"
                )}
              >
                <Avatar alt={c.name} size="sm" fallback={c.name.split(" ").map((n) => n[0]).join("")} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{c.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                </div>
                {c.unread > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex flex-1 flex-col">
          {/* Chat Header */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Avatar alt={contact?.name || ""} size="sm" fallback={contact?.name?.split(" ").map((n) => n[0]).join("") || "?"} />
            <div>
              <p className="text-sm font-semibold text-foreground">{contact?.name}</p>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.sender === "me" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2",
                  msg.sender === "me"
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-gray-100 text-foreground rounded-bl-sm"
                )}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={cn("mt-1 text-[10px]", msg.sender === "me" ? "text-white/70" : "text-muted-foreground")}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && message.trim()) {
                    setMessage("");
                  }
                }}
              />
              <Button size="icon" disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
