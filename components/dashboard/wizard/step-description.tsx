"use client";

import { LISTING_FEATURE_INDEX } from "@/lib/constants/marketplace";
import { cn } from "@/lib/utils";
import { sellerLabelClass, sellerTextareaClass } from "../seller-dashboard-ui";
import { ListingCopyAssistant } from "./listing-copy-assistant";
import { MAX_DESCRIPTION_LENGTH, useWizard } from "./wizard-context";

export function StepDescription() {
  const { draft, updateField, showValidationErrors } = useWizard();
  const selectedFeatures = draft.selectedFeatureIds
    .map((featureId) => LISTING_FEATURE_INDEX[featureId]?.label ?? featureId)
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-[#ededed] bg-[#faf9f7] p-4">
        <h2 className="font-heading text-[22px] font-semibold text-[#202224]">Listing Description</h2>
        <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#767676]">
          Turn the selected features and vehicle details into buyer-facing copy.
        </p>
      </div>

      <section className="space-y-4 rounded-[14px] border border-[#ededed] bg-white p-4">
        <div className="rounded-[14px] border border-brand-muted-border bg-brand-soft-surface px-4 py-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            Feature context ready
          </p>
          <p className="mt-2 text-[13px] leading-5 text-[#61708a]">
            {selectedFeatures.length > 0
              ? `${selectedFeatures.length} selected feature${selectedFeatures.length === 1 ? "" : "s"} will be passed into the AI description generator.`
              : "Select at least one feature in the previous step to strengthen the generated description."}
          </p>
        </div>

        <div>
          <label className={sellerLabelClass}>Description</label>
          <textarea
            value={draft.description}
            maxLength={MAX_DESCRIPTION_LENGTH}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Add relevant history, condition notes, ownership context, and selling points."
            className={cn(
              sellerTextareaClass,
              "min-h-[180px]",
              showValidationErrors && !draft.description.trim() && "border-[#f04438]"
            )}
          />
          <p className="mt-2 text-[12px] text-[#8a8a8a]">
            {draft.description.length}/{MAX_DESCRIPTION_LENGTH}
          </p>
        </div>

        <ListingCopyAssistant features={selectedFeatures} />
      </section>
    </div>
  );
}
