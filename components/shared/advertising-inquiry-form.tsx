"use client";

import { useId, useState, useTransition } from "react";
import { submitAdvertisingInquiry } from "@/lib/actions/corporate-inquiry";
import { advertisingBudgetRanges, advertisingBusinessTypes, advertisingPlacements } from "@/lib/validations/advertising-inquiry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdvertisingInquiryForm() {
  const id = useId();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const selectClass = "h-11 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <form className="space-y-5" onSubmit={(event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(form);
      const input = {
        companyName: data.get("companyName"), contactName: data.get("contactName"), jobTitle: data.get("jobTitle"),
        email: data.get("email"), phone: data.get("phone"), businessType: data.get("businessType"),
        placements: data.getAll("placements"), budgetRange: data.get("budgetRange"), message: data.get("message"),
      };
      setFeedback(null);
      startTransition(async () => {
        try {
          const result = await submitAdvertisingInquiry(input);
          setFeedback({ success: result.success, message: result.success ? result.message : result.error });
          if (result.success) form.reset();
        } catch {
          setFeedback({ success: false, message: "We couldn't send your request. Please try again or email sales@autolist.co.ke directly." });
        }
      });
    }}>
      <fieldset disabled={isPending} className="space-y-5 disabled:opacity-70">
        <legend className="sr-only">Company and campaign details</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { name: "companyName", label: "Company name", autoComplete: "organization", maxLength: 160 },
            { name: "contactName", label: "Contact person", autoComplete: "name", maxLength: 120 },
            { name: "jobTitle", label: "Job title", autoComplete: "organization-title", maxLength: 120 },
            { name: "email", label: "Email address", autoComplete: "email", maxLength: 160, type: "email" },
            { name: "phone", label: "Phone number", autoComplete: "tel", maxLength: 30, type: "tel" },
          ].map((field) => (
            <div key={field.name} className="space-y-2">
              <label htmlFor={`${id}-${field.name}`} className="block text-sm font-medium text-gray-900">{field.label} <span aria-hidden="true">*</span></label>
              <Input id={`${id}-${field.name}`} name={field.name} autoComplete={field.autoComplete} maxLength={field.maxLength} type={field.type || "text"} required className="h-11" />
            </div>
          ))}
          <div className="space-y-2">
            <label htmlFor={`${id}-businessType`} className="block text-sm font-medium text-gray-900">Business type <span aria-hidden="true">*</span></label>
            <select id={`${id}-businessType`} name="businessType" required defaultValue="" className={selectClass}>
              <option value="" disabled>Select your business type</option>
              {advertisingBusinessTypes.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
        </div>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-gray-900">Placements of interest (optional)</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {advertisingPlacements.map((placement) => (
              <label key={placement} className="flex items-start gap-2 text-sm leading-5 text-gray-700">
                <input type="checkbox" name="placements" value={placement} className="mt-1 h-4 w-4 shrink-0 accent-primary" />
                {placement}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="space-y-2">
          <label htmlFor={`${id}-budgetRange`} className="block text-sm font-medium text-gray-900">Monthly budget range (optional)</label>
          <select id={`${id}-budgetRange`} name="budgetRange" defaultValue="" className={selectClass}>
            <option value="">Select a budget range</option>
            {advertisingBudgetRanges.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor={`${id}-message`} className="block text-sm font-medium text-gray-900">Additional message (optional)</label>
          <textarea id={`${id}-message`} name="message" rows={4} maxLength={2000} className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
        </div>
        <p className="text-xs leading-5 text-gray-500">Fields marked * are required. Our sales team will use these details to respond to your advertising inquiry.</p>
        <Button type="submit" disabled={isPending} className="h-11">{isPending ? "Sending..." : "Request My Media Kit"}</Button>
      </fieldset>
      {feedback ? <p role={feedback.success ? "status" : "alert"} className={feedback.success ? "text-sm text-green-700" : "text-sm text-red-700"}>{feedback.message}</p> : null}
    </form>
  );
}
