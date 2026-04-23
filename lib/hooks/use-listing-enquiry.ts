"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface UseListingEnquiryOptions {
  listingId: string;
  initialMessage?: string;
  redirectPath?: string;
}

async function readEnquiryPayload(response: Response) {
  const text = await response.text();
  if (!text) {
    return {} as { error?: string; success?: boolean };
  }

  try {
    return JSON.parse(text) as { error?: string; success?: boolean };
  } catch {
    return {} as { error?: string; success?: boolean };
  }
}

export function useListingEnquiry({
  listingId,
  initialMessage = "",
  redirectPath,
}: UseListingEnquiryOptions) {
  const router = useRouter();
  const [message, setMessage] = useState(initialMessage);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitEnquiry() {
    const trimmed = message.trim();
    if (!trimmed) {
      setFeedback("Write a message before sending.");
      return false;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/listings/${listingId}/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const payload = await readEnquiryPayload(response);

      if (response.status === 401) {
        const nextPath = redirectPath || `/vehicle/${listingId}`;
        router.push(`/login?next=${encodeURIComponent(nextPath)}`);
        return false;
      }

      if (!response.ok) {
        throw new Error(payload.error || "Unable to send enquiry.");
      }

      setFeedback("Message sent. You can continue this conversation in Messages.");
      setMessage("");
      return true;
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to send enquiry.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    feedback,
    isSubmitting,
    message,
    setFeedback,
    setMessage,
    submitEnquiry,
  };
}
