"use client";

import { LISTING_AVAILABILITY_OPTIONS, LISTING_CATEGORY_OPTIONS, LISTING_CONDITION_OPTIONS, KENYA_CITIES } from "@/lib/constants/marketplace";
import { cn } from "@/lib/utils";
import { formatKES, formatPriceInput, MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, unformatPrice, useWizard } from "./wizard-context";
import { sellerInputClass, sellerLabelClass, sellerSelectClass, sellerTextareaClass } from "../seller-dashboard-ui";

export function StepBasicInfo() {
  const { draft, updateField, showValidationErrors } = useWizard();

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-[#ededed] bg-[#faf9f7] p-5">
        <h2 className="font-heading text-[28px] font-semibold text-[#202224]">Listing Basics</h2>
        <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#767676]">
          Add the headline information buyers need to identify and compare your vehicle quickly.
        </p>
      </div>

      <section className="space-y-5 rounded-[24px] border border-[#ededed] bg-white p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={sellerLabelClass}>Listing Title</label>
            <input
              value={draft.title}
              maxLength={MAX_TITLE_LENGTH}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="2019 Toyota Fielder TX"
              className={cn(
                sellerInputClass,
                showValidationErrors && !draft.title.trim() && "border-[#f04438]"
              )}
            />
            <p className="mt-2 text-[12px] text-[#8a8a8a]">
              {draft.title.length}/{MAX_TITLE_LENGTH}
            </p>
          </div>

          <div>
            <label className={sellerLabelClass}>Category</label>
            <div className="flex h-12 items-center rounded-[14px] border border-[#ededed] bg-[#faf9f7] px-4 text-[14px] font-medium text-[#202224]">
              {LISTING_CATEGORY_OPTIONS.find((item) => item.value === draft.category)?.label || "Not selected"}
            </div>
          </div>

          <div>
            <label className={sellerLabelClass}>Condition</label>
            <select
              value={draft.condition}
              onChange={(event) => updateField("condition", event.target.value as typeof draft.condition)}
              className={sellerSelectClass}
            >
              {LISTING_CONDITION_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={sellerLabelClass}>Price (KES)</label>
            <input
              value={formatPriceInput(draft.priceKes)}
              onChange={(event) => updateField("priceKes", unformatPrice(event.target.value))}
              inputMode="numeric"
              placeholder="2,450,000"
              className={cn(
                sellerInputClass,
                showValidationErrors && (!draft.priceKes || Number(draft.priceKes) <= 0) && "border-[#f04438]"
              )}
            />
            {draft.priceKes ? (
              <p className="mt-2 text-[12px] text-[#8a8a8a]">{formatKES(draft.priceKes)}</p>
            ) : null}
          </div>

          <div>
            <label className={sellerLabelClass}>Availability</label>
            <select
              value={draft.availability}
              onChange={(event) => updateField("availability", event.target.value as typeof draft.availability)}
              className={sellerSelectClass}
            >
              {LISTING_AVAILABILITY_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center gap-3 rounded-[16px] border border-[#ededed] bg-[#faf9f7] px-4 py-4 text-[14px] text-[#202224]">
            <input
              type="checkbox"
              checked={draft.negotiable}
              onChange={(event) => updateField("negotiable", event.target.checked)}
            />
            Negotiable
          </label>
          <div className="flex items-center rounded-[16px] border border-dashed border-[#dadada] px-4 py-4 text-[14px] text-[#8a8a8a]">
            Trade-in coming soon
          </div>
          <div className="flex items-center rounded-[16px] border border-dashed border-[#dadada] px-4 py-4 text-[14px] text-[#8a8a8a]">
            Bidding coming soon
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-[24px] border border-[#ededed] bg-white p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={sellerLabelClass}>Country</label>
            <select
              value={draft.country}
              onChange={(event) => updateField("country", event.target.value)}
              className={cn(sellerSelectClass, showValidationErrors && !draft.country && "border-[#f04438]")}
            >
              {["Kenya", "Uganda", "Tanzania", "Rwanda"].map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={sellerLabelClass}>City / Town</label>
            <select
              value={draft.cityTown}
              onChange={(event) => updateField("cityTown", event.target.value)}
              className={cn(sellerSelectClass, showValidationErrors && !draft.cityTown && "border-[#f04438]")}
            >
              <option value="">Select city</option>
              {KENYA_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={sellerLabelClass}>Location / Area</label>
            <input
              value={draft.locationArea}
              onChange={(event) => updateField("locationArea", event.target.value)}
              placeholder="Westlands"
              className={cn(
                sellerInputClass,
                showValidationErrors && !draft.locationArea.trim() && "border-[#f04438]"
              )}
            />
          </div>
        </div>

        <div className="rounded-[20px] border border-[#ededed] bg-[#f6f8fb] p-5">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7b8190]">Location Preview</p>
          <div className="mt-4 flex min-h-[180px] items-center justify-center rounded-[18px] border border-dashed border-[#d9dee8] bg-white text-center text-[14px] text-[#8a8fa0]">
            {draft.locationArea || draft.cityTown
              ? `${draft.locationArea || "Selected area"}, ${draft.cityTown || draft.country}`
              : "Map preview will appear once the location is fully configured."}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[24px] border border-[#ededed] bg-white p-5">
        <div>
          <label className={sellerLabelClass}>Description</label>
          <textarea
            value={draft.description}
            maxLength={MAX_DESCRIPTION_LENGTH}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Add relevant history, condition notes, ownership context, and selling points."
            className={cn(
              sellerTextareaClass,
              showValidationErrors && !draft.description.trim() && "border-[#f04438]"
            )}
          />
          <p className="mt-2 text-[12px] text-[#8a8a8a]">
            {draft.description.length}/{MAX_DESCRIPTION_LENGTH}
          </p>
        </div>
      </section>
    </div>
  );
}
