"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Car,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Store,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

type OnboardingData = {
  fullName: string;
  email: string;
  role: UserRole;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  bio: string;
};

type RolePresentation = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  summary: string;
  savedOutcome: string;
  nextStep: string;
  destinationLabel: string;
};

const DEFAULT_DATA: OnboardingData = {
  fullName: "",
  email: "",
  role: "buyer",
  phone: "",
  whatsapp: "",
  city: "",
  address: "",
  bio: "",
};

const ROLE_PRESENTATION: Record<UserRole, RolePresentation> = {
  buyer: {
    icon: Car,
    title: "Buyer",
    summary: "Save favorites, compare vehicles, and contact sellers with a recognizable profile.",
    savedOutcome: "Buyer profile saved.",
    nextStep: "Browse vehicles and save cars you want to revisit.",
    destinationLabel: "Browse vehicles",
  },
  seller: {
    icon: BriefcaseBusiness,
    title: "Seller",
    summary: "Create listings, receive buyer inquiries, and keep contact details ready for leads.",
    savedOutcome: "Seller profile saved.",
    nextStep: "Create your first listing from the seller dashboard.",
    destinationLabel: "Create listing",
  },
  dealer: {
    icon: Store,
    title: "Dealer",
    summary: "Set the account role now, then complete dealer verification with documents.",
    savedOutcome: "Dealer role and contact profile saved.",
    nextStep: "Complete the dealer verification form so the team can review your business.",
    destinationLabel: "Start dealer verification",
  },
};

const FIELD_LABEL_CLASS = "text-[13px] font-semibold text-[#24272C]";
const FIELD_HELP_CLASS = "mt-1 text-[12px] leading-5 text-[#8a8a8a]";
const FIELD_INPUT_CLASS =
  "h-12 rounded-[14px] border-[#EDEDED] text-[15px] focus-visible:ring-[#2563eb]/30";
const FIELD_TEXTAREA_CLASS =
  "min-h-[118px] rounded-[14px] border-[#EDEDED] text-[15px] leading-6 focus-visible:ring-[#2563eb]/30";

interface OnboardingFlowProps {
  previewMode?: boolean;
  dashboardHref?: string;
  createListingHref?: string;
}

function isKnownRole(value: string | null): value is UserRole {
  return USER_ROLE_OPTIONS.some((option) => option.value === value);
}

function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getDestination(role: UserRole, dashboardHref: string, createListingHref: string) {
  if (role === "buyer") return "/";
  if (role === "dealer") return "/register/dealer";
  return createListingHref || dashboardHref;
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AL";
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

  React.useEffect(() => {
    const prefillFromSession = async () => {
      const queryRole = searchParams.get("role");
      const roleFromQuery = isKnownRole(queryRole) ? queryRole : null;

      if (previewMode) {
        setFormData((current) => ({
          ...current,
          role: roleFromQuery ?? current.role,
        }));
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, phone, whatsapp, bio, city, address")
        .eq("id", user.id)
        .maybeSingle<{
          full_name: string | null;
          role: string | null;
          phone: string | null;
          whatsapp: string | null;
          bio: string | null;
          city: string | null;
          address: string | null;
        }>();
      const rawProfileRole = profile?.role ?? null;
      const profileRole: UserRole | null = isKnownRole(rawProfileRole) ? rawProfileRole : null;

      setFormData((current) => ({
        ...current,
        email: user.email || current.email,
        fullName: profile?.full_name || user.user_metadata?.full_name || current.fullName,
        role: roleFromQuery ?? profileRole ?? current.role,
        phone: profile?.phone || current.phone,
        whatsapp: profile?.whatsapp || current.whatsapp,
        bio: profile?.bio || current.bio,
        city: profile?.city || current.city,
        address: profile?.address || current.address,
      }));
    };

    prefillFromSession();
  }, [previewMode, searchParams]);

  const isLastStep = activeStep === ONBOARDING_STEPS.length - 1;
  const presentation = ROLE_PRESENTATION[formData.role];
  const RoleIcon = presentation.icon;
  const isSellerLike = formData.role === "seller" || formData.role === "dealer";
  const destination = getDestination(formData.role, dashboardHref, createListingHref);

  const updateField = <Key extends keyof OnboardingData>(
    key: Key,
    value: OnboardingData[Key]
  ) => {
    setFormData((current) => ({
      ...current,
      [key]: value,
      ...(key === "phone" && !current.whatsapp ? { whatsapp: value } : null),
    }));
    setSubmitError(null);
  };

  const stepCompletion = React.useMemo(
    () => [
      Boolean(formData.fullName.trim() && formData.email.trim()),
      Boolean(formData.role),
      isSellerLike
        ? Boolean(formData.phone.trim() && formData.city.trim())
        : Boolean(formData.city.trim() || formData.phone.trim() || formData.bio.trim()),
      false,
    ],
    [formData, isSellerLike]
  );

  const canContinue = React.useMemo(() => {
    if (activeStep === 0) {
      return Boolean(formData.fullName.trim() && formData.email.trim());
    }

    if (activeStep === 1) return Boolean(formData.role);

    if (activeStep === 2 && isSellerLike) {
      return Boolean(formData.phone.trim() && formData.city.trim());
    }

    return true;
  }, [activeStep, formData, isSellerLike]);

  const handleContinue = async () => {
    if (!isLastStep) {
      if (!canContinue) {
        setSubmitError("Complete the required fields before continuing.");
        return;
      }

      setActiveStep((current) => Math.min(current + 1, ONBOARDING_STEPS.length - 1));
      setSubmitError(null);
      return;
    }

    if (previewMode) {
      setIsSubmitted(true);
      return;
    }

    setSubmitError(null);
    setIsSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login?next=/register/onboarding");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName.trim(),
          role: formData.role,
          phone: normalizeOptional(formData.phone),
          whatsapp: normalizeOptional(formData.whatsapp),
          bio: normalizeOptional(formData.bio),
          city: normalizeOptional(formData.city),
          address: normalizeOptional(formData.address),
        })
        .eq("id", user.id);

      if (profileError) {
        setSubmitError(profileError.message);
        return;
      }

      if (formData.role === "dealer") {
        router.replace("/register/dealer");
        router.refresh();
        return;
      }

      setIsSubmitted(true);
      router.refresh();
    } catch {
      setSubmitError("Unable to complete onboarding right now. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    setSubmitError(null);
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  if (isSubmitted) {
    return (
      <section
        className="overflow-hidden rounded-[28px] border border-[#dbe8ff] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
        data-testid="onboarding-success"
      >
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="p-6 sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#eef4ff] text-[#2563eb]">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
              Onboarding complete
            </p>
            <h2 className="mt-2 font-heading text-[34px] font-semibold leading-tight text-[#202224]">
              {presentation.savedOutcome}
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-[#696665]">
              {presentation.nextStep}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild data-testid="onboarding-go-dashboard">
                <Link href={destination}>{presentation.destinationLabel}</Link>
              </Button>
              {formData.role !== "buyer" ? (
                <Button asChild variant="outline">
                  <Link href={dashboardHref}>Open dashboard</Link>
                </Button>
              ) : null}
            </div>
          </div>
          <aside className="border-t border-[#edf1f7] bg-[#f8fafc] p-6 lg:border-l lg:border-t-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8]">
              Saved profile
            </p>
            <div className="mt-4 space-y-3 text-[13px] text-[#475467]">
              <p><span className="font-semibold text-[#202224]">Name:</span> {formData.fullName}</p>
              <p><span className="font-semibold text-[#202224]">Role:</span> {presentation.title}</p>
              <p><span className="font-semibold text-[#202224]">Phone:</span> {formData.phone || "Not set"}</p>
              <p><span className="font-semibold text-[#202224]">City:</span> {formData.city || "Not set"}</p>
            </div>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <WizardShell
      title="Account Onboarding"
      description="Save the profile details Autolist can actually use for buyer, seller, and dealer workflows."
      steps={ONBOARDING_STEPS}
      activeStep={activeStep}
      stepMeta={stepCompletion.map((complete, index) => ({ complete: index === activeStep ? false : complete }))}
      testId="onboarding-wizard"
      eyebrow="Autolist Setup"
      footerMeta={
        activeStep === 2 && isSellerLike
          ? "Phone and city are required for seller and dealer accounts."
          : `Step ${activeStep + 1} of ${ONBOARDING_STEPS.length}`
      }
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={activeStep === 0 || isSaving}
            data-testid="onboarding-back"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue || isSaving}
            data-testid="onboarding-next"
            className="transition active:translate-y-px"
          >
            {isLastStep ? (isSaving ? "Saving..." : "Complete onboarding") : "Continue"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {submitError ? (
          <div
            role="alert"
            className="rounded-[14px] border border-[#ffd9d6] bg-[#fff3f2] px-4 py-3 text-[13px] leading-5 text-[#b42318]"
          >
            {submitError}
          </div>
        ) : null}

        {activeStep === 0 ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]" data-testid="onboarding-step-account">
            <section className="space-y-4 rounded-[18px] border border-[#eef2f7] bg-white p-4">
              <div>
                <p className="font-heading text-[24px] font-semibold text-[#202224]">
                  Confirm your profile
                </p>
                <p className="mt-1 text-[13px] leading-5 text-[#696665]">
                  This is the name buyers, sellers, and support staff will see across Autolist.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="register-full-name" className={FIELD_LABEL_CLASS}>Full name</Label>
                  <Input
                    id="register-full-name"
                    data-testid="onboarding-full-name"
                    placeholder="Martin Ngigi"
                    value={formData.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                    className={FIELD_INPUT_CLASS}
                  />
                  <p className={FIELD_HELP_CLASS}>Use your name or business contact name.</p>
                </div>
                <div>
                  <Label htmlFor="register-email" className={FIELD_LABEL_CLASS}>Email</Label>
                  <Input
                    id="register-email"
                    data-testid="onboarding-email"
                    placeholder="name@example.com"
                    type="email"
                    value={formData.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className={FIELD_INPUT_CLASS}
                    disabled={!previewMode}
                  />
                  <p className={FIELD_HELP_CLASS}>
                    {previewMode ? "Used for account access." : "Pulled from the signed-in account."}
                  </p>
                </div>
              </div>
            </section>

            <aside className="rounded-[18px] border border-[#dbe8ff] bg-[#f7faff] p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-white text-[#2563eb] shadow-[0_10px_28px_rgba(37,99,235,0.08)]">
                <span className="text-[16px] font-semibold">{getInitials(formData.fullName)}</span>
              </div>
              <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
                Profile preview
              </p>
              <p className="mt-2 text-[18px] font-semibold text-[#202224]">
                {formData.fullName || "Name pending"}
              </p>
              <p className="mt-1 break-all text-[13px] text-[#61708a]">
                {formData.email || "Email pending"}
              </p>
            </aside>
          </div>
        ) : null}

        {activeStep === 1 ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]" data-testid="onboarding-step-role">
            <section className="space-y-3">
              <div>
                <p className="font-heading text-[24px] font-semibold text-[#202224]">
                  Choose the account path
                </p>
                <p className="mt-1 text-[13px] leading-5 text-[#696665]">
                  The selected path changes dashboard routing and what we ask for next.
                </p>
              </div>
              <div className="grid gap-3">
                {USER_ROLE_OPTIONS.map((option) => {
                  const selected = formData.role === option.value;
                  const rolePresentation = ROLE_PRESENTATION[option.value];
                  const OptionIcon = rolePresentation.icon;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border px-4 py-4 text-left transition active:translate-y-px",
                        selected
                          ? "border-[#2563eb] bg-[#f7faff] text-[#202224] shadow-[0_12px_28px_rgba(37,99,235,0.08)]"
                          : "border-[#ededed] bg-white text-[#696665] hover:border-[#bfd3ff]"
                      )}
                      onClick={() => updateField("role", option.value)}
                      data-testid={`onboarding-role-${option.value}`}
                      aria-pressed={selected}
                    >
                      <span
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-[14px]",
                          selected ? "bg-[#2563eb] text-white" : "bg-[#f1f5f9] text-[#64748b]"
                        )}
                      >
                        <OptionIcon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-[15px] font-semibold">{option.label}</span>
                        <span className="mt-1 block text-[13px] leading-5">{rolePresentation.summary}</span>
                      </span>
                      {selected ? (
                        <CheckCircle2 className="h-5 w-5 text-[#2563eb]" />
                      ) : (
                        <ArrowRight className="h-5 w-5 text-[#c3c7cf]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <aside className="rounded-[18px] border border-[#eef2f7] bg-white p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#eef4ff] text-[#2563eb]">
                <RoleIcon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8]">
                Current selection
              </p>
              <p className="mt-2 font-heading text-[22px] font-semibold text-[#202224]">
                {presentation.title}
              </p>
              <p className="mt-2 text-[13px] leading-6 text-[#696665]">
                {presentation.nextStep}
              </p>
            </aside>
          </div>
        ) : null}

        {activeStep === 2 ? (
          <div className="space-y-5" data-testid="onboarding-step-contact">
            <div className="rounded-[18px] border border-[#eef2f7] bg-[#fbfcfe] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-[#2563eb]">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-heading text-[24px] font-semibold text-[#202224]">
                    Contact and location
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-[#696665]">
                    {isSellerLike
                      ? "Sellers and dealers need a phone number and city so buyer inquiries can route correctly."
                      : "Buyers can add optional contact details now or complete them later in profile settings."}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="register-phone" className={FIELD_LABEL_CLASS}>
                  Phone number {isSellerLike ? "" : "(optional)"}
                </Label>
                <Input
                  id="register-phone"
                  data-testid="onboarding-phone"
                  placeholder="+254 700 000000"
                  value={formData.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className={FIELD_INPUT_CLASS}
                />
                <p className={FIELD_HELP_CLASS}>Used for seller contact and account support.</p>
              </div>
              <div>
                <Label htmlFor="register-whatsapp" className={FIELD_LABEL_CLASS}>WhatsApp number</Label>
                <Input
                  id="register-whatsapp"
                  data-testid="onboarding-whatsapp"
                  placeholder="+254 700 000000"
                  value={formData.whatsapp}
                  onChange={(event) => updateField("whatsapp", event.target.value)}
                  className={FIELD_INPUT_CLASS}
                />
                <p className={FIELD_HELP_CLASS}>Defaults to phone number if you leave it matching.</p>
              </div>
              <div>
                <Label htmlFor="register-city" className={FIELD_LABEL_CLASS}>
                  City {isSellerLike ? "" : "(optional)"}
                </Label>
                <Input
                  id="register-city"
                  data-testid="onboarding-city"
                  placeholder="Nairobi"
                  value={formData.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  className={FIELD_INPUT_CLASS}
                />
                <p className={FIELD_HELP_CLASS}>Shown in profile and used for marketplace context.</p>
              </div>
              <div>
                <Label htmlFor="register-address" className={FIELD_LABEL_CLASS}>Area or street address</Label>
                <Input
                  id="register-address"
                  data-testid="onboarding-address"
                  placeholder="Westlands"
                  value={formData.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  className={FIELD_INPUT_CLASS}
                />
                <p className={FIELD_HELP_CLASS}>Keep this broad if you do not want to show exact location.</p>
              </div>
            </div>

            <div>
              <Label htmlFor="register-bio" className={FIELD_LABEL_CLASS}>Short profile note</Label>
              <Textarea
                id="register-bio"
                data-testid="onboarding-bio"
                placeholder={
                  formData.role === "buyer"
                    ? "Example: Looking for a clean family SUV around Nairobi."
                    : "Example: Private seller based in Nairobi, available for serious viewings."
                }
                value={formData.bio}
                onChange={(event) => updateField("bio", event.target.value)}
                className={FIELD_TEXTAREA_CLASS}
              />
              <p className={FIELD_HELP_CLASS}>Saved to your profile bio.</p>
            </div>
          </div>
        ) : null}

        {activeStep === 3 ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]" data-testid="onboarding-step-confirmation">
            <section className="space-y-4">
              <div>
                <p className="font-heading text-[24px] font-semibold text-[#202224]">
                  Review before saving
                </p>
                <p className="mt-1 text-[13px] leading-5 text-[#696665]">
                  These fields will be written to your Autolist profile.
                </p>
              </div>
              <div className="grid gap-3 rounded-[18px] border border-[#eef2f7] bg-white p-4 text-[13px] md:grid-cols-2">
                {[
                  ["Name", formData.fullName || "-"],
                  ["Email", formData.email || "-"],
                  ["Role", presentation.title],
                  ["Phone", formData.phone || "-"],
                  ["WhatsApp", formData.whatsapp || "-"],
                  ["City", formData.city || "-"],
                  ["Address", formData.address || "-"],
                  ["Profile note", formData.bio || "-"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[14px] bg-[#f8fafc] px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                      {label}
                    </p>
                    <p className="mt-1 break-words font-semibold leading-5 text-[#202224]">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <aside className="rounded-[18px] border border-[#dbe8ff] bg-[#f7faff] p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-white text-[#2563eb]">
                {formData.role === "dealer" ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : (
                  <BadgeCheck className="h-5 w-5" />
                )}
              </div>
              <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
                What happens next
              </p>
              <p className="mt-2 text-[13px] leading-6 text-[#61708a]">
                {formData.role === "dealer"
                  ? "After saving, you will move to the dealer verification form for business details and documents."
                  : presentation.nextStep}
              </p>
            </aside>
          </div>
        ) : null}
      </div>
    </WizardShell>
  );
}
