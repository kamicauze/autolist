"use client";

import { useId, useState, useTransition } from "react";
import { submitCorporateInquiry } from "@/lib/actions/corporate-inquiry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CorporateInquiryForm({ dark = false }: { dark?: boolean }) {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        setFeedback(null);
        startTransition(async () => {
          const result = await submitCorporateInquiry(email);
          setFeedback({ success: result.success, message: result.success ? result.message : result.error });
          if (result.success) setEmail("");
        });
      }}
    >
      <label htmlFor={emailId} className="sr-only">Your email address for advertising inquiries</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={emailId}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Your email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          maxLength={160}
          disabled={isPending}
          className={dark ? "h-11 border-[#2E2E38] bg-[#1C1C24] text-white placeholder:text-[#92929D]" : "h-11"}
        />
        <Button type="submit" disabled={isPending} className="h-11 bg-primary px-6 text-white hover:bg-primary/90">
          {isPending ? "Sending..." : "Send"}
        </Button>
      </div>
      <p className={dark ? "text-xs leading-5 text-[#92929D]" : "text-xs leading-5 text-gray-500"}>
        Leave your email so our sales team can contact you about advertising and partnerships.
      </p>
      {feedback ? (
        <p role={feedback.success ? "status" : "alert"} className={dark ? "text-sm text-white" : feedback.success ? "text-sm text-green-700" : "text-sm text-red-700"}>
          {feedback.message}
        </p>
      ) : null}
    </form>
  );
}
