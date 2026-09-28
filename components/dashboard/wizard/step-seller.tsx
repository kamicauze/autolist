"use client";

import * as React from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useWizard } from "./wizard-context";
import { MAX_PHONE_INPUT_LENGTH, normalizePhoneInput } from "@/lib/utils/phone";
import { sellerInputClass, sellerLabelClass, sellerSelectClass } from "../seller-dashboard-ui";

const NO_SALES_REP = "__none__";

function ContactFields() {
  const { draft, updateField } = useWizard();

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className={sellerLabelClass}>Contact Name</label>
          <input
            value={draft.contactName}
            onChange={(event) => updateField("contactName", event.target.value)}
            className={sellerInputClass}
            placeholder="e.g., John Doe"
          />
        </div>
        <div>
          <label className={sellerLabelClass}>Phone Number</label>
          <input
            value={draft.phoneNumber}
            maxLength={MAX_PHONE_INPUT_LENGTH}
            inputMode="tel"
            autoComplete="tel"
            onChange={(event) => updateField("phoneNumber", normalizePhoneInput(event.target.value))}
            className={sellerInputClass}
            placeholder="e.g., +254 712 345 678"
          />
        </div>
        <div>
          <label className={sellerLabelClass}>WhatsApp Number</label>
          <input
            value={draft.whatsappNumber}
            disabled={!draft.whatsappEnabled}
            maxLength={MAX_PHONE_INPUT_LENGTH}
            inputMode="tel"
            autoComplete="tel"
            onChange={(event) => updateField("whatsappNumber", normalizePhoneInput(event.target.value))}
            className={`${sellerInputClass} ${!draft.whatsappEnabled ? "bg-[#f6f6f6]" : ""}`}
            placeholder="e.g., +254 712 345 678"
          />
          {draft.whatsappEnabled ? (
            <button
              type="button"
              onClick={() => updateField("whatsappNumber", draft.phoneNumber)}
              disabled={!draft.phoneNumber}
              className="mt-2 inline-flex max-w-full items-center text-left text-[13px] font-semibold text-primary transition hover:text-brand-hover disabled:cursor-not-allowed disabled:text-[#98a2b3]"
            >
              Use the same number as phone
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#efefef] pt-4">
        <label className="flex items-center gap-2 text-[14px] text-[#202224]">
          <input
            type="checkbox"
            checked={draft.whatsappEnabled}
            onChange={(event) => updateField("whatsappEnabled", event.target.checked)}
            className="h-4 w-4 rounded border-[#c8c8c8]"
          />
          WhatsApp Enabled
        </label>
        <label className="flex items-center gap-2 text-[14px] text-[#202224]">
          <input
            type="checkbox"
            checked={draft.allowPhoneCalls}
            onChange={(event) => updateField("allowPhoneCalls", event.target.checked)}
            className="h-4 w-4 rounded border-[#c8c8c8]"
          />
          Allow Phone Calls
        </label>
        <label className="flex items-center gap-2 text-[14px] text-[#202224]">
          <input
            type="checkbox"
            checked={draft.hidePhoneNumber}
            onChange={(event) => updateField("hidePhoneNumber", event.target.checked)}
            className="h-4 w-4 rounded border-[#c8c8c8]"
          />
          Hide Phone Number
        </label>
      </div>
    </>
  );
}

export function StepSeller() {
  const { draft, updateField, sellerValidationError, isDealerSeller, salesReps, showValidationErrors } =
    useWizard();
  const [editingContact, setEditingContact] = React.useState(false);
  const showDealerContactForm = editingContact || (showValidationErrors && Boolean(sellerValidationError));

  const repOptions = React.useMemo(
    () => [
      { value: NO_SALES_REP, label: "No sales rep" },
      ...salesReps.map((rep) => ({
        value: rep.id,
        label: rep.name,
        icon: <UserRound className="h-4 w-4 shrink-0 text-[#8a8a8a]" aria-hidden />,
      })),
    ],
    [salesReps]
  );

  if (!isDealerSeller) {
    return (
      <section className="rounded-[14px] border border-[#ededed] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <h3 className="font-heading text-[18px] font-semibold text-[#202224]">Contact Details</h3>
        <p className="mb-4 mt-1 text-[13px] leading-5 text-[#767676]">
          How buyers reach you about this listing. Pre-filled from your account.
        </p>
        <ContactFields />
        {sellerValidationError ? (
          <p className="mt-4 text-[13px] font-medium text-[#d92d20]">{sellerValidationError}</p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="rounded-[14px] border border-[#ededed] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <h3 className="font-heading text-[18px] font-semibold text-[#202224]">Sales Rep</h3>
      <p className="mt-1 text-[13px] leading-5 text-[#767676]">
        Optional. Assign a rep from your dealership to handle enquiries for this listing.
      </p>

      <div className="mt-4 max-w-md">
        {salesReps.length > 0 ? (
          <SearchableSelect
            value={draft.assignedAgentId || NO_SALES_REP}
            onChange={(value) => updateField("assignedAgentId", value === NO_SALES_REP ? "" : value)}
            options={repOptions}
            placeholder="No sales rep"
            searchPlaceholder="Search sales reps"
            aria-label="Sales rep"
            className={sellerSelectClass}
          />
        ) : (
          <p className="rounded-[12px] border border-dashed border-[#d9dee8] bg-[#faf9f7] px-4 py-3 text-[13px] text-[#667085]">
            You have no active sales reps yet.{" "}
            <Link href="/dashboard/sales-agents" className="font-semibold text-primary hover:text-brand-hover">
              Invite a sales rep
            </Link>
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-[#efefef] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-[#667085]">
            Buyers contact{" "}
            <span className="font-semibold text-[#202224]">
              {[draft.contactName, draft.phoneNumber].filter(Boolean).join(" · ") || "your dealership"}
            </span>{" "}
            (from your dealer profile).
          </p>
          <button
            type="button"
            onClick={() => setEditingContact((current) => !current)}
            className="text-[13px] font-semibold text-primary transition hover:text-brand-hover"
          >
            {showDealerContactForm ? "Hide contact details" : "Edit contact details"}
          </button>
        </div>
        {showDealerContactForm ? (
          <div className="mt-4">
            <ContactFields />
          </div>
        ) : null}
        {sellerValidationError ? (
          <p className="mt-3 text-[13px] font-medium text-[#d92d20]">{sellerValidationError}</p>
        ) : null}
      </div>
    </section>
  );
}
