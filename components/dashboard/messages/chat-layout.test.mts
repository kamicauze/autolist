import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mock, test } from "node:test";
import type { MessagingViewer, ThreadListItem } from "@/lib/types/messaging";

mock.module("next/navigation", { namedExports: { useSearchParams: () => new URLSearchParams() } });
mock.module("@/lib/actions/messaging-refresh", { namedExports: { refreshMessagingCenter: async () => null } });
const { ChatLayout } = await import("./chat-layout");

function renderConversation(
  overrides: Partial<ThreadListItem> = {},
  role: MessagingViewer["role"] = "seller",
) {
  return renderToStaticMarkup(createElement(ChatLayout, { initialData: {
    viewer: { id: "viewer", role, email: null, fullName: null },
    threads: [{
      id: "thread", listingId: "listing", listingTitle: "Sample vehicle",
      counterpartName: "Sample enquirer", counterpartEmail: null,
      counterpartPhone: "+254 (700) 000-001", counterpartWhatsapp: null, isGuest: true,
      status: "open", source: "listing", subject: null,
      lastMessageAt: "2026-11-06T12:00:00Z", lastMessageSenderId: null,
      lastMessagePreview: null, ticketCount: 0, openTicketCount: 0,
      ...overrides,
    }],
    messagesByThread: {},
  } }));
}

test("a seller can call the number already shown for a guest enquirer", () => {
  const html = renderConversation();
  assert.match(html, /href="tel:\+254700000001"/);
  assert.match(html, />\+254 \(700\) 000-001<\/a>/);
});

test("phone links exclude unsupported values and contacts outside seller-side guest enquiries", () => {
  const unsupported = renderConversation({ counterpartPhone: "+254700000001;ext=9" });
  assert.match(unsupported, /\+254700000001;ext=9/);
  assert.doesNotMatch(unsupported, /href="tel:/);
  assert.doesNotMatch(renderConversation({ isGuest: false }), /href="tel:/);
  assert.doesNotMatch(renderConversation({}, "buyer"), /href="tel:/);
});
