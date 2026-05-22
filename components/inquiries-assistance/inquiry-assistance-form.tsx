"use client";

import * as React from "react";
import { Send } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[18px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700">I am a</span>
          <select
            value={form.roleType}
            onChange={(event) =>
              updateField("roleType", event.target.value as InquiryAssistanceInput["roleType"])
            }
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-primary focus:outline-none"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700">Full name</span>
          <Input
            value={form.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            placeholder="Your name"
            required
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700">Email</span>
          <Input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700">Phone</span>
          <Input
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="+254..."
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-gray-700">Subject</span>
        <Input
          value={form.subject}
          onChange={(event) => updateField("subject", event.target.value)}
          placeholder="How can we help?"
          required
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-gray-700">Message</span>
        <Textarea
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          placeholder="Share the details of your inquiry."
          required
          className="min-h-[160px]"
        />
      </label>

      {feedback ? (
        <div
          className={
            feedback.tone === "success"
              ? "rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              : "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {feedback.message}
        </div>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full gap-2 bg-primary text-white hover:bg-primary/90 sm:w-auto">
        <Send className="h-4 w-4" />
        {isPending ? "Sending..." : "Send inquiry"}
      </Button>
    </form>
  );
}
