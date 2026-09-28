"use client";

import {
  LISTING_CATEGORY_OPTIONS,
  LISTING_CONDITION_OPTIONS,
  LISTING_FEATURE_GROUPS_BY_CATEGORY,
  LISTING_FEATURES_BY_CATEGORY,
} from "@/lib/constants/marketplace";
import * as React from "react";
import Image from "next/image";
import { FileText, PencilLine, PlayCircle } from "lucide-react";
import { Icon3D } from "@/components/ui/icon-3d";
import { getImageUrl } from "@/lib/utils/listings";
import { formatDetailSummaryValue, formatKES, useWizard, WIZARD_STEP } from "./wizard-context";
import { ListingQualityPanel } from "./listing-quality-panel";
import { StepSeller } from "./step-seller";

export const REVIEW_SECTION_STEPS = {
  vehicle: WIZARD_STEP.vehicle,
  features: WIZARD_STEP.features,
  media: WIZARD_STEP.media,
} as const;

const DIRECT_VIDEO_PATTERN = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;

function useObjectUrl(file: File | null) {
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);
  return url;
}

function MediaThumb({ src, alt, badge }: { src: string | null; alt: string; badge?: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-[#ededed] bg-[#f3f4f6]">
      {src ? <Image src={src} alt={alt} fill unoptimized sizes="200px" className="object-cover" /> : null}
      {badge ? (
        <span className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

function NewFileThumb({ file, badge }: { file: File; badge?: string }) {
  const url = useObjectUrl(file);
  return <MediaThumb src={url} alt={file.name} badge={badge} />;
}

function ReviewMedia() {
  const { draft, isEditing, galleryFiles, documentFiles, videoFile } = useWizard();
  const videoObjectUrl = useObjectUrl(videoFile);
  const usesExistingImages = isEditing && galleryFiles.length === 0;

  const coverIndex =
    draft.coverFromGalleryIndex !== null && galleryFiles[draft.coverFromGalleryIndex]
      ? draft.coverFromGalleryIndex
      : 0;
  const orderedNewFiles = galleryFiles.length
    ? [galleryFiles[coverIndex], ...galleryFiles.filter((_, index) => index !== coverIndex)]
    : [];
  const existingRefs = usesExistingImages
    ? [...(draft.coverImageRef ? [draft.coverImageRef] : []), ...draft.galleryImageRefs]
    : [];
  const imageCount = usesExistingImages ? existingRefs.length : orderedNewFiles.length;

  const videoSrc = videoObjectUrl ?? (DIRECT_VIDEO_PATTERN.test(draft.videoUrl) ? draft.videoUrl : null);
  const documents = documentFiles.length
    ? documentFiles.map((file) => file.name)
    : draft.documentNames;

  return (
    <div className="space-y-4 py-4">
      {imageCount > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {usesExistingImages
            ? existingRefs.map((ref, index) => (
                <MediaThumb
                  key={ref.r2_key}
                  src={getImageUrl(ref.r2_key, "card")}
                  alt={ref.alt_text || ref.name}
                  badge={index === 0 ? "Cover" : undefined}
                />
              ))
            : orderedNewFiles.map((file, index) => (
                <NewFileThumb
                  key={`${file.name}-${file.lastModified}`}
                  file={file}
                  badge={index === 0 ? "Cover" : undefined}
                />
              ))}
        </div>
      ) : (
        <p className="text-[13px] text-[#767676]">No photos added yet.</p>
      )}

      {videoSrc ? (
        <video
          src={videoSrc}
          controls
          preload="metadata"
          className="aspect-video w-full max-w-xl rounded-[12px] border border-[#ededed] bg-black"
        />
      ) : draft.videoUrl ? (
        <a
          href={draft.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-[12px] border border-[#ededed] bg-white px-3 py-2 text-[13px] font-semibold text-primary"
        >
          <PlayCircle className="h-4 w-4" aria-hidden />
          Watch linked video
        </a>
      ) : null}

      {documents.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {documents.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#ededed] bg-white px-3 py-2 text-[12px] font-medium text-[#202224]"
            >
              <Icon3D icon={FileText} tone="neutral" variant="glyph" />
              {name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

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
  onEdit,
  children,
}: {
  title: string;
  description: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-[#ededed] bg-[#faf9f7] p-4">
      <div className="border-b border-[#e7e7e7] pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-[18px] font-semibold text-[#202224]">{title}</h3>
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${title}`}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] border border-[#d9d9d9] bg-white px-3 text-[12px] font-semibold text-primary transition hover:border-primary hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <PencilLine className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </button>
        </div>
        <p className="mt-1 text-[13px] leading-5 text-[#767676]">{description}</p>
      </div>
      <div className="divide-y divide-[#ececec]">{children}</div>
    </section>
  );
}

export function StepReview() {
  const {
    draft,
    isEditing,
    selectedCategoryFields,
    goToStep,
    usesDealerLocation,
  } = useWizard();

  const categoryLabel =
    LISTING_CATEGORY_OPTIONS.find((item) => item.value === draft.category)?.label || "-";
  const conditionLabel = formatOptionLabel(draft.condition, LISTING_CONDITION_OPTIONS);
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
        : formatDetailValue(field.label, formatDetailSummaryValue(field, draft.details[field.key])),
  }));
  const editSection = (stepIndex: number) => {
    goToStep(stepIndex, { showValidationErrors: false });
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-[22px] font-semibold text-[#202224]">Review & Submit</h2>
        <p className="mt-1 text-[13px] leading-5 text-[#767676]">
          Check everything below before submitting. This mirrors what buyers and moderators will see.
        </p>
      </div>

      <SummarySection
        title="Vehicle & Price"
        description="Category, specifications and the public-facing price details."
        onEdit={() => editSection(REVIEW_SECTION_STEPS.vehicle)}
      >
        <SummaryRow label="Category" value={categoryLabel} />
        <SummaryRow label="Listing Title" value={draft.title || "-"} />
        <SummaryRow label="Condition" value={conditionLabel} />
        <SummaryRow label="Price" value={formatKES(draft.priceKes)} />
        <SummaryRow label="Negotiable" value={draft.negotiable ? "Yes" : "No"} />
        <SummaryRow label="Trade-In Accepted" value={draft.tradeInAccepted ? "Yes" : "No"} />
        <SummaryRow
          label="Location"
          value={
            usesDealerLocation
              ? "Your dealership location"
              : `${draft.locationArea || "-"}, ${draft.cityTown || "-"}, ${draft.country || "-"}`
          }
        />
        {detailRows.map((row) => (
          <SummaryRow key={row.label} label={row.label} value={row.value} />
        ))}
      </SummarySection>

      <SummarySection
        title="Features & Description"
        description="Equipment and buyer-facing copy shown on the listing page."
        onEdit={() => editSection(REVIEW_SECTION_STEPS.features)}
      >
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
        <SummaryRow
          label="Description"
          value={draft.description.trim() || "No description provided."}
        />
      </SummarySection>

      <SummarySection
        title="Photos & Media"
        description="Cover photo first, followed by the gallery, video and documents."
        onEdit={() => editSection(REVIEW_SECTION_STEPS.media)}
      >
        <ReviewMedia />
      </SummarySection>

      <StepSeller />

      <p className="rounded-[12px] border border-brand-muted-border bg-brand-soft-surface px-4 py-3 text-[13px] leading-5 text-[#475467]">
        {isEditing
          ? "Saving will update the existing listing. Existing gallery cover changes keep the same media files; uploading new media replaces the current media set."
          : "The listing will be sent for moderation and remain pending until it is approved."}
      </p>
      <ListingQualityPanel />
    </div>
  );
}
