"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  ChevronLeft,
  Gauge,
  Handshake,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCarModels } from "@/hooks/use-car-models";
import { uploadFilesToPresignedTargets } from "@/lib/client/listing-media-upload";
import {
  isAcceptedListingMediaContentType,
  LISTING_IMAGE_MAX_BYTES,
  toListingMediaUploadReference,
  type ListingMediaUploadDescriptor,
} from "@/lib/listing-media-upload";
import { cn } from "@/lib/utils";

type DealerSaleFormState = {
  saleChannel: "dealer_only" | "dealer_public";
  year: string;
  make: string;
  model: string;
  variant: string;
  fuelType: string;
  transmission: string;
  mileage: string;
  expectedPrice: string;
  marketCondition: "" | "Brand new" | "Locally used" | "Foreign used";
  condition: string;
  serviceHistory: string;
  ownershipDuration: string;
  financed: string;
  warranty: string;
  documents: string;
  registration: string;
  city: string;
  fullName: string;
  phone: string;
  email: string;
  notes: string;
};

type Feedback = {
  tone: "success" | "error";
  message: string;
};

type WizardStepId = "route" | "vehicle" | "condition" | "photos" | "contact";

const currentYear = new Date().getFullYear();
const MIN_PHOTOS = 5;
const MAX_PHOTOS = 20;
const years = Array.from({ length: currentYear - 1949 }, (_, index) =>
  String(currentYear - index),
);

const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric"];
const transmissions = ["Automatic", "Manual"];
const conditions = ["Excellent", "Good", "Below average", "Poor"];
const serviceHistoryOptions = ["Full with dealer", "Full", "Partial", "None"];
const ownershipDurations = [
  "0-6 months",
  "6-12 months",
  "1-2 years",
  "2-5 years",
  "5+ years",
];
const yesNoOptions = ["Yes", "No"];

const initialForm: DealerSaleFormState = {
  saleChannel: "dealer_public",
  year: "",
  make: "",
  model: "",
  variant: "",
  fuelType: "",
  transmission: "",
  mileage: "",
  expectedPrice: "",
  marketCondition: "",
  condition: "Good",
  serviceHistory: "",
  ownershipDuration: "",
  financed: "",
  warranty: "",
  documents: "",
  registration: "",
  city: "",
  fullName: "",
  phone: "",
  email: "",
  notes: "",
};

const processSteps = [
  {
    title: "Vehicle info",
    description: "Tell us what you are selling.",
    icon: Gauge,
  },
  {
    title: "Dealer match",
    description: "We route it to relevant buyers.",
    icon: Handshake,
  },
  {
    title: "Dealer delivery",
    description: "Publish the request to approved dealers.",
    icon: BadgeCheck,
  },
];

const saleChannelOptions: Array<{
  value: DealerSaleFormState["saleChannel"];
  title: string;
  description: string;
}> = [
  {
    value: "dealer_public",
    title: "Dealer offers + public listing",
    description:
      "Send the car to dealers now and submit it for normal public-listing review.",
  },
  {
    value: "dealer_only",
    title: "Dealer offers only",
    description:
      "Start with dealer offers and keep the car off the public marketplace.",
  },
];

const wizardSteps: Array<{
  id: WizardStepId;
  title: string;
  eyebrow: string;
}> = [
  { id: "route", title: "Selling route", eyebrow: "Step 1" },
  { id: "vehicle", title: "Vehicle info", eyebrow: "Step 2" },
  { id: "condition", title: "Condition and ownership", eyebrow: "Step 3" },
  { id: "photos", title: "Vehicle photos", eyebrow: "Step 4" },
  { id: "contact", title: "Contact details", eyebrow: "Step 5" },
];

function updateFormField<K extends keyof DealerSaleFormState>(
  setter: React.Dispatch<React.SetStateAction<DealerSaleFormState>>,
  key: K,
  value: DealerSaleFormState[K],
) {
  setter((current) => ({ ...current, [key]: value }));
}

function FieldShell({
  label,
  required,
  helper,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-gray-800">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {helper ? (
        <p className="text-xs leading-relaxed text-gray-500">{helper}</p>
      ) : null}
    </div>
  );
}

function SelectField({
  label,
  value,
  onValueChange,
  placeholder,
  options,
  required,
  disabled,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: string[];
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <FieldShell label={label} required={required}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="h-11 border-gray-200 bg-white text-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

function SegmentedField({
  label,
  value,
  options,
  onChange,
  required,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <FieldShell label={label} required={required}>
      <div
        className={cn(
          "grid grid-cols-2 gap-2",
          options.length > 2 && "sm:grid-cols-4",
        )}
      >
        {options.map((option) => {
          const isSelected = value === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "min-h-11 rounded-lg border px-3 text-sm font-semibold transition active:scale-[0.98]",
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </FieldShell>
  );
}

export function DealerSaleForm({ makes }: { makes: string[] }) {
  const [form, setForm] = React.useState<DealerSaleFormState>(initialForm);
  const [photos, setPhotos] = React.useState<File[]>([]);
  const [currentStep, setCurrentStep] = React.useState<WizardStepId>("route");
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);
  const [isPending, setIsPending] = React.useState(false);
  const [submissionStage, setSubmissionStage] = React.useState<string | null>(
    null,
  );
  const [completedListingId, setCompletedListingId] = React.useState<
    string | null
  >(null);
  const [completedChannel, setCompletedChannel] = React.useState<
    DealerSaleFormState["saleChannel"] | null
  >(null);
  const requestIdRef = React.useRef<string | null>(null);
  const { models, isLoading: modelsLoading } = useCarModels(form.make || null);
  const canTypeModel = Boolean(
    form.make && !modelsLoading && models.length === 0,
  );
  const currentStepIndex = wizardSteps.findIndex(
    (step) => step.id === currentStep,
  );
  const currentStepMeta = wizardSteps[currentStepIndex] ?? wizardSteps[0];
  const isLastStep = currentStep === "contact";

  React.useEffect(() => {
    setForm((current) => ({ ...current, model: "" }));
  }, [form.make]);

  const completedVehicleFields = [
    form.saleChannel,
    form.year,
    form.make,
    form.model,
    form.fuelType,
    form.transmission,
    form.mileage,
    form.expectedPrice,
    form.marketCondition,
    form.condition,
    form.serviceHistory,
    form.ownershipDuration,
    form.financed,
    form.warranty,
    form.documents,
  ].filter(Boolean).length;
  const completedPhotoCount = Math.min(photos.length, MIN_PHOTOS);

  function setField<K extends keyof DealerSaleFormState>(
    key: K,
    value: DealerSaleFormState[K],
  ) {
    updateFormField(setForm, key, value);
  }

  function getMissingFieldMessage(
    fields: Array<[keyof DealerSaleFormState, string]>,
  ) {
    const missingFields = fields.filter(([key]) => !form[key].trim());

    if (missingFields.length === 0) return null;

    return `Please complete: ${missingFields.map(([, label]) => label).join(", ")}.`;
  }

  function validateStep(stepId: WizardStepId) {
    if (stepId === "route") return null;

    if (stepId === "vehicle") {
      const missingMessage = getMissingFieldMessage([
        ["year", "Year"],
        ["make", "Make"],
        ["model", "Model"],
        ["fuelType", "Fuel type"],
        ["transmission", "Gearbox"],
        ["mileage", "Estimated mileage"],
        ["expectedPrice", "Expected price"],
        ["marketCondition", "Marketplace condition"],
      ]);

      if (missingMessage) return missingMessage;

      const mileageValue = Number(form.mileage.replace(/[,\s]/g, ""));
      if (!Number.isFinite(mileageValue) || mileageValue <= 0) {
        return "Enter a valid mileage so dealers can price the vehicle correctly.";
      }

      const priceValue = Number(form.expectedPrice.replace(/[,\s]/g, ""));
      if (!Number.isFinite(priceValue) || priceValue <= 0) {
        return "Enter a valid expected price in Kenya shillings.";
      }

      return null;
    }

    if (stepId === "condition") {
      return getMissingFieldMessage([
        ["serviceHistory", "Service history"],
        ["ownershipDuration", "Ownership duration"],
        ["financed", "Vehicle finance status"],
        ["warranty", "Warranty status"],
        ["documents", "Ownership documents"],
      ]);
    }

    if (stepId === "photos") {
      if (photos.length < MIN_PHOTOS) {
        return `Upload at least ${MIN_PHOTOS} vehicle photos before continuing.`;
      }

      return null;
    }

    if (stepId === "contact") {
      return getMissingFieldMessage([
        ["city", "City or town"],
        ["fullName", "Full name"],
        ["phone", "Phone number"],
      ]);
    }

    return null;
  }

  function getFirstInvalidStep() {
    for (const step of wizardSteps) {
      const validationError = validateStep(step.id);
      if (validationError) return { stepId: step.id, error: validationError };
    }

    return null;
  }

  function goToStep(stepId: WizardStepId) {
    setFeedback(null);
    setCurrentStep(stepId);
  }

  function handleNextStep() {
    setFeedback(null);
    const validationError = validateStep(currentStep);
    if (validationError) {
      setFeedback({ tone: "error", message: validationError });
      return;
    }

    const nextStep = wizardSteps[currentStepIndex + 1];
    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
  }

  function handleBackStep() {
    setFeedback(null);
    const previousStep = wizardSteps[currentStepIndex - 1];
    if (previousStep) {
      setCurrentStep(previousStep.id);
    }
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []);
    const invalidType = selectedFiles.find(
      (file) => !isAcceptedListingMediaContentType("image", file.type),
    );
    if (invalidType) {
      setFeedback({
        tone: "error",
        message: `"${invalidType.name}" must be a JPG, PNG, or WebP image.`,
      });
      return;
    }
    const oversized = selectedFiles.find(
      (file) => file.size > LISTING_IMAGE_MAX_BYTES,
    );
    if (oversized) {
      setFeedback({
        tone: "error",
        message: `"${oversized.name}" exceeds the 10MB image limit.`,
      });
      return;
    }
    if (selectedFiles.length > MAX_PHOTOS) {
      setFeedback({
        tone: "error",
        message: `Choose up to ${MAX_PHOTOS} vehicle photos.`,
      });
      return;
    }
    setFeedback(null);
    setPhotos(selectedFiles);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const invalidStep = getFirstInvalidStep();
    if (invalidStep) {
      setCurrentStep(invalidStep.stepId);
      setFeedback({ tone: "error", message: invalidStep.error });
      return;
    }

    setIsPending(true);
    setSubmissionStage("Saving your dealer-sale request...");
    try {
      const { createDealerSaleDraft, completeDealerSaleRequest } =
        await import("@/lib/actions/dealer-sales");
      const { finalizeListingImageUploads, prepareListingMediaUploads } =
        await import("@/lib/actions/listings");

      requestIdRef.current ||= window.crypto.randomUUID();
      const draftResult = await createDealerSaleDraft({
        ...form,
        requestId: requestIdRef.current,
        mileage: Number(form.mileage.replace(/[,\s]/g, "")),
        expectedPrice: Number(form.expectedPrice.replace(/[,\s]/g, "")),
      });

      if ("error" in draftResult) {
        throw new Error(draftResult.error);
      }

      if (draftResult.alreadySubmitted) {
        setCompletedListingId(draftResult.listingId);
        setCompletedChannel(form.saleChannel);
        return;
      }

      const descriptors: ListingMediaUploadDescriptor[] = photos.map(
        (photo, index) => ({
          clientId: `dealer-sale-image-${index}`,
          kind: "image",
          name: photo.name,
          size: photo.size,
          contentType: photo.type,
          lastModified: photo.lastModified,
        }),
      );

      setSubmissionStage("Uploading vehicle photos...");
      const prepareResult = await prepareListingMediaUploads(
        draftResult.listingId,
        descriptors,
      );
      if ("error" in prepareResult) {
        throw new Error(prepareResult.error);
      }

      const filesByClientId = new Map(
        descriptors.map((descriptor, index) => [
          descriptor.clientId,
          photos[index],
        ]),
      );
      await uploadFilesToPresignedTargets(
        prepareResult.uploads.map((ticket) => {
          const file = filesByClientId.get(ticket.clientId);
          if (!file)
            throw new Error(
              `Unable to match "${ticket.name}" to the selected file.`,
            );
          return { ticket, file };
        }),
      );

      setSubmissionStage("Processing and securing vehicle photos...");
      const imageResult = await finalizeListingImageUploads(
        draftResult.listingId,
        prepareResult.uploads.map(toListingMediaUploadReference),
        `${form.year} ${form.make} ${form.model}`,
      );
      if ("error" in imageResult) {
        throw new Error(imageResult.error);
      }

      setSubmissionStage("Opening the request to approved dealers...");
      const completeResult = await completeDealerSaleRequest(
        draftResult.listingId,
      );
      if ("error" in completeResult) {
        throw new Error(completeResult.error);
      }

      setCompletedListingId(completeResult.listingId);
      setCompletedChannel(form.saleChannel);
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? `${error.message} Your saved draft can be retried without creating a duplicate.`
            : "Unable to submit the dealer-sale request. Your saved draft can be retried.",
      });
    } finally {
      setIsPending(false);
      setSubmissionStage(null);
    }
  }

  if (completedListingId) {
    return (
      <div className="mx-auto max-w-2xl rounded-[20px] border border-green-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
          <Check className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-3xl font-bold text-gray-950">
          Dealer-sale request submitted
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          {completedChannel === "dealer_only"
            ? "Approved dealers can now review the vehicle and make offers. It is not visible on the public marketplace."
            : "Approved dealers can now make offers. The public listing remains subject to the normal review process."}
        </p>
        <p className="mt-3 text-xs text-gray-500">
          Accepting an offer records your choice and reserves the listing;
          payment and ownership transfer happen outside this marketplace
          workflow.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/dashboard/listings">View listings and offers</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/listings/${completedListingId}/edit`}>
              Review vehicle details
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] lg:items-start">
      <aside className="lg:sticky lg:top-6">
        <div className="rounded-[20px] border border-gray-200 bg-white p-5 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.45)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Sell to a dealer
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-950 sm:text-4xl">
            Get dealer offers or list publicly after one short intake
          </h1>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            Share the vehicle details and photos buyers need first. This route
            is reserved for signed-in private sellers and continues in your
            seller workspace.
          </p>

          <div className="mt-6 space-y-3">
            {processSteps.map((step, index) => (
              <div
                key={step.title}
                className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {index + 1}. {step.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-brand-muted-border bg-brand-tint p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-gray-700">
                Only a private-seller account can use this dealer-sale intake.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <form
        onSubmit={handleSubmit}
        className="rounded-[20px] border border-gray-200 bg-white p-4 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.45)] sm:p-6"
      >
        <div className="mb-6 border-b border-gray-100 pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                {currentStepMeta.eyebrow} of {wizardSteps.length}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-950">
                {currentStepMeta.title}
              </h2>
            </div>
            <div className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
              {completedVehicleFields}/15 details · {completedPhotoCount}/
              {MIN_PHOTOS} photos
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / wizardSteps.length) * 100}%`,
              }}
            />
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {wizardSteps.map((step, index) => {
              const isActive = step.id === currentStep;
              const canOpen = index <= currentStepIndex;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => canOpen && goToStep(step.id)}
                  disabled={!canOpen}
                  className={cn(
                    "min-h-12 rounded-lg border px-2 text-left transition active:scale-[0.98]",
                    isActive
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 bg-white text-gray-600",
                    !canOpen && "cursor-not-allowed opacity-50",
                  )}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wide">
                    {index + 1}
                  </span>
                  <span className="mt-0.5 hidden text-[11px] font-semibold leading-tight sm:block">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          <section
            aria-hidden={currentStep !== "route"}
            className={cn(currentStep !== "route" && "hidden")}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                1
              </span>
              <h3 className="text-lg font-bold text-gray-950">Selling route</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {saleChannelOptions.map((option) => {
                const isSelected = form.saleChannel === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setField("saleChannel", option.value)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition active:scale-[0.98]",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
                    )}
                    aria-pressed={isSelected}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="block text-sm font-bold text-gray-950">
                          {option.title}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                          {option.description}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300",
                        )}
                      >
                        {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section
            aria-hidden={currentStep !== "vehicle"}
            className={cn(currentStep !== "vehicle" && "hidden")}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                2
              </span>
              <h3 className="text-lg font-bold text-gray-950">Vehicle info</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Year"
                value={form.year}
                onValueChange={(value) => setField("year", value)}
                placeholder="Select year"
                options={years}
                required
              />
              <SelectField
                label="Make"
                value={form.make}
                onValueChange={(value) => setField("make", value)}
                placeholder="Select make"
                options={makes}
                required
              />
              {canTypeModel ? (
                <FieldShell
                  label="Model"
                  required
                  helper="Type the model if it is not listed."
                >
                  <Input
                    value={form.model}
                    onChange={(event) => setField("model", event.target.value)}
                    placeholder="e.g. Harrier, X3, CX-5"
                    className="h-11 border-gray-200 text-sm"
                  />
                </FieldShell>
              ) : (
                <SelectField
                  label="Model"
                  value={form.model}
                  onValueChange={(value) => setField("model", value)}
                  placeholder={
                    modelsLoading ? "Loading models..." : "Select model"
                  }
                  options={models}
                  required
                  disabled={!form.make || modelsLoading}
                />
              )}
              <FieldShell
                label="Variant"
                helper="Use Unsure if you do not know the exact trim."
              >
                <Input
                  value={form.variant}
                  onChange={(event) => setField("variant", event.target.value)}
                  placeholder="e.g. TX, M Sport, Unsure"
                  className="h-11 border-gray-200 text-sm"
                />
              </FieldShell>
              <SelectField
                label="Fuel type"
                value={form.fuelType}
                onValueChange={(value) => setField("fuelType", value)}
                placeholder="Select fuel type"
                options={fuelTypes}
                required
              />
              <SelectField
                label="Gearbox"
                value={form.transmission}
                onValueChange={(value) => setField("transmission", value)}
                placeholder="Select gearbox"
                options={transmissions}
                required
              />
              <FieldShell
                label="Estimated mileage"
                required
                helper="Kilometres on the odometer."
              >
                <Input
                  inputMode="numeric"
                  value={form.mileage}
                  onChange={(event) => setField("mileage", event.target.value)}
                  placeholder="e.g. 72,000"
                  className="h-11 border-gray-200 text-sm"
                />
              </FieldShell>
              <FieldShell
                label="Expected price (KES)"
                required
                helper="A starting point for dealer offers, not a guaranteed valuation."
              >
                <Input
                  inputMode="numeric"
                  value={form.expectedPrice}
                  onChange={(event) =>
                    setField("expectedPrice", event.target.value)
                  }
                  placeholder="e.g. 3,500,000"
                  className="h-11 border-gray-200 text-sm"
                />
              </FieldShell>
              <SelectField
                label="Marketplace condition"
                value={form.marketCondition}
                onValueChange={(value) =>
                  setField(
                    "marketCondition",
                    value as DealerSaleFormState["marketCondition"],
                  )
                }
                placeholder="Select marketplace condition"
                options={["Brand new", "Locally used", "Foreign used"]}
                required
              />
              <FieldShell
                label="Registration number"
                helper="Optional. Helps speed up ownership checks."
              >
                <Input
                  value={form.registration}
                  onChange={(event) =>
                    setField("registration", event.target.value.toUpperCase())
                  }
                  placeholder="KAA 123A"
                  className="h-11 border-gray-200 text-sm"
                />
              </FieldShell>
            </div>
          </section>

          <section
            aria-hidden={currentStep !== "condition"}
            className={cn(currentStep !== "condition" && "hidden")}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                3
              </span>
              <h3 className="text-lg font-bold text-gray-950">
                Condition and ownership
              </h3>
            </div>

            <div className="grid gap-4">
              <SegmentedField
                label="Condition"
                value={form.condition}
                options={conditions}
                onChange={(value) => setField("condition", value)}
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Service history"
                  value={form.serviceHistory}
                  onValueChange={(value) => setField("serviceHistory", value)}
                  placeholder="Select service history"
                  options={serviceHistoryOptions}
                  required
                />
                <SelectField
                  label="Ownership duration"
                  value={form.ownershipDuration}
                  onValueChange={(value) =>
                    setField("ownershipDuration", value)
                  }
                  placeholder="How long have you owned it?"
                  options={ownershipDurations}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <SegmentedField
                  label="Still under finance?"
                  value={form.financed}
                  options={yesNoOptions}
                  onChange={(value) => setField("financed", value)}
                  required
                />
                <SegmentedField
                  label="Under warranty?"
                  value={form.warranty}
                  options={yesNoOptions}
                  onChange={(value) => setField("warranty", value)}
                  required
                />
                <SegmentedField
                  label="Ownership documents?"
                  value={form.documents}
                  options={yesNoOptions}
                  onChange={(value) => setField("documents", value)}
                  required
                />
              </div>

              <FieldShell label="Accident damage or repairs">
                <Textarea
                  value={form.notes}
                  onChange={(event) => setField("notes", event.target.value)}
                  placeholder="Optional notes dealers should know before making an offer."
                  className="min-h-24 border-gray-200 text-sm"
                />
              </FieldShell>
            </div>
          </section>

          <section
            aria-hidden={currentStep !== "photos"}
            className={cn(currentStep !== "photos" && "hidden")}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                4
              </span>
              <h3 className="text-lg font-bold text-gray-950">
                Vehicle photos
              </h3>
            </div>

            <FieldShell
              label="Upload at least 5 photos"
              required
              helper="Include front, rear, both sides, interior, odometer, and any visible damage."
            >
              <label
                className={cn(
                  "flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition active:scale-[0.99]",
                  photos.length >= MIN_PHOTOS
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 bg-gray-50 hover:border-primary/50 hover:bg-brand-tint/40",
                )}
              >
                <Camera className="h-7 w-7 text-primary" />
                <span className="mt-3 text-sm font-bold text-gray-950">
                  {photos.length > 0
                    ? `${photos.length} photo${photos.length === 1 ? "" : "s"} selected`
                    : "Choose vehicle photos"}
                </span>
                <span className="mt-1 text-xs leading-relaxed text-gray-500">
                  Minimum {MIN_PHOTOS}, maximum {MAX_PHOTOS}. Each JPG, PNG, or
                  WebP image can be up to 10MB.
                </span>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="sr-only"
                />
              </label>
            </FieldShell>

            {photos.length > 0 ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {photos.slice(0, MIN_PHOTOS).map((photo, index) => (
                  <div
                    key={`${photo.name}-${photo.lastModified}`}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-700">
                      {index + 1}
                    </span>
                    <span className="truncate">{photo.name}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section
            aria-hidden={currentStep !== "contact"}
            className={cn(currentStep !== "contact" && "hidden")}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                5
              </span>
              <h3 className="text-lg font-bold text-gray-950">
                Contact details
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldShell label="Full name" required>
                <Input
                  value={form.fullName}
                  onChange={(event) => setField("fullName", event.target.value)}
                  placeholder="Your name"
                  className="h-11 border-gray-200 text-sm"
                />
              </FieldShell>
              <FieldShell label="City / town" required>
                <Input
                  value={form.city}
                  onChange={(event) => setField("city", event.target.value)}
                  placeholder="e.g. Nairobi, Mombasa, Kisumu"
                  className="h-11 border-gray-200 text-sm"
                />
              </FieldShell>
              <FieldShell label="Phone number" required>
                <Input
                  value={form.phone}
                  onChange={(event) => setField("phone", event.target.value)}
                  placeholder="+254..."
                  className="h-11 border-gray-200 text-sm"
                />
              </FieldShell>
              <FieldShell label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setField("email", event.target.value)}
                  placeholder="you@example.com"
                  className="h-11 border-gray-200 text-sm"
                />
              </FieldShell>
            </div>
          </section>
        </div>

        {feedback ? (
          <div
            className={cn(
              "mt-6 rounded-xl border px-4 py-3 text-sm leading-relaxed",
              feedback.tone === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800",
            )}
          >
            <div className="flex gap-2">
              {feedback.tone === "success" ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
              ) : null}
              <span>{feedback.message}</span>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-gray-500">
            {isLastStep
              ? submissionStage ||
                "Submit this request to approved dealers from your private-seller account."
              : "Complete this step to continue through the seller intake."}
          </p>
          <div className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={currentStepIndex === 0 || isPending}
              onClick={handleBackStep}
              className="h-12 shrink-0 rounded-lg px-4 font-semibold active:scale-[0.98]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            {isLastStep ? (
              <Button
                type="submit"
                disabled={isPending}
                className="h-12 shrink-0 rounded-lg px-5 font-semibold active:scale-[0.98]"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {isPending
                  ? "Submitting request..."
                  : "Submit dealer-sale request"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNextStep}
                className="h-12 shrink-0 rounded-lg px-5 font-semibold active:scale-[0.98]"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
