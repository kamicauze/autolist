"use client";

import * as React from "react";
import { Mail, Phone, Send } from "lucide-react";
import {
  submitInquiryAssistanceRequest,
  type InquiryAssistanceInput,
} from "@/lib/actions/inquiries-assistance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const roleOptions: Array<{ value: InquiryAssistanceInput["roleType"]; label: string }> = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "dealer", label: "Dealer" },
  { value: "other", label: "Other" },
];
const MESSAGE_LIMIT = 2000;

export function InquiryAssistanceForm() {
  const [form, setForm] = React.useState<InquiryAssistanceInput>({
    roleType: "buyer",
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [feedback, setFeedback] = React.useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function updateField<K extends keyof InquiryAssistanceInput>(
    key: K,
    value: InquiryAssistanceInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await submitInquiryAssistanceRequest(form);

      if (!result.success) {
        setFeedback({ tone: "error", message: result.error });
        return;
      }

      setFeedback({ tone: "success", message: result.message });
      setForm({
        roleType: "buyer",
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-7 lg:px-9">
      <h2 id="inquiry-form-heading" className="text-2xl font-bold tracking-tight sm:text-[28px]">
        Send us a message
      </h2>
      <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-foreground">I am a</span>
          <select
            value={form.roleType}
            onChange={(event) =>
              updateField("roleType", event.target.value as InquiryAssistanceInput["roleType"])
            }
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-foreground">Full name</span>
          <Input
            value={form.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className="h-10"
            required
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-foreground">Email</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="h-10 pl-9"
              required
            />
          </div>
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-foreground">Phone</span>
          <div className="relative">
            <Phone className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+254..."
              autoComplete="tel"
              className="h-10 pl-9"
            />
          </div>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">Subject</span>
        <Input
          value={form.subject}
          onChange={(event) => updateField("subject", event.target.value)}
          placeholder="How can we help?"
          className="h-10"
          required
        />
      </label>

      <div className="space-y-1.5">
        <label htmlFor="inquiry-message" className="block text-sm font-semibold text-foreground">Message</label>
        <Textarea
          id="inquiry-message"
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          placeholder="Tell us how we can help…"
          maxLength={MESSAGE_LIMIT}
          aria-describedby="inquiry-message-limit"
          required
          className="min-h-24"
        />
        <span id="inquiry-message-limit" className="sr-only">Maximum {MESSAGE_LIMIT} characters.</span>
        <span aria-hidden="true" className="block text-right text-xs tabular-nums text-muted-foreground">
          {form.message.length} / {MESSAGE_LIMIT}
        </span>
      </div>

      {feedback ? (
        <div
          role={feedback.tone === "error" ? "alert" : "status"}
          className={
            feedback.tone === "success"
              ? "rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              : "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {feedback.message}
        </div>
      ) : null}

      <Button type="submit" disabled={isPending} className="h-11 w-full gap-2 rounded-xl text-base">
        <Send className="h-4 w-4" />
        {isPending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
