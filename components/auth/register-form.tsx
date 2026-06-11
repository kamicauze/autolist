"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Car,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeAuthEmail } from "@/lib/supabase/auth-email";
import { getAuthCallbackUrl } from "@/lib/supabase/auth-redirect";
import { createClient } from "@/lib/supabase/client";
import { sanitizeNextPath } from "@/lib/supabase/auth-routing";
import { USER_ROLE_OPTIONS, type UserRole } from "@/lib/constants/marketplace";
import {
  FacebookIcon,
  GoogleIcon,
  SocialAuthButton,
} from "@/components/auth/social-auth-button";

type SocialProvider = "google" | "facebook";

const ROLE_PRESENTATION: Record<
  UserRole,
  {
    icon: React.ComponentType<{ className?: string }>;
    caption: string;
    nextLabel: string;
  }
> = {
  buyer: {
    icon: Car,
    caption: "Best for saving cars, comparing listings, and contacting sellers.",
    nextLabel: "Buyer onboarding",
  },
  seller: {
    icon: BriefcaseBusiness,
    caption: "Best for listing a personal vehicle and managing buyer messages.",
    nextLabel: "Seller onboarding",
  },
  dealer: {
    icon: Store,
    caption: "Best for inventory teams that need verification and dealer tools.",
    nextLabel: "Dealer profile setup",
  },
};

function resolveRole(rawRole: string | null): UserRole {
  const isKnownRole = USER_ROLE_OPTIONS.some((option) => option.value === rawRole);
  return isKnownRole ? (rawRole as UserRole) : "buyer";
}

function inferRoleFromNextPath(nextPath: string): UserRole | null {
  if (nextPath.startsWith("/register/dealer")) return "dealer";
  if (nextPath.startsWith("/dashboard/listings")) return "seller";
  return null;
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNextPath = sanitizeNextPath(searchParams.get("next"), "");
  const requestedRole = searchParams.get("role");
  const inferredRole = inferRoleFromNextPath(requestedNextPath);
  const initialRole = requestedRole ? resolveRole(requestedRole) : inferredRole || "buyer";
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(initialRole);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [infoMessage, setInfoMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [socialLoading, setSocialLoading] = React.useState<SocialProvider | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  React.useEffect(() => {
    setSelectedRole(initialRole);
  }, [initialRole]);

  const nextPath =
    selectedRole === "dealer"
      ? "/register/dealer"
      : requestedNextPath || `/register/onboarding?role=${selectedRole}`;
  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;
  const selectedRoleOption = USER_ROLE_OPTIONS.find((option) => option.value === selectedRole);
  const selectedRolePresentation = ROLE_PRESENTATION[selectedRole];
  const SelectedRoleIcon = selectedRolePresentation.icon;
  const passwordChecks = [
    { label: "8 characters", valid: password.length >= 8 },
    { label: "Capital letter", valid: /[A-Z]/.test(password) },
    { label: "Number", valid: /\d/.test(password) },
  ];
  const passwordStrength = passwordChecks.filter((item) => item.valid).length;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const normalizedEmail = normalizeAuthEmail(email);
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: getAuthCallbackUrl(nextPath),
        data: {
          full_name: fullName.trim(),
          intended_role: selectedRole,
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    if (data.user && data.session) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          role: selectedRole,
        })
        .eq("id", data.user.id);

      if (profileError) {
        setErrorMessage(profileError.message);
        setIsLoading(false);
        return;
      }
    }

    if (data.session) {
      router.replace(nextPath);
      router.refresh();
      return;
    }

    setInfoMessage(
      "Account created. Check your email to verify your account, then sign in to continue."
    );
    setIsLoading(false);
  };

  const handleSocialRegister = async (provider: SocialProvider) => {
    setErrorMessage(null);
    setInfoMessage(null);
    setSocialLoading(provider);

    const supabase = createClient();
    const redirectTo = getAuthCallbackUrl(nextPath);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (error) {
      setErrorMessage(error.message);
      setSocialLoading(null);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleRegister}>
      <div className="grid gap-4 rounded-[18px] border border-[#eef2f7] bg-[#fbfcfe] p-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-sm font-semibold text-[#24272C]">Account type</p>
            <p className="max-w-md text-xs leading-5 text-[#696665] sm:text-right">
              Choose the path that matches how you want to use Autolist.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {USER_ROLE_OPTIONS.map((option) => {
              const selected = selectedRole === option.value;
              const rolePresentation = ROLE_PRESENTATION[option.value];
              const RoleIcon = rolePresentation.icon;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`group grid min-h-[156px] grid-rows-[auto_1fr_auto] gap-3 rounded-[14px] border px-3.5 py-3 text-left transition-[border-color,background-color,transform] duration-200 active:translate-y-px ${
                    selected
                      ? "border-primary bg-white text-[#24272C] shadow-[0_10px_28px_rgba(37,99,235,0.08)]"
                      : "border-[#EDEDED] bg-white/70 text-[#696665] hover:border-primary/40 hover:bg-white"
                  }`}
                  onClick={() => setSelectedRole(option.value)}
                  data-testid={`register-role-${option.value}`}
                  aria-pressed={selected}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-[12px] transition ${
                        selected
                          ? "bg-primary text-white"
                          : "bg-[#f1f5f9] text-[#64748b] group-hover:text-primary"
                      }`}
                    >
                      <RoleIcon className="h-4 w-4" />
                    </span>
                    {selected ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-[#c3c7cf] transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="mt-1 block text-xs leading-5">{rolePresentation.caption}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="grid gap-3 rounded-[16px] border border-[#dbe8ff] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start xl:block">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#eef4ff] text-primary">
            <SelectedRoleIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 xl:mt-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
              Selected path
            </p>
            <h2 className="mt-2 font-heading text-[20px] font-semibold text-[#24272C]">
              {selectedRoleOption?.label}
            </h2>
            <p className="mt-2 text-[12px] leading-5 text-[#696665]">
              {selectedRoleOption?.description}
            </p>
            <div className="mt-4 rounded-[12px] border border-[#eef2f7] bg-[#f8fafc] px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                Next step
              </p>
              <p className="mt-1 text-[13px] font-semibold text-[#24272C]">
                {selectedRolePresentation.nextLabel}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div className="space-y-4 rounded-[18px] border border-[#eef2f7] bg-white p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-[#f8fafc] text-[#64748b]">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#24272C]">Login details</p>
            <p className="mt-1 text-xs leading-5 text-[#696665]">
              These details secure the account and can be updated later from profile settings.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-[#24272C]" htmlFor="register-name">
            <span>User name</span>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
              <Input
                id="register-name"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="h-12 rounded-[14px] border-[#EDEDED] pl-11 text-[15px] focus-visible:ring-[#2563eb]/30"
                placeholder="Your name"
                data-testid="register-full-name"
              />
            </div>
            <span className="block text-[12px] font-normal text-[#8a8a8a]">
              Use your name or the business name buyers will recognize.
            </span>
          </label>

          <label className="block space-y-2 text-sm font-medium text-[#24272C]" htmlFor="register-email">
            <span>Email address</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded-[14px] border-[#EDEDED] pl-11 text-[15px] focus-visible:ring-[#2563eb]/30"
                placeholder="name@example.com"
                data-testid="register-email"
              />
            </div>
            <span className="block text-[12px] font-normal text-[#8a8a8a]">
              Verification and account updates will be sent here.
            </span>
          </label>

          <label className="block space-y-2 text-sm font-medium text-[#24272C]" htmlFor="register-password">
            <span>Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 rounded-[14px] border-[#EDEDED] px-11 text-[15px] focus-visible:ring-[#2563eb]/30"
                placeholder="********"
                data-testid="register-password"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#8a8a8a] transition hover:bg-[#f3f4f6] hover:text-[#24272C]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex gap-1.5" aria-hidden>
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className={`h-1.5 flex-1 rounded-full ${
                    passwordStrength > index ? "bg-primary" : "bg-[#ededed]"
                  }`}
                />
              ))}
            </div>
            <div className="grid gap-1.5 text-[12px] font-normal text-[#8a8a8a] sm:grid-cols-3">
              {passwordChecks.map((item) => (
                <span
                  key={item.label}
                  className={`inline-flex items-center gap-1.5 ${
                    item.valid ? "text-primary" : "text-[#8a8a8a]"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {item.label}
                </span>
              ))}
            </div>
          </label>

          <label
            className="block space-y-2 text-sm font-medium text-[#24272C]"
            htmlFor="register-confirm-password"
          >
            <span>Confirm password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
              <Input
                id="register-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-12 rounded-[14px] border-[#EDEDED] px-11 text-[15px] focus-visible:ring-[#2563eb]/30"
                placeholder="********"
                data-testid="register-confirm-password"
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#8a8a8a] transition hover:bg-[#f3f4f6] hover:text-[#24272C]"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <span
              className={`block text-[12px] font-normal ${
                confirmPassword.length === 0 ? "text-[#8a8a8a]" : passwordsMatch ? "text-primary" : "text-destructive"
              }`}
            >
              {confirmPassword.length === 0
                ? "Re-enter your password to confirm it."
                : passwordsMatch
                  ? "Passwords match."
                  : "Passwords do not match yet."}
            </span>
          </label>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex gap-2 rounded-[14px] border border-destructive/20 bg-destructive/10 px-3 py-3 text-sm leading-5 text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {infoMessage && (
        <div className="flex gap-2 rounded-[14px] border border-info/20 bg-info/10 px-3 py-3 text-sm leading-5 text-info">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{infoMessage}</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <Button
          type="submit"
          className="h-12 w-full rounded-[14px] text-base transition active:translate-y-px"
          disabled={isLoading || !!socialLoading}
          data-testid="register-submit"
        >
          {isLoading ? "Creating account..." : `Create ${selectedRoleOption?.label ?? "account"} account`}
        </Button>

        <p className="text-center text-sm text-[#24272C] sm:text-right">
          Have an account?{" "}
          <Link href={loginHref} className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#EDEDED]" />
        <span className="text-xs text-[#696665]">or continue with</span>
        <div className="h-px flex-1 bg-[#EDEDED]" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SocialAuthButton
          label="Google"
          icon={<GoogleIcon />}
          onClick={() => handleSocialRegister("google")}
          disabled={isLoading || !!socialLoading}
          data-testid="register-google"
        />
        <SocialAuthButton
          label="Facebook"
          icon={<FacebookIcon />}
          onClick={() => handleSocialRegister("facebook")}
          disabled={isLoading || !!socialLoading}
          data-testid="register-facebook"
        />
      </div>
    </form>
  );
}
