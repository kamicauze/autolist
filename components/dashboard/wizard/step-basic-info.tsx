"use client";

import { useDeferredValue } from "react";
import { LISTING_CATEGORY_OPTIONS, LISTING_CONDITION_OPTIONS, KENYA_CITIES } from "@/lib/constants/marketplace";
import { cn } from "@/lib/utils";
import { formatKES, formatPriceInput, MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, unformatPrice, useWizard } from "./wizard-context";
import { sellerInputClass, sellerLabelClass, sellerSelectClass, sellerTextareaClass } from "../seller-dashboard-ui";
import { GoogleMapEmbed } from "@/components/maps/google-map-embed";
import { buildGoogleMapsQuery } from "@/lib/google-maps";
import { ListingCopyAssistant } from "./listing-copy-assistant";

export function StepBasicInfo({ googleMapsApiKey = "" }: { googleMapsApiKey?: string }) {
  const { draft, updateField, showValidationErrors } = useWizard();
  const locationPreview = buildGoogleMapsQuery([
    draft.locationArea,
    draft.cityTown,
    draft.country,
  ]);
  const deferredLocationPreview = useDeferredValue(locationPreview);

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-[#ededed] bg-[#faf9f7] p-4">
        <h2 className="font-heading text-[22px] font-semibold text-[#202224]">Listing Basics</h2>
        <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#767676]">
          Add the headline information buyers need to identify and compare your vehicle quickly.
        </p>
      </div>

      <section className="space-y-4 rounded-[14px] border border-[#ededed] bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={sellerLabelClass}>Listing Title</label>
            <input
              value={draft.title}
              maxLength={MAX_TITLE_LENGTH}
              readOnly
              placeholder="Generated from year, make, model, and trim"
              className={cn(
                `${sellerInputClass} bg-[#f7f8fb]`,
                showValidationErrors && !draft.title.trim() && "border-[#f04438]"
              )}
            />
            <p className="mt-2 text-[12px] text-[#8a8a8a]">
              Auto-filled from the vehicle details step. {draft.title.length}/{MAX_TITLE_LENGTH}
            </p>
          </div>

          <div>
            <label className={sellerLabelClass}>Category</label>
            <div className="flex h-12 items-center rounded-[14px] border border-[#ededed] bg-[#faf9f7] px-4 text-[14px] font-medium text-[#202224]">
              {draft.category === "car"
                ? "Cars & Vans"
                : LISTING_CATEGORY_OPTIONS.find((item) => item.value === draft.category)?.label || "Not selected"}
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

        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-[12px] border border-[#ededed] bg-[#faf9f7] px-4 py-3 text-[13px] text-[#202224]">
            <input
              type="checkbox"
              checked={draft.negotiable}
              onChange={(event) => updateField("negotiable", event.target.checked)}
            />
            Negotiable
          </label>
          <div className="rounded-[12px] border border-[#ededed] bg-[#faf9f7] px-4 py-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
              Trade-In Accepted
            </p>
            <div className="mt-3 flex gap-3">
              {[
                { label: "Yes", value: true },
                { label: "No", value: false },
              ].map((option) => {
                const active = draft.tradeInAccepted === option.value;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => updateField("tradeInAccepted", option.value)}
                    className={cn(
                    "inline-flex h-9 min-w-[78px] items-center justify-center rounded-[10px] border px-3 text-[13px] font-semibold transition",
                      active
                        ? "border-[#2563eb] bg-[#eef4ff] text-[#2563eb]"
                        : "border-[#d9d9d9] bg-white text-[#202224] hover:border-[#2563eb]"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[14px] border border-[#ededed] bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2">
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

        <div className="rounded-[14px] border border-[#ededed] bg-[#f6f8fb] p-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7b8190]">Location Preview</p>
          <div className="mt-3 overflow-hidden rounded-[12px] border border-dashed border-[#d9dee8] bg-white">
            {locationPreview ? (
              <div className="space-y-3 p-4">
                <p className="text-[14px] font-medium text-[#475467]">{locationPreview}</p>
                <div className="min-h-[160px] overflow-hidden rounded-[10px] border border-[#e4e7ec] bg-[#f6f8fb]">
                  <GoogleMapEmbed
                    apiKey={googleMapsApiKey}
                    query={deferredLocationPreview}
                    title="Listing location preview"
                    className="min-h-[160px]"
                    fallback={
                      <div className="flex min-h-[160px] items-center justify-center px-6 text-center text-[13px] text-[#8a8fa0]">
                        {locationPreview}
                      </div>
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="flex min-h-[140px] items-center justify-center px-6 text-center text-[13px] text-[#8a8fa0]">
                Map preview will appear once the location is fully configured.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-[14px] border border-[#ededed] bg-white p-4">
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

        <ListingCopyAssistant />
      </section>
    </div>
  );
}
