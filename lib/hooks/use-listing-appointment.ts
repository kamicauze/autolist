"use client";

import { useState } from "react";

type AppointmentPayload = {
  error?: string;
  success?: boolean;
  message?: string;
  appointmentId?: string;
};

async function readAppointmentPayload(response: Response): Promise<AppointmentPayload> {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as AppointmentPayload;
  } catch {
    return {};
  }
}

export function useListingAppointment({ listingId }: { listingId: string }) {
  const [message, setMessage] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitAppointment({ date, timeSlot }: { date: string; timeSlot: string }) {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/listings/${listingId}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          timeSlot,
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          buyerMessage: message.trim(),
        }),
      });
      const payload = await readAppointmentPayload(response);

      if (!response.ok) {
        throw new Error(payload.error || "Unable to save the appointment request.");
      }

      setFeedback(
        payload.message || "Request saved. The seller will review it and respond to you."
      );
      setMessage("");
      return true;
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Unable to save the appointment request."
      );
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
    submitAppointment,
  };
}
