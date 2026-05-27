"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface UseListingEnquiryOptions {
  listingId: string;
  initialMessage?: string;
  redirectPath?: string;
}

type EnquiryPayload = {
  error?: string;
  success?: boolean;
  message?: string;
  threadId?: string;
};

async function readEnquiryPayload(response: Response): Promise<EnquiryPayload> {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as EnquiryPayload;
  } catch {
    return {};
  }
}

export function useListingEnquiry({
  listingId,
  initialMessage = "",
  redirectPath,
}: UseListingEnquiryOptions) {
  const router = useRouter();
  const [message, setMessage] = useState(initialMessage);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
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
        body: JSON.stringify({
          message: trimmed,
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
        }),
      });

      const payload = await readEnquiryPayload(response);

      if (response.status === 401) {
        setFeedback("Sign in to send enquiries. After login, we will bring you back to this listing.");
        const nextPath = redirectPath || `/vehicle/${listingId}`;
        router.push(`/login?next=${encodeURIComponent(nextPath)}`);
        return false;
      }

      if (!response.ok) {
        throw new Error(payload.error || "Unable to send enquiry.");
      }

      setFeedback(payload.message || "Enquiry sent to the seller and saved under Messages.");
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
    contactName,
    contactEmail,
    contactPhone,
    setContactName,
    setContactEmail,
    setContactPhone,
    setFeedback,
    setMessage,
    submitEnquiry,
  };
}
