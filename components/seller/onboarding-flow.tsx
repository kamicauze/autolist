"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ONBOARDING_STEPS,
  USER_ROLE_OPTIONS,
  type UserRole,
} from "@/lib/constants/marketplace";
import { WizardShell } from "@/components/seller/wizard-shell";
import { createClient } from "@/lib/supabase/client";

type OnboardingData = {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  nationalId: string;
  businessName: string;
  businessRegNumber: string;
  operatingCity: string;
  notes: string;
};

const DEFAULT_DATA: OnboardingData = {
  fullName: "",
  email: "",
  password: "",
  role: "buyer",
  phone: "",
  nationalId: "",
  businessName: "",
  businessRegNumber: "",
  operatingCity: "",
  notes: "",
};

interface OnboardingFlowProps {
  previewMode?: boolean;
  dashboardHref?: string;
  createListingHref?: string;
}

export function OnboardingFlow({
  previewMode = false,
  dashboardHref = "/dashboard",
  createListingHref = "/dashboard/listings/new",
}: OnboardingFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeStep, setActiveStep] = React.useState(0);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<OnboardingData>(DEFAULT_DATA);

  // Pre-fill form data from authenticated user's session
  React.useEffect(() => {
    const prefillFromSession = async () => {
      if (previewMode) return;

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

        setFormData((prev) => ({
          ...prev,
          email: user.email || prev.email,
          fullName: profile?.full_name || user.user_metadata?.full_name || prev.fullName,
          // Pre-fill password placeholder since user is already authenticated
          password: "********", // Placeholder - user is already authenticated
        }));
      }
    };

    prefillFromSession();
  }, [previewMode]);

  // Handle role from query params
  React.useEffect(() => {
    const queryRole = searchParams.get("role");
    if (!queryRole) return;

    const isKnownRole = USER_ROLE_OPTIONS.some((option) => option.value === queryRole);
    if (isKnownRole) {
      setFormData((prev) => ({ ...prev, role: queryRole as UserRole }));
    }
  }, [searchParams]);

  const isDealer = formData.role === "dealer";
  const isLastStep = activeStep === ONBOARDING_STEPS.length - 1;

  const updateField = <Key extends keyof OnboardingData>(
    key: Key,
    value: OnboardingData[Key]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setSubmitError(null);
  };

  const canContinue = React.useMemo(() => {
    if (activeStep === 0) {
      return Boolean(formData.fullName && formData.email && formData.password.length >= 8);
    }

    if (activeStep === 1) {
      return Boolean(formData.role);
    }

    if (activeStep === 2) {
      if (!formData.phone || !formData.nationalId) return false;
      if (isDealer) {
        return Boolean(
          formData.businessName &&
            formData.businessRegNumber &&
            formData.operatingCity
        );
      }
      return true;
    }

    return true;
  }, [activeStep, formData, isDealer]);

  const handleContinue = async () => {
    if (isLastStep) {
      if (previewMode) {
        setIsSubmitted(true);
        return;
      }

      setSubmitError(null);
      setIsSaving(true);

      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login?next=/register/onboarding");
        setIsSaving(false);
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName.trim(),
          role: formData.role,
        })
        .eq("id", user.id);

      if (profileError) {
        setSubmitError(profileError.message);
        setIsSaving(false);
        return;
      }

      if (formData.role === "dealer") {
        router.replace("/register/dealer");
        router.refresh();
        return;
      }

      setIsSubmitted(true);
      setIsSaving(false);
      return;
    }

    if (!canContinue) return;
    setActiveStep((prev) => Math.min(prev + 1, ONBOARDING_STEPS.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  if (isSubmitted) {
    return (
      <section
        className="rounded-2xl border border-success/20 bg-gradient-to-br from-success/10 via-white to-info/10 p-8"
        data-testid="onboarding-success"
      >
        <div className="mx-auto max-w-2xl space-y-5 text-center">
          <Badge variant="success" className="mx-auto w-fit">
            Onboarding Complete
          </Badge>
          <h2 className="text-3xl font-bold text-foreground">
            Welcome to Autolist, {formData.fullName || "Seller"}.
          </h2>
          <p className="text-muted-foreground">
            Your account is now configured as a{" "}
            <span className="font-semibold text-foreground">
              {formData.role.toUpperCase()}
            </span>
            . Verification checks are queued and you can proceed to your dashboard.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild data-testid="onboarding-go-dashboard">
              <Link href={dashboardHref}>Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={createListingHref}>Create Your First Listing</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <WizardShell
      title="Seller Onboarding"
      description="A flexible multi-step registration flow for buyers, sellers, and dealers."
      steps={ONBOARDING_STEPS}
      activeStep={activeStep}
      testId="onboarding-wizard"
      footerMeta={
        activeStep === 2 && isDealer
          ? "Dealer profile fields are required on this step."
          : `Step ${activeStep + 1} of ${ONBOARDING_STEPS.length}`
      }
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={activeStep === 0}
            data-testid="onboarding-back"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={(!canContinue && !isLastStep) || isSaving}
            data-testid="onboarding-next"
          >
            {isLastStep ? (isSaving ? "Saving..." : "Complete Onboarding") : "Continue"}
          </Button>
        </>
      }
    >
      {submitError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      {activeStep === 0 && (
        <div className="space-y-4" data-testid="onboarding-step-account">
          <div>
            <Label htmlFor="register-full-name">Full name</Label>
            <Input
              id="register-full-name"
              data-testid="onboarding-full-name"
              placeholder="Jane Doe"
              value={formData.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              data-testid="onboarding-email"
              placeholder="jane@example.com"
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              data-testid="onboarding-password"
              placeholder="Minimum 8 characters"
              type="password"
              value={formData.password}
              onChange={(event) => updateField("password", event.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Use at least 8 characters including uppercase, lowercase and digits.
            </p>
          </div>
        </div>
      )}

      {activeStep === 1 && (
        <div className="space-y-4" data-testid="onboarding-step-role">
          <p className="text-sm text-muted-foreground">
            Choose role-specific tools. This can be changed later by support if needed.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {USER_ROLE_OPTIONS.map((option) => {
              const selected = formData.role === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-white hover:border-primary/40"
                  }`}
                  onClick={() => updateField("role", option.value)}
                  data-testid={`onboarding-role-${option.value}`}
                >
                  <p className="font-semibold text-foreground">{option.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                </button>
              );
            })}
          </div>
          {formData.role === "dealer" && (
            <div className="rounded-lg border border-info/20 bg-info/5 p-3 text-sm">
              <p className="text-foreground">
                Dealer selected. For full dealership verification requirements, use the dedicated
                flow.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-2">
                <Link href="/register/dealer">Open dealer sign-up form</Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {activeStep === 2 && (
        <div className="space-y-4" data-testid="onboarding-step-verification">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="register-phone">Phone number</Label>
              <Input
                id="register-phone"
                data-testid="onboarding-phone"
                placeholder="+254 700 000000"
                value={formData.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="register-id">National ID / Passport</Label>
              <Input
                id="register-id"
                data-testid="onboarding-national-id"
                placeholder="A12345678"
                value={formData.nationalId}
                onChange={(event) => updateField("nationalId", event.target.value)}
              />
            </div>
          </div>

          {isDealer && (
            <div className="rounded-xl border border-info/20 bg-info/5 p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">
                Dealer verification details
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="dealer-name">Business name</Label>
                  <Input
                    id="dealer-name"
                    data-testid="onboarding-business-name"
                    placeholder="Autolist Motors Ltd"
                    value={formData.businessName}
                    onChange={(event) => updateField("businessName", event.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dealer-reg">Business registration number</Label>
                  <Input
                    id="dealer-reg"
                    data-testid="onboarding-business-reg"
                    placeholder="PVT-123456"
                    value={formData.businessRegNumber}
                    onChange={(event) => updateField("businessRegNumber", event.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="dealer-city">Operating city</Label>
                  <Input
                    id="dealer-city"
                    data-testid="onboarding-operating-city"
                    placeholder="Nairobi"
                    value={formData.operatingCity}
                    onChange={(event) => updateField("operatingCity", event.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="register-notes">Additional notes (optional)</Label>
            <Textarea
              id="register-notes"
              data-testid="onboarding-notes"
              placeholder="Tell us any verification notes or preferred contact times."
              value={formData.notes}
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </div>
        </div>
      )}

      {activeStep === 3 && (
        <div className="space-y-4" data-testid="onboarding-step-confirmation">
          <Badge variant="info">Review Before Submit</Badge>
          <div className="grid gap-3 rounded-xl border border-border bg-white p-4 text-sm md:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Full name</p>
              <p className="font-semibold text-foreground">{formData.fullName || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-semibold text-foreground">{formData.email || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <p className="font-semibold text-foreground">{formData.role.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-semibold text-foreground">{formData.phone || "-"}</p>
            </div>
            {isDealer && (
              <>
                <div>
                  <p className="text-muted-foreground">Business name</p>
                  <p className="font-semibold text-foreground">{formData.businessName || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Registration no.</p>
                  <p className="font-semibold text-foreground">
                    {formData.businessRegNumber || "-"}
                  </p>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Completing onboarding creates your profile and queues verification review.
          </p>
        </div>
      )}
    </WizardShell>
  );
}
