"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WizardShell } from "@/components/seller/wizard-shell";
import { LISTING_WIZARD_STEPS } from "@/lib/constants/marketplace";
import type { Listing } from "@/lib/types/listing";
import { WizardProvider, useWizard } from "./wizard-context";
import { StepBasicInfo } from "./step-basic-info";
import { StepCategory } from "./step-category";
import { StepDescription } from "./step-description";
import { StepFeatures } from "./step-features";
import { StepMedia } from "./step-media";
import { StepPriceIntelligence } from "./step-price-intelligence";
import { StepReview } from "./step-review";
import { StepSeller } from "./step-seller";
import { StepVehicleDetails } from "./step-vehicle-details";

const STEP_COMPONENTS = [
  StepCategory,
  StepVehicleDetails,
  StepBasicInfo,
  StepFeatures,
  StepDescription,
  StepMedia,
  StepSeller,
  StepPriceIntelligence,
  StepReview,
];

type ListingWizardMode = "seller" | "admin";

function WizardContent({
  googleMapsApiKey,
  mode,
}: {
  googleMapsApiKey: string;
  mode: ListingWizardMode;
}) {
  const {
    isEditing,
    editingListingId,
    activeStep,
    submitted,
    autoApproved,
    isSubmitting,
    submitError,
    submitIssues,
    stepCompletion,
    draft,
    videoFile,
    packageAccess,
    isLoadingPackageAccess,
    packageAccessError,
    resetDraft,
    handleContinue,
    handleBack,
    goToStep,
  } = useWizard();

  const isLastStep = activeStep === LISTING_WIZARD_STEPS.length - 1;
  const isAdminMode = mode === "admin";

  const footerMeta =
      activeStep === 3
      ? `${draft.selectedFeatureIds.length} features selected`
      : activeStep === 5
        ? `${(draft.coverImageName ? 1 : 0) + draft.galleryImageNames.length + draft.documentNames.length + (videoFile || draft.videoUrl ? 1 : 0)} media files added`
        : `Step ${activeStep + 1} of ${LISTING_WIZARD_STEPS.length}`;

  const packageBanner = isAdminMode
    ? null
    : isEditing
    ? null
    : isLoadingPackageAccess
      ? {
          title: "Checking your seller package",
          description: "Loading plan access and listing capacity before this draft can be published.",
          buttonLabel: "Checking...",
          buttonHref: "/dashboard/membership",
          buttonDisabled: true,
          wrapperClass: "border border-[#dbe8ff] bg-[#f5f9ff]",
          iconClass: "bg-[#eef4ff] text-[#2563eb]",
          buttonClass: "bg-[#2563eb] text-white",
        }
      : packageAccessError
        ? {
            title: "Package access unavailable",
            description: packageAccessError,
            buttonLabel: "Open Membership",
            buttonHref: "/dashboard/membership",
            buttonDisabled: false,
            wrapperClass: "border border-[#ffe2b8] bg-[#fff7ed]",
            iconClass: "bg-[#ffedd5] text-[#ea580c]",
            buttonClass: "bg-[#ea580c] text-white hover:bg-[#c2410c]",
          }
        : !packageAccess?.hasActivePlan
          ? {
              title: "You don't have any active package",
              description:
                "Finish the listing details first, then activate the seller package needed to publish this vehicle publicly. The first package activation on a seller account runs free for 6 months.",
              buttonLabel: "Get Package",
              buttonHref: "/dashboard/membership",
              buttonDisabled: false,
              wrapperClass: "border border-[#ffd9d6] bg-[#fff3f2]",
              iconClass: "bg-[#ffe4e2] text-[#f04438]",
              buttonClass: "bg-[#f04438] text-white hover:bg-[#d92d20]",
            }
          : !packageAccess.canCreateListing
            ? {
                title: `${packageAccess.currentPlan?.name || "Current"} package limit reached`,
                description:
                  packageAccess.listingLimit === null
                    ? "Manage your package details before publishing this listing."
                    : `You are already using ${packageAccess.usedListings} of ${packageAccess.listingLimit} listing slots. Upgrade or switch package to publish another listing.`,
                buttonLabel: "Upgrade Package",
                buttonHref: "/dashboard/membership",
                buttonDisabled: false,
                wrapperClass: "border border-[#ffe2b8] bg-[#fff7ed]",
                iconClass: "bg-[#ffedd5] text-[#ea580c]",
                buttonClass: "bg-[#ea580c] text-white hover:bg-[#c2410c]",
              }
            : {
                title: `${packageAccess.currentPlan?.name || "Seller"} package active`,
                description:
                  packageAccess.remainingListings === null
                    ? "Unlimited listing access is active on this account. Finish the steps below and submit when ready."
                    : `${packageAccess.remainingListings} listing slot${packageAccess.remainingListings === 1 ? "" : "s"} remaining on this account. Finish the steps below and submit when ready.`,
                buttonLabel: "Manage Package",
                buttonHref: "/dashboard/membership",
                buttonDisabled: false,
                wrapperClass: "border border-[#dbe8ff] bg-[#f5f9ff]",
                iconClass: "bg-[#eef4ff] text-[#2563eb]",
                buttonClass: "bg-[#2563eb] text-white hover:bg-[#1d4ed8]",
              };

  if (submitted) {
    return (
      <section className="space-y-6">
        <div className="rounded-[28px] border border-[#dbe8ff] bg-white p-8 text-center shadow-[0_14px_44px_rgba(15,23,42,0.05)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-heading text-[34px] font-semibold text-[#202224]">
            {isEditing ? "Listing updated" : autoApproved ? "Your listing is live" : "Listing submitted"}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-6 text-[#6e6e6e]">
            {isEditing
              ? isAdminMode
                ? "The admin update has been saved. The seller will see the refreshed listing data and the notification in their workspace."
                : "Your changes have been saved. Public listing pages and seller dashboard views will refresh with the updated data."
              : autoApproved
              ? "The seller dashboard has published your package immediately and buyers can view it now."
              : "Your package has been sent for review. It will appear publicly as soon as the moderation team approves it."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={isAdminMode ? "/admin/listings" : "/dashboard/listings"}
              className="inline-flex h-12 items-center justify-center rounded-[14px] bg-[#2563eb] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              {isAdminMode ? "Back to Admin Listings" : "View My Listings"}
            </Link>
            <Link
              href={isAdminMode && editingListingId ? `/vehicle/${editingListingId}` : "/dashboard"}
              className="inline-flex h-12 items-center justify-center rounded-[14px] border border-[#d9d9d9] bg-white px-5 text-[14px] font-semibold text-[#202224] transition hover:border-[#2563eb] hover:text-[#2563eb]"
            >
              {isAdminMode ? "View Listing" : "Back to Dashboard"}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const ActiveStep = STEP_COMPONENTS[activeStep];

  return (
    <div className="space-y-4">
      {packageBanner ? (
        <div className={`rounded-[14px] p-4 ${packageBanner.wrapperClass}`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${packageBanner.iconClass}`}>
                <PackageOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading text-[20px] font-semibold text-[#202224]">
                  {packageBanner.title}
                </h2>
                <p className="mt-1 text-[13px] leading-5 text-[#706c6a]">
                  {packageBanner.description}
                </p>
              </div>
            </div>

            <Link
              href={packageBanner.buttonHref}
              aria-disabled={packageBanner.buttonDisabled}
              className={[
                "inline-flex h-10 items-center gap-2 rounded-[10px] px-4 text-[13px] font-semibold transition",
                packageBanner.buttonClass,
                packageBanner.buttonDisabled ? "pointer-events-none opacity-60" : "",
              ].join(" ")}
            >
              {packageBanner.buttonLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}

      <WizardShell
        title={isEditing ? (isAdminMode ? "Admin Listing Edit" : "Edit Listing") : "Add Listing"}
        description={isEditing ? (isAdminMode ? "Update the listing details, media, and seller-facing status from the admin workspace." : "Update the saved listing details and publish the latest changes.") : "Unified listing form for all vehicle categories."}
        headerAction={
          !isEditing && !isAdminMode ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-[10px] border-[#d9d9d9] px-3 text-[13px] text-[#202224] hover:border-[#2563eb] hover:bg-white hover:text-[#2563eb]"
              onClick={() => {
                if (window.confirm("Clear the saved draft and start this listing from scratch?")) {
                  resetDraft();
                }
              }}
            >
              Start Fresh
            </Button>
          ) : null
        }
        steps={LISTING_WIZARD_STEPS}
        activeStep={activeStep}
        stepMeta={stepCompletion.map((complete) => ({ complete }))}
        compact
        onStepSelect={
          isSubmitting
            ? undefined
            : (stepIndex) => goToStep(stepIndex, { showValidationErrors: false })
        }
        footerMeta={footerMeta}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-[10px] border-[#d9d9d9] px-4 text-[13px] text-[#202224] hover:border-[#2563eb] hover:bg-white hover:text-[#2563eb]"
              disabled={activeStep === 0 || isSubmitting}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              type="button"
              className="h-10 rounded-[10px] bg-[#2563eb] px-4 text-[13px] text-white hover:bg-[#1d4ed8]"
              onClick={handleContinue}
              disabled={isSubmitting}
            >
              {isSubmitting ? (isEditing ? "Saving..." : "Submitting...") : isLastStep ? (isEditing ? "Save Changes" : "Submit Listing") : "Next Step"}
            </Button>
          </>
        }
      >
        {submitError ? (
          <div className="mb-5 rounded-[18px] border border-[#ffd9d6] bg-[#fff3f2] px-4 py-4 text-[14px] text-[#d92d20]">
            <p className="font-semibold text-[#d92d20]">Submission Error</p>
            <p className="mt-1">{submitError}</p>
            {submitIssues.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-[13px] leading-6 text-[#b42318]">
                {submitIssues.map((issue) => (
                  <li key={`${issue.stepIndex ?? "none"}-${issue.message}`}>
                    {issue.stepIndex === null ? (
                      issue.message
                    ) : (
                      <button
                        type="button"
                        onClick={() => goToStep(issue.stepIndex!, { showValidationErrors: true })}
                        className="text-left underline decoration-[#f04438]/45 underline-offset-2 hover:text-[#9f1239]"
                      >
                        {issue.message}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {activeStep === 2 ? (
          <StepBasicInfo googleMapsApiKey={googleMapsApiKey} />
        ) : ActiveStep ? (
          <ActiveStep />
        ) : null}
      </WizardShell>
    </div>
  );
}

export function ListingWizardV2({
  initialListing,
  googleMapsApiKey = "",
  mode = "seller",
}: {
  initialListing?: Listing | null;
  googleMapsApiKey?: string;
  mode?: ListingWizardMode;
}) {
  return (
    <WizardProvider initialListing={initialListing}>
      <WizardContent googleMapsApiKey={googleMapsApiKey} mode={mode} />
    </WizardProvider>
  );
}
