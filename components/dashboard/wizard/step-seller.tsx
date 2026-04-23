"use client";

import { useWizard } from "./wizard-context";
import { sellerInputClass, sellerLabelClass, sellerSelectClass } from "../seller-dashboard-ui";

export function StepSeller() {
  const {
    draft,
    updateField,
    applyDealerAutofill,
    sellerValidationError,
    goToStep,
  } = useWizard();
  const sellerLocation = [draft.locationArea, draft.cityTown, draft.country]
    .filter((value) => value.trim().length > 0)
    .join(", ");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-heading text-[28px] font-semibold text-[#202224]">Seller Information</h2>
        <p className="mt-2 text-[14px] leading-6 text-[#767676]">
          Confirm the contact details buyers should use once this listing package is published.
        </p>
      </div>

      <div className="rounded-[24px] border border-[#ededed] bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.04)]">
        <label className="mb-5 flex items-center gap-3 text-[15px] text-[#202224]">
          <input
            type="checkbox"
            checked={draft.useDealerAutoFill}
            onChange={(event) => applyDealerAutofill(event.target.checked)}
            className="h-4 w-4 rounded border-[#c8c8c8]"
          />
          Use my saved account details (auto-fill for logged-in dealers or individuals)
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={sellerLabelClass}>Seller Type</label>
            <select
              value={draft.sellerType}
              onChange={(event) => {
                if (draft.useDealerAutoFill) {
                  applyDealerAutofill(false);
                }
                updateField("sellerType", event.target.value as "dealer" | "individual");
              }}
              className={sellerSelectClass}
            >
              <option value="dealer">Dealer</option>
              <option value="individual">Individual</option>
            </select>
          </div>
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
              onChange={(event) => updateField("phoneNumber", event.target.value)}
              className={sellerInputClass}
              placeholder="e.g., +254 712 345 678"
            />
          </div>
          <div>
            <label className={sellerLabelClass}>WhatsApp Number</label>
            <input
              value={draft.whatsappNumber}
              disabled={!draft.whatsappEnabled}
              onChange={(event) => updateField("whatsappNumber", event.target.value)}
              className={`${sellerInputClass} ${!draft.whatsappEnabled ? "bg-[#f6f6f6]" : ""}`}
              placeholder="e.g., +254 712 345 678"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-[#efefef] pt-5">
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

        <div className="mt-5 rounded-[18px] border border-[#e7edf6] bg-[#f8fbff] px-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                Seller Location
              </p>
              <p className="mt-2 text-[15px] font-medium text-[#202224]">
                {sellerLocation || "Seller location not set yet."}
              </p>
              <p className="mt-1 text-[13px] leading-6 text-[#667085]">
                This location comes from Listing Basics and powers the map and buyer-facing
                location context.
              </p>
            </div>

            <button
              type="button"
              onClick={() => goToStep(1, { showValidationErrors: true })}
              className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#d6dce8] bg-white px-4 text-[14px] font-semibold text-[#202224] transition hover:border-[#2563eb] hover:text-[#2563eb]"
            >
              Edit Location
            </button>
          </div>
        </div>
      </div>

      {sellerValidationError ? (
        <div className="rounded-[18px] border border-[#ffd9d6] bg-[#fff3f2] px-4 py-3 text-[14px] text-[#d92d20]">
          {sellerValidationError}
        </div>
      ) : null}
    </div>
  );
}
