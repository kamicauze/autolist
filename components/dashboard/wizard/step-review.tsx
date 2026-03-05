"use client";

import { LISTING_CATEGORY_OPTIONS } from "@/lib/constants/marketplace";
import { useWizard, formatKES } from "./wizard-context";

export function StepReview() {
  const { draft } = useWizard();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Review & Submit</h2>
      <div className="grid gap-3 rounded-xl border border-border bg-white p-4 text-sm md:grid-cols-2">
        <div>
          <p className="text-muted-foreground">Listing Title</p>
          <p className="font-semibold text-foreground">{draft.title || "-"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Category</p>
          <p className="font-semibold text-foreground">
            {LISTING_CATEGORY_OPTIONS.find((o) => o.value === draft.category)?.label ?? "-"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Condition</p>
          <p className="font-semibold text-foreground">{draft.condition}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Price (KES)</p>
          <p className="font-semibold text-foreground">{formatKES(draft.priceKes)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Location</p>
          <p className="font-semibold text-foreground">
            {draft.locationArea || "-"}, {draft.cityTown || "-"}, {draft.country || "-"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Availability</p>
          <p className="font-semibold text-foreground">{draft.availability}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Features</p>
          <p className="font-semibold text-foreground">{draft.selectedFeatureIds.length} selected</p>
        </div>
        <div>
          <p className="text-muted-foreground">Media</p>
          <p className="font-semibold text-foreground">
            {draft.coverImageName ? "Cover ready" : "No cover"} &bull; {draft.galleryImageNames.length} gallery image(s)
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Contact Preferences</p>
          <p className="font-semibold text-foreground">
            {draft.whatsappEnabled ? "WhatsApp" : "No WhatsApp"} &bull; {draft.allowPhoneCalls ? "Phone calls allowed" : "No phone calls"}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Submission sends listing for administrative review. Status starts at Pending Approval.
      </p>
    </div>
  );
}
