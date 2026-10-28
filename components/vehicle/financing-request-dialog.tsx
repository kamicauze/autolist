"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FinancingRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  title: string;
  recipientName: string;
}

export function FinancingRequestDialog({
  open,
  onOpenChange,
  listingId,
  title,
  recipientName,
}: FinancingRequestDialogProps) {
  const id = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    if (!nextOpen) {
      setError("");
      setConfirmation("");
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/listings/${encodeURIComponent(listingId)}/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "financing",
          contactName: form.get("contactName"),
          contactPhone: form.get("contactPhone"),
          contactEmail: form.get("contactEmail"),
          monthlyIncome: form.get("monthlyIncome"),
          downPayment: form.get("downPayment"),
          message: form.get("message"),
        }),
      });
      const result = await response.json().catch(() => null) as { success?: boolean; error?: string; message?: string } | null;
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Unable to save your financing request. Please try again.");
      }
      setConfirmation(result.message || "Your financing request is saved in the seller's dashboard.");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to save your financing request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl border border-gray-200 p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-4">
          <DialogTitle className="text-xl font-bold text-gray-900">Request financing</DialogTitle>
          <DialogDescription className="break-words">{title}</DialogDescription>
        </DialogHeader>
        {confirmation ? (
          <div className="space-y-4 px-6 py-5">
            <p role="status" className="text-sm text-gray-700">{confirmation}</p>
            <Button type="button" className="w-full" onClick={() => handleOpenChange(false)}>Done</Button>
          </div>
        ) : (
          <form className="space-y-4 px-6 py-5" onSubmit={(event) => void handleSubmit(event)}>
            <p className="text-sm leading-5 text-gray-600">
              Your details will be shared with {recipientName} in their Autolist Messages and email notification, when available.
              This is an enquiry, not a loan application or approval.
            </p>
            {[
              { name: "contactName", label: "Full name", type: "text", maxLength: 120, autoComplete: "name" },
              { name: "contactPhone", label: "Phone number", type: "tel", maxLength: 40, autoComplete: "tel" },
              { name: "contactEmail", label: "Email address", type: "email", maxLength: 160, autoComplete: "email" },
            ].map(({ label, ...field }) => (
              <div key={field.name} className="space-y-1.5">
                <label htmlFor={`${id}-${field.name}`} className="block text-sm font-medium">{label}</label>
                <Input {...field} id={`${id}-${field.name}`} required disabled={isSubmitting} />
              </div>
            ))}
            {[
              { name: "monthlyIncome", label: "Monthly income (KES, optional)" },
              { name: "downPayment", label: "Preferred down payment (KES, optional)" },
            ].map((field) => (
              <div key={field.name} className="space-y-1.5">
                <label htmlFor={`${id}-${field.name}`} className="block text-sm font-medium">{field.label}</label>
                <Input id={`${id}-${field.name}`} name={field.name} inputMode="decimal" maxLength={30} pattern="\d+(\.\d{1,2})?" disabled={isSubmitting} />
              </div>
            ))}
            <div className="space-y-1.5">
              <label htmlFor={`${id}-message`} className="block text-sm font-medium">Additional details (optional)</label>
              <Textarea id={`${id}-message`} name="message" maxLength={2000} disabled={isSubmitting} className="min-h-[100px]" />
            </div>
            {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "Send request"}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
