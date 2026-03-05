"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WizardShell } from "@/components/seller/wizard-shell";
import { LISTING_WIZARD_STEPS } from "@/lib/constants/marketplace";
import { WizardProvider, useWizard } from "./wizard-context";
import { StepCategory } from "./step-category";
import { StepBasicInfo } from "./step-basic-info";
import { StepVehicleDetails } from "./step-vehicle-details";
import { StepFeatures } from "./step-features";
import { StepMedia } from "./step-media";
import { StepSeller } from "./step-seller";
import { StepPriceIntelligence } from "./step-price-intelligence";
import { StepReview } from "./step-review";

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
    isSubmitting,
    submitError,
    draft,
    handleContinue,
    handleBack,
  } = useWizard();

  const isLastStep = activeStep === LISTING_WIZARD_STEPS.length - 1;

  const footerMeta =
    activeStep === 3
      ? `${draft.selectedFeatureIds.length} features selected`
      : activeStep === 4
        ? `${(draft.coverImageName ? 1 : 0) + draft.galleryImageNames.length} photos attached`
        : `Step ${activeStep + 1} of ${LISTING_WIZARD_STEPS.length}`;

  if (submitted) {
    return (
      <section className="rounded-2xl border border-info/20 bg-gradient-to-br from-info/10 via-white to-primary/10 p-8">
        <div className="mx-auto max-w-2xl space-y-5 text-center">
          <Badge variant="info" className="mx-auto w-fit">Submitted Successfully</Badge>
          <h2 className="text-3xl font-bold text-foreground">Listing sent for moderation</h2>
          <p className="text-muted-foreground">
            Current status: <span className="font-semibold text-foreground">Pending Approval</span>.
            Listing becomes public after admin approval.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/dashboard/listings">View My Listings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const ActiveStep = STEP_COMPONENTS[activeStep];

  return (
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
            variant="ghost"
            disabled={activeStep === 0 || isSubmitting}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : isLastStep ? "Submit Listing" : "Continue"}
          </Button>
        </>
      }
    >
      {submitError && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold">Submission Error</p>
          <p className="mt-1">{submitError}</p>
        </div>
      )}
      {ActiveStep && <ActiveStep />}
    </WizardShell>
  );
}

export function ListingWizardV2() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}
