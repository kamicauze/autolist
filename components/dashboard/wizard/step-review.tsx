"use client";

import {
  LISTING_CATEGORY_OPTIONS,
  LISTING_CONDITION_OPTIONS,
  LISTING_FEATURE_GROUPS_BY_CATEGORY,
  LISTING_FEATURES_BY_CATEGORY,
} from "@/lib/constants/marketplace";
import { formatKES, useWizard } from "./wizard-context";
import { ListingQualityPanel } from "./listing-quality-panel";

function formatOptionLabel(
  value: string,
  options: ReadonlyArray<{ value: string; label: string }>
) {
  return options.find((option) => option.value === value)?.label || value || "-";
}

function formatDetailValue(label: string, value: string) {
  if (!value.trim()) return "-";
  if (label.toLowerCase().includes("year")) return value;
  if (label.toLowerCase().includes("(km)")) {
    return new Intl.NumberFormat("en-KE").format(Number(value));
  }
  return value;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 py-2.5 md:grid-cols-[190px_minmax(0,1fr)] md:gap-3">
      <p className="text-[13px] font-medium text-[#7a7a7a]">{label}</p>
      <p className="text-[13px] font-semibold leading-5 text-[#202224]">{value}</p>
    </div>
  );
}

function SummarySection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-[#ededed] bg-[#faf9f7] p-4">
      <div className="border-b border-[#e7e7e7] pb-3">
        <h3 className="font-heading text-[18px] font-semibold text-[#202224]">{title}</h3>
        <p className="mt-1 text-[13px] leading-5 text-[#767676]">{description}</p>
      </div>
      <div className="divide-y divide-[#ececec]">{children}</div>
    </section>
  );
}

export function StepReview() {
  const { draft, isEditing, selectedCategoryFields, marketIndicator, videoFile } = useWizard();

  const categoryLabel =
    LISTING_CATEGORY_OPTIONS.find((item) => item.value === draft.category)?.label || "-";
  const conditionLabel = formatOptionLabel(draft.condition, LISTING_CONDITION_OPTIONS);
  const hasCoverImage = Boolean(draft.coverImageName || draft.coverFromGalleryIndex !== null);
  const selectedFeatureGroups = draft.category
    ? LISTING_FEATURES_BY_CATEGORY[draft.category]
    : null;
  const selectedFeatureGroupDefinition = draft.category
    ? LISTING_FEATURE_GROUPS_BY_CATEGORY[draft.category]
    : null;
  const featureLabelById = new Map(
    selectedFeatureGroupDefinition
      ? selectedFeatureGroupDefinition.order.flatMap((groupKey) =>
          (selectedFeatureGroups?.[groupKey] ?? []).map((feature) => [feature.id, feature.label] as const)
        )
      : []
  );
  const selectedFeatureLabels = draft.selectedFeatureIds.map(
    (featureId) => featureLabelById.get(featureId) || featureId
  );
  const detailRows = selectedCategoryFields.map((field) => ({
    label: field.label,
    value:
      field.type === "select" && field.options
        ? formatOptionLabel(draft.details[field.key], field.options)
        : formatDetailValue(field.label, draft.details[field.key]),
  }));
  const mediaSummary = [
    `Cover image: ${
      draft.coverImageName
        ? draft.coverImageName
        : draft.coverFromGalleryIndex !== null
          ? `Selected from gallery item ${draft.coverFromGalleryIndex + 1}`
          : "Not selected"
    }`,
    `Gallery images: ${draft.galleryImageNames.length}`,
    `Documents: ${draft.documentNames.length}`,
    `Video: ${videoFile ? `Upload ready (${videoFile.name})` : draft.videoUrl || "Not provided"}`,
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-[22px] font-semibold text-[#202224]">Review & Submit</h2>
        <p className="mt-1 text-[13px] leading-5 text-[#767676]">
          Review the full listing package below. This summary mirrors what will be submitted for
          moderation and helps you catch gaps before the listing goes live.
        </p>
      </div>

      <SummarySection
        title="Listing Basics"
        description="Primary public-facing details for the listing card and vehicle page."
      >
        <SummaryRow label="Listing Title" value={draft.title || "-"} />
        <SummaryRow label="Category" value={categoryLabel} />
        <SummaryRow label="Condition" value={conditionLabel} />
        <SummaryRow label="Price" value={formatKES(draft.priceKes)} />
        <SummaryRow label="Negotiable" value={draft.negotiable ? "Yes" : "No"} />
        <SummaryRow label="Trade-In Accepted" value={draft.tradeInAccepted ? "Yes" : "No"} />
        <SummaryRow
          label="Location"
          value={`${draft.locationArea || "-"}, ${draft.cityTown || "-"}, ${draft.country || "-"}`}
        />
        <SummaryRow
          label="Description"
          value={draft.description.trim() || "No description provided."}
        />
      </SummarySection>

      <SummarySection
        title="Vehicle / Equipment Details"
        description="Category-specific technical details captured from the dynamic form."
      >
        {detailRows.length > 0 ? (
          detailRows.map((row) => (
            <SummaryRow key={row.label} label={row.label} value={row.value} />
          ))
        ) : (
          <SummaryRow label="Details" value="No category-specific details captured." />
        )}
      </SummarySection>

      <SummarySection
        title="Features & Specifications"
        description="All selected feature IDs that will strengthen the listing detail page."
      >
        <SummaryRow
          label="Feature Count"
          value={`${draft.selectedFeatureIds.length} selected`}
        />
        <div className="py-4">
          {selectedFeatureLabels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedFeatureLabels.map((featureLabel) => (
                <span
                  key={featureLabel}
                  className="rounded-full border border-[#d8e3ff] bg-white px-3 py-1.5 text-[12px] font-medium text-primary"
                >
                  {featureLabel}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-[#767676]">No features selected.</p>
          )}
        </div>
      </SummarySection>

      <SummarySection
        title="Media & Documents"
        description="Assets attached to the listing, including cover, gallery, documents, and video."
      >
        <SummaryRow label="Cover Status" value={hasCoverImage ? "Cover ready" : "No cover selected"} />
        <SummaryRow label="Gallery Images" value={draft.galleryImageNames.join(", ") || "No gallery images uploaded"} />
        <SummaryRow label="Documents" value={draft.documentNames.join(", ") || "No documents attached"} />
        <SummaryRow
          label="Video"
          value={videoFile ? `${videoFile.name} (will upload on submit)` : draft.videoUrl || "No video attached"}
        />
        <SummaryRow label="Asset Summary" value={mediaSummary.join(" • ")} />
      </SummarySection>

      <SummarySection
        title="Seller Information"
        description="Contact and visibility preferences buyers will see when reaching out."
      >
        <SummaryRow
          label="Seller Type"
          value={draft.sellerType === "dealer" ? "Dealer" : "Individual"}
        />
        <SummaryRow
          label="Account Autofill"
          value={draft.useDealerAutoFill ? "Using saved account details" : "Manual entry"}
        />
        <SummaryRow
          label="Seller Location"
          value={`${draft.locationArea || "-"}, ${draft.cityTown || "-"}, ${draft.country || "-"}`}
        />
        <SummaryRow label="Contact Name" value={draft.contactName || "-"} />
        <SummaryRow label="Phone Number" value={draft.phoneNumber || "-"} />
        <SummaryRow
          label="WhatsApp"
          value={draft.whatsappEnabled ? draft.whatsappNumber || "-" : "Disabled"}
        />
        <SummaryRow
          label="Contact Preferences"
          value={[
            draft.whatsappEnabled ? "WhatsApp enabled" : "WhatsApp disabled",
            draft.allowPhoneCalls ? "Phone calls allowed" : "Phone calls disabled",
            draft.hidePhoneNumber ? "Phone number hidden" : "Phone number visible",
          ].join(" • ")}
        />
      </SummarySection>

      <SummarySection
        title="Price Intelligence & Submission"
        description="Current market signal and what will happen after the listing is submitted."
      >
        <SummaryRow label="Market Position" value={marketIndicator.label} />
        <SummaryRow label="Market Note" value={marketIndicator.note} />
        <SummaryRow
          label="Submission Outcome"
          value={
            isEditing
              ? "Saving will update the existing listing. Existing gallery cover changes keep the same media files; uploading new media replaces the current media set."
              : "The listing will be sent for moderation and remain pending until it is approved."
          }
        />
      </SummarySection>
      <ListingQualityPanel />
    </div>
  );
}
