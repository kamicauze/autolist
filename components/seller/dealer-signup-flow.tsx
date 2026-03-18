"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WizardShell } from "@/components/seller/wizard-shell";
import { submitDealerVerification } from "@/lib/actions/dealers";

type ConfirmationChannel = "email" | "whatsapp" | "sms";

type DealerSignupData = {
  dealershipName: string;
  registeredBusinessName: string;
  dealershipAddress: string;
  cityTown: string;
  locationArea: string;
  mobileNumber: string;
  officialEmail: string;
  whatsappNumber: string;
  websiteUrl: string;
  companyLogoName: string;
  aboutDealership: string;
  contactFullName: string;
  contactRole: string;
  contactMobile: string;
  contactEmail: string;
  contactPhotoName: string;
  contactWhatsapp: string;
  facebookUrl: string;
  instagramUrl: string;
  xUrl: string;
  tiktokUrl: string;
  otherSocialUrl: string;
  incorporationCertificateName: string;
  contactPersonIdName: string;
  acceptDealerTerms: boolean;
  acceptPrivacyPolicy: boolean;
  verificationNotes: string;
  preferredConfirmationChannel: ConfirmationChannel;
};

const DEALER_SIGNUP_STEPS = [
  {
    id: "dealership",
    title: "Dealership Information",
    description: "Core dealership and contact coordinates.",
  },
  {
    id: "profile",
    title: "Branding & Public Profile",
    description: "Public-facing profile and social links.",
  },
  {
    id: "primary-contact",
    title: "Primary Contact Person",
    description: "Required salesperson details for trust.",
  },
  {
    id: "verification",
    title: "Verification & Consent",
    description: "Document upload and legal agreements.",
  },
  {
    id: "review",
    title: "Review & Submit",
    description: "Final review before pending verification.",
  },
] as const;

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const MIN_ABOUT_CHARS = 300;
const MAX_ABOUT_CHARS = 500;

const DEFAULT_DATA: DealerSignupData = {
  dealershipName: "",
  registeredBusinessName: "",
  dealershipAddress: "",
  cityTown: "",
  locationArea: "",
  mobileNumber: "",
  officialEmail: "",
  whatsappNumber: "",
  websiteUrl: "",
  companyLogoName: "",
  aboutDealership: "",
  contactFullName: "",
  contactRole: "",
  contactMobile: "",
  contactEmail: "",
  contactPhotoName: "",
  contactWhatsapp: "",
  facebookUrl: "",
  instagramUrl: "",
  xUrl: "",
  tiktokUrl: "",
  otherSocialUrl: "",
  incorporationCertificateName: "",
  contactPersonIdName: "",
  acceptDealerTerms: false,
  acceptPrivacyPolicy: false,
  verificationNotes: "",
  preferredConfirmationChannel: "email",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

function isValidEmail(value: string) {
  return EMAIL_REGEX.test(value.trim());
}

function isValidPhone(value: string) {
  return PHONE_REGEX.test(value.replace(/\s+/g, ""));
}

function isValidUrl(value: string) {
  const normalized = value.trim();
  if (!normalized) return true;
  try {
    const url = new URL(normalized);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

interface DealerSignupFlowProps {
  previewMode?: boolean;
}

export function DealerSignupFlow({ previewMode = false }: DealerSignupFlowProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<DealerSignupData>(DEFAULT_DATA);
  const [companyLogoFile, setCompanyLogoFile] = React.useState<File | null>(null);
  const [contactPhotoFile, setContactPhotoFile] = React.useState<File | null>(null);
  const [incorporationCertificateFile, setIncorporationCertificateFile] = React.useState<File | null>(null);
  const [contactPersonIdFile, setContactPersonIdFile] = React.useState<File | null>(null);

  const isLastStep = activeStep === DEALER_SIGNUP_STEPS.length - 1;

  const updateField = <Key extends keyof DealerSignupData>(
    key: Key,
    value: DealerSignupData[Key]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setSubmitError(null);
  };

  const handleUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: keyof Pick<
      DealerSignupData,
      | "companyLogoName"
      | "contactPhotoName"
      | "incorporationCertificateName"
      | "contactPersonIdName"
    >,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFile(null);
      updateField(key, "");
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setUploadError(`${file.name} exceeds 10MB limit.`);
      return;
    }

    setUploadError(null);
    setFile(file);
    updateField(key, file.name);
  };

  const stepErrors = React.useMemo(() => {
    const errors: string[] = [];

    if (activeStep === 0) {
      if (!formData.dealershipName.trim()) errors.push("Dealership name is required.");
      if (!formData.dealershipAddress.trim()) errors.push("Dealership address is required.");
      if (!formData.cityTown.trim()) errors.push("City / town is required.");
      if (!formData.locationArea.trim()) errors.push("Location / area is required.");
      if (!isValidPhone(formData.mobileNumber)) errors.push("Enter a valid mobile number.");
      if (!isValidEmail(formData.officialEmail)) errors.push("Enter a valid official email address.");
      if (!isValidPhone(formData.whatsappNumber)) errors.push("Enter a valid WhatsApp contact number.");
      if (!isValidUrl(formData.websiteUrl)) errors.push("Website URL must start with http:// or https://.");
    }

    if (activeStep === 1) {
      if (formData.aboutDealership.length > 0 && formData.aboutDealership.length < MIN_ABOUT_CHARS) {
        errors.push(`About the dealership must be at least ${MIN_ABOUT_CHARS} characters.`);
      }
      if (formData.aboutDealership.length > MAX_ABOUT_CHARS) {
        errors.push(`About the dealership cannot exceed ${MAX_ABOUT_CHARS} characters.`);
      }

      const socialUrls = [
        { value: formData.facebookUrl, label: "Facebook URL" },
        { value: formData.instagramUrl, label: "Instagram URL" },
        { value: formData.xUrl, label: "X (Twitter) URL" },
        { value: formData.tiktokUrl, label: "TikTok URL" },
        { value: formData.otherSocialUrl, label: "Other social URL" },
      ];

      socialUrls.forEach(({ value, label }) => {
        if (!isValidUrl(value)) {
          errors.push(`${label} must start with http:// or https://.`);
        }
      });
    }

    if (activeStep === 2) {
      if (!formData.contactFullName.trim()) errors.push("Primary contact full name is required.");
      if (!formData.contactRole.trim()) errors.push("Primary contact role/title is required.");
      if (!isValidPhone(formData.contactMobile)) errors.push("Enter a valid primary contact mobile number.");
      if (!isValidEmail(formData.contactEmail)) errors.push("Enter a valid primary contact email.");
      if (!formData.contactPhotoName) errors.push("Primary contact photo is required.");
      if (formData.contactWhatsapp.trim() && !isValidPhone(formData.contactWhatsapp)) {
        errors.push("Primary contact WhatsApp number format is invalid.");
      }
    }

    if (activeStep === 3) {
      if (!formData.incorporationCertificateName) {
        errors.push("Certificate of incorporation is required.");
      }
      if (!formData.acceptDealerTerms) {
        errors.push("Dealer Terms & Conditions must be accepted.");
      }
      if (!formData.acceptPrivacyPolicy) {
        errors.push("Data & Privacy Policy must be accepted.");
      }
      if (uploadError) {
        errors.push(uploadError);
      }
    }

    return errors;
  }, [activeStep, formData, uploadError]);

  const canContinue = stepErrors.length === 0;

  const handleContinue = async () => {
    if (!canContinue) return;
    if (isLastStep) {
      if (previewMode) {
        setSubmitted(true);
        return;
      }

      setSubmitError(null);
      setIsSubmitting(true);
      const submission = new FormData();

      submission.set("dealershipName", formData.dealershipName);
      submission.set("registeredBusinessName", formData.registeredBusinessName);
      submission.set("dealershipAddress", formData.dealershipAddress);
      submission.set("cityTown", formData.cityTown);
      submission.set("locationArea", formData.locationArea);
      submission.set("mobileNumber", formData.mobileNumber);
      submission.set("officialEmail", formData.officialEmail);
      submission.set("whatsappNumber", formData.whatsappNumber);
      submission.set("websiteUrl", formData.websiteUrl);
      submission.set("aboutDealership", formData.aboutDealership);
      submission.set("contactFullName", formData.contactFullName);
      submission.set("contactRole", formData.contactRole);
      submission.set("contactMobile", formData.contactMobile);
      submission.set("contactEmail", formData.contactEmail);
      submission.set("contactWhatsapp", formData.contactWhatsapp);
      submission.set("facebookUrl", formData.facebookUrl);
      submission.set("instagramUrl", formData.instagramUrl);
      submission.set("xUrl", formData.xUrl);
      submission.set("tiktokUrl", formData.tiktokUrl);
      submission.set("otherSocialUrl", formData.otherSocialUrl);
      submission.set("acceptDealerTerms", String(formData.acceptDealerTerms));
      submission.set("acceptPrivacyPolicy", String(formData.acceptPrivacyPolicy));
      submission.set("verificationNotes", formData.verificationNotes);
      submission.set("preferredConfirmationChannel", formData.preferredConfirmationChannel);

      if (companyLogoFile) submission.set("companyLogo", companyLogoFile);
      if (contactPhotoFile) submission.set("contactPhoto", contactPhotoFile);
      if (incorporationCertificateFile) {
        submission.set("incorporationCertificate", incorporationCertificateFile);
      }
      if (contactPersonIdFile) submission.set("contactPersonId", contactPersonIdFile);

      const result = await submitDealerVerification(submission);

      if (result.error) {
        if (result.error === "Unauthorized") {
          router.replace("/login?next=/register/dealer");
        }
        setSubmitError(result.error);
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
      setIsSubmitting(false);
      return;
    }
    setActiveStep((prev) => Math.min(prev + 1, DEALER_SIGNUP_STEPS.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  if (submitted) {
    const target =
      formData.preferredConfirmationChannel === "email"
        ? formData.officialEmail
        : formData.preferredConfirmationChannel === "whatsapp"
          ? formData.whatsappNumber
          : formData.mobileNumber;
    const channelLabel =
      formData.preferredConfirmationChannel === "email"
        ? "Email"
        : formData.preferredConfirmationChannel === "whatsapp"
          ? "WhatsApp"
          : "SMS";

    return (
      <section
        className="space-y-5 rounded-2xl border border-warning/30 bg-gradient-to-br from-warning/10 via-white to-info/10 p-8"
        data-testid="dealer-signup-success"
      >
        <Badge variant="warning" className="w-fit">
          Pending Verification
        </Badge>
        <h2 className="text-3xl font-bold text-foreground">
          Dealer application submitted
        </h2>
        <p className="text-sm text-muted-foreground">
          Your dealer profile is now pending manual verification. Dealer listings stay hidden until
          status changes to <span className="font-semibold text-foreground">Approved</span>.
        </p>

        <div className="rounded-xl border border-border bg-white p-4 text-sm">
          <p className="font-semibold text-foreground">System statuses</p>
          <p className="mt-2 text-muted-foreground">Pending Verification • Approved • Rejected</p>
          <p className="mt-2 text-muted-foreground">
            Dealer accounts can only publish listings and appear in search results after approval.
          </p>
        </div>

        <div className="rounded-xl border border-info/20 bg-info/5 p-4 text-sm">
          <p className="font-semibold text-foreground">Post-verification magic link delivery</p>
          <p className="mt-1 text-muted-foreground">
            After approval, a smart confirmation link will be sent via{" "}
            <span className="font-semibold text-foreground">{channelLabel}</span> to{" "}
            <span className="font-semibold text-foreground">{target || "-"}</span>.
          </p>
        </div>
      </section>
    );
  }

  return (
    <WizardShell
      title="Dealer Sign-Up & Verification"
      description="MVP onboarding for verified dealerships with required documentation and consent capture."
      steps={DEALER_SIGNUP_STEPS}
      activeStep={activeStep}
      testId="dealer-signup-flow"
      footerMeta={
        stepErrors.length > 0
          ? `${stepErrors.length} issue${stepErrors.length === 1 ? "" : "s"} to fix on this step`
          : `Step ${activeStep + 1} of ${DEALER_SIGNUP_STEPS.length}`
      }
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={activeStep === 0}
            data-testid="dealer-signup-back"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue || isSubmitting}
            data-testid="dealer-signup-next"
          >
            {isLastStep ? (isSubmitting ? "Submitting..." : "Submit for Verification") : "Continue"}
          </Button>
        </>
      }
    >
      {submitError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      {stepErrors.length > 0 && (
        <div
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          data-testid="dealer-validation-errors"
        >
          <p className="font-semibold">Fix the following before continuing:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {stepErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {activeStep === 0 && (
        <div className="space-y-4" data-testid="dealer-step-dealership">
          <h2 className="text-lg font-semibold text-foreground">Dealership Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="dealer-name">Dealership Name *</Label>
              <Input
                id="dealer-name"
                data-testid="dealer-dealership-name"
                value={formData.dealershipName}
                onChange={(event) => updateField("dealershipName", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dealer-registered-name">Registered Business Name</Label>
              <Input
                id="dealer-registered-name"
                data-testid="dealer-registered-business-name"
                value={formData.registeredBusinessName}
                onChange={(event) => updateField("registeredBusinessName", event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="dealer-address">Dealership Address *</Label>
              <Input
                id="dealer-address"
                data-testid="dealer-address"
                value={formData.dealershipAddress}
                onChange={(event) => updateField("dealershipAddress", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dealer-city">City / Town *</Label>
              <Input
                id="dealer-city"
                data-testid="dealer-city-town"
                value={formData.cityTown}
                onChange={(event) => updateField("cityTown", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dealer-location">Location / Area *</Label>
              <Input
                id="dealer-location"
                data-testid="dealer-location-area"
                value={formData.locationArea}
                onChange={(event) => updateField("locationArea", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dealer-mobile">Mobile Number *</Label>
              <Input
                id="dealer-mobile"
                data-testid="dealer-mobile-number"
                placeholder="+254700000000"
                value={formData.mobileNumber}
                onChange={(event) => updateField("mobileNumber", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dealer-email">Official Email Address *</Label>
              <Input
                id="dealer-email"
                data-testid="dealer-official-email"
                type="email"
                value={formData.officialEmail}
                onChange={(event) => updateField("officialEmail", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dealer-whatsapp">WhatsApp Contact Number *</Label>
              <Input
                id="dealer-whatsapp"
                data-testid="dealer-whatsapp-number"
                placeholder="+254700000000"
                value={formData.whatsappNumber}
                onChange={(event) => updateField("whatsappNumber", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dealer-website">Website URL</Label>
              <Input
                id="dealer-website"
                data-testid="dealer-website-url"
                placeholder="https://..."
                value={formData.websiteUrl}
                onChange={(event) => updateField("websiteUrl", event.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {activeStep === 1 && (
        <div className="space-y-4" data-testid="dealer-step-profile">
          <h2 className="text-lg font-semibold text-foreground">Branding & Public Profile</h2>
          <div>
            <Label htmlFor="dealer-logo">Company Logo (Optional)</Label>
              <Input
                id="dealer-logo"
                data-testid="dealer-company-logo"
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => handleUpload(event, "companyLogoName", setCompanyLogoFile)}
              />
          </div>
          <div>
            <Label htmlFor="dealer-about">About the Dealership (300–500 chars)</Label>
            <Textarea
              id="dealer-about"
              data-testid="dealer-about"
              maxLength={MAX_ABOUT_CHARS}
              value={formData.aboutDealership}
              onChange={(event) => updateField("aboutDealership", event.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {formData.aboutDealership.length}/{MAX_ABOUT_CHARS} characters
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="dealer-facebook">Facebook Page URL</Label>
              <Input
                id="dealer-facebook"
                value={formData.facebookUrl}
                onChange={(event) => updateField("facebookUrl", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dealer-instagram">Instagram URL</Label>
              <Input
                id="dealer-instagram"
                value={formData.instagramUrl}
                onChange={(event) => updateField("instagramUrl", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dealer-x">X (Twitter) URL</Label>
              <Input
                id="dealer-x"
                value={formData.xUrl}
                onChange={(event) => updateField("xUrl", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dealer-tiktok">TikTok URL</Label>
              <Input
                id="dealer-tiktok"
                value={formData.tiktokUrl}
                onChange={(event) => updateField("tiktokUrl", event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="dealer-other-social">Other Social Media Link</Label>
              <Input
                id="dealer-other-social"
                value={formData.otherSocialUrl}
                onChange={(event) => updateField("otherSocialUrl", event.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div className="space-y-4" data-testid="dealer-step-contact">
          <h2 className="text-lg font-semibold text-foreground">Primary Contact Person</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="dealer-contact-name">Full Name *</Label>
              <Input
                id="dealer-contact-name"
                data-testid="dealer-contact-full-name"
                value={formData.contactFullName}
                onChange={(event) => updateField("contactFullName", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dealer-contact-role">Role / Title *</Label>
              <Input
                id="dealer-contact-role"
                data-testid="dealer-contact-role"
                placeholder="Sales Manager"
                value={formData.contactRole}
                onChange={(event) => updateField("contactRole", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dealer-contact-mobile">Mobile Number *</Label>
              <Input
                id="dealer-contact-mobile"
                data-testid="dealer-contact-mobile"
                value={formData.contactMobile}
                onChange={(event) => updateField("contactMobile", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dealer-contact-email">Email Address *</Label>
              <Input
                id="dealer-contact-email"
                data-testid="dealer-contact-email"
                type="email"
                value={formData.contactEmail}
                onChange={(event) => updateField("contactEmail", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dealer-contact-whatsapp">WhatsApp Number (Optional)</Label>
              <Input
                id="dealer-contact-whatsapp"
                data-testid="dealer-contact-whatsapp"
                value={formData.contactWhatsapp}
                onChange={(event) => updateField("contactWhatsapp", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dealer-contact-photo">Photo of Contact Person *</Label>
              <Input
                id="dealer-contact-photo"
                data-testid="dealer-contact-photo"
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => handleUpload(event, "contactPhotoName", setContactPhotoFile)}
              />
            </div>
          </div>
        </div>
      )}

      {activeStep === 3 && (
        <div className="space-y-4" data-testid="dealer-step-verification">
          <h2 className="text-lg font-semibold text-foreground">Verification Requirements</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="dealer-incorporation">Certificate of Incorporation *</Label>
              <Input
                id="dealer-incorporation"
                data-testid="dealer-incorporation-certificate"
                type="file"
                accept=".pdf,image/png,image/jpeg"
                onChange={(event) =>
                  handleUpload(
                    event,
                    "incorporationCertificateName",
                    setIncorporationCertificateFile
                  )
                }
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Required. Accepted formats: PDF, JPG, PNG.
              </p>
            </div>
            <div>
              <Label htmlFor="dealer-id-doc">Contact Person National ID (Optional)</Label>
              <Input
                id="dealer-id-doc"
                data-testid="dealer-contact-id"
                type="file"
                accept="image/png,image/jpeg,.pdf"
                onChange={(event) => handleUpload(event, "contactPersonIdName", setContactPersonIdFile)}
              />
            </div>
          </div>

          {uploadError && (
            <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {uploadError}
            </p>
          )}

          <div>
            <Label htmlFor="dealer-verification-notes">Verification Notes (Optional)</Label>
            <Textarea
              id="dealer-verification-notes"
              value={formData.verificationNotes}
              onChange={(event) => updateField("verificationNotes", event.target.value)}
            />
          </div>

          <div className="space-y-2 rounded-xl border border-border bg-white p-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.acceptDealerTerms}
                onChange={(event) => updateField("acceptDealerTerms", event.target.checked)}
                data-testid="dealer-accept-terms"
              />
              I agree to Dealer Terms & Conditions *
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.acceptPrivacyPolicy}
                onChange={(event) => updateField("acceptPrivacyPolicy", event.target.checked)}
                data-testid="dealer-accept-privacy"
              />
              I agree to Data & Privacy Policy *
            </label>
          </div>
        </div>
      )}

      {activeStep === 4 && (
        <div className="space-y-4" data-testid="dealer-step-review">
          <h2 className="text-lg font-semibold text-foreground">Review & Submit</h2>
          <div className="grid gap-3 rounded-xl border border-border bg-white p-4 text-sm md:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Dealership Name</p>
              <p className="font-semibold text-foreground">{formData.dealershipName || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Official Email</p>
              <p className="font-semibold text-foreground">{formData.officialEmail || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">City / Location</p>
              <p className="font-semibold text-foreground">
                {formData.cityTown || "-"} / {formData.locationArea || "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Primary Contact</p>
              <p className="font-semibold text-foreground">{formData.contactFullName || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Incorporation Certificate</p>
              <p className="font-semibold text-foreground">
                {formData.incorporationCertificateName || "Not attached"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Consents</p>
              <p className="font-semibold text-foreground">
                {formData.acceptDealerTerms && formData.acceptPrivacyPolicy
                  ? "Accepted"
                  : "Incomplete"}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-info/20 bg-info/5 p-4 text-sm">
            <p className="font-semibold text-foreground">Confirmation Magic Link Channel</p>
            <p className="mt-1 text-muted-foreground">
              After verification, send the dealer confirmation smart link through:
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="confirmation-channel"
                  checked={formData.preferredConfirmationChannel === "email"}
                  onChange={() => updateField("preferredConfirmationChannel", "email")}
                  data-testid="dealer-confirmation-email"
                />
                Email
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="confirmation-channel"
                  checked={formData.preferredConfirmationChannel === "whatsapp"}
                  onChange={() => updateField("preferredConfirmationChannel", "whatsapp")}
                  data-testid="dealer-confirmation-whatsapp"
                />
                WhatsApp
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="confirmation-channel"
                  checked={formData.preferredConfirmationChannel === "sms"}
                  onChange={() => updateField("preferredConfirmationChannel", "sms")}
                  data-testid="dealer-confirmation-sms"
                />
                SMS
              </label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Dealer status will be set to Pending Verification after submission.
          </p>
        </div>
      )}
    </WizardShell>
  );
}
