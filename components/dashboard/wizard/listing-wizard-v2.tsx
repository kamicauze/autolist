"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WizardShell } from "@/components/seller/wizard-shell";
import { LISTING_WIZARD_STEPS } from "@/lib/constants/marketplace";
import { WizardProvider, useWizard } from "./wizard-context";
import { StepBasicInfo } from "./step-basic-info";
import { StepCategory } from "./step-category";
import { StepFeatures } from "./step-features";
import { StepMedia } from "./step-media";
import { StepPriceIntelligence } from "./step-price-intelligence";
import { StepReview } from "./step-review";
import { StepSeller } from "./step-seller";
import { StepVehicleDetails } from "./step-vehicle-details";

const STEP_COMPONENTS = [
  StepCategory,
  StepBasicInfo,
  StepVehicleDetails,
  StepFeatures,
  StepMedia,
  StepSeller,
  StepPriceIntelligence,
  StepReview,
];

function WizardContent() {
  const {
    activeStep,
    submitted,
    autoApproved,
    isSubmitting,
    submitError,
    submitErrorDetails,
    draft,
    handleContinue,
    handleBack,
  } = useWizard();

  const isLastStep = activeStep === LISTING_WIZARD_STEPS.length - 1;

  const footerMeta =
    activeStep === 3
      ? `${draft.selectedFeatureIds.length} features selected`
      : activeStep === 4
        ? `${(draft.coverImageName ? 1 : 0) + draft.galleryImageNames.length} media files added`
        : `Step ${activeStep + 1} of ${LISTING_WIZARD_STEPS.length}`;

  if (submitted) {
    return (
      <section className="space-y-6">
        <div className="rounded-[28px] border border-[#dbe8ff] bg-white p-8 text-center shadow-[0_14px_44px_rgba(15,23,42,0.05)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-heading text-[34px] font-semibold text-[#202224]">
            {autoApproved ? "Your listing is live" : "Listing submitted"}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-6 text-[#6e6e6e]">
            {autoApproved
              ? "The seller dashboard has published your package immediately and buyers can view it now."
              : "Your package has been sent for review. It will appear publicly as soon as the moderation team approves it."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard/listings"
              className="inline-flex h-12 items-center justify-center rounded-[14px] bg-[#2563eb] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              View My Listings
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-[14px] border border-[#d9d9d9] bg-white px-5 text-[14px] font-semibold text-[#202224] transition hover:border-[#2563eb] hover:text-[#2563eb]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const ActiveStep = STEP_COMPONENTS[activeStep];

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-[#ffd9d6] bg-[#fff3f2] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffe4e2] text-[#f04438]">
              <PackageOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-[24px] font-semibold text-[#202224]">
                You don&apos;t have any active package
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-[#706c6a]">
                Finish the listing details first, then attach or purchase the seller package needed
                to publish it publicly.
              </p>
            </div>
          </div>

          <button className="inline-flex h-12 items-center gap-2 rounded-[14px] bg-[#f04438] px-5 text-[14px] font-semibold text-white transition hover:bg-[#d92d20]">
            Get Package
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <WizardShell
        title="Add Listing"
        description="Unified listing form for all vehicle categories."
        steps={LISTING_WIZARD_STEPS}
        activeStep={activeStep}
        footerMeta={footerMeta}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-[14px] border-[#d9d9d9] px-5 text-[#202224] hover:border-[#2563eb] hover:bg-white hover:text-[#2563eb]"
              disabled={activeStep === 0 || isSubmitting}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              type="button"
              className="h-12 rounded-[14px] bg-[#2563eb] px-5 text-white hover:bg-[#1d4ed8]"
              onClick={handleContinue}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : isLastStep ? "Submit Listing" : "Next Step"}
            </Button>
          </>
        }
      >
        {submitError ? (
          <div className="mb-5 rounded-[18px] border border-[#ffd9d6] bg-[#fff3f2] px-4 py-4 text-[14px] text-[#d92d20]">
            <p className="font-semibold text-[#d92d20]">Submission Error</p>
            <p className="mt-1">{submitError}</p>
            {submitErrorDetails.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-[13px] leading-6 text-[#b42318]">
                {submitErrorDetails.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {ActiveStep ? <ActiveStep /> : null}
      </WizardShell>
    </div>
  );
}

export function ListingWizardV2() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}
