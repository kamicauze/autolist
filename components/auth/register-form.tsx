"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { USER_ROLE_OPTIONS, type UserRole } from "@/lib/constants/marketplace";
import {
  FacebookIcon,
  GoogleIcon,
  SocialAuthButton,
} from "@/components/auth/social-auth-button";

type SocialProvider = "google" | "facebook";

function resolveRole(rawRole: string | null): UserRole {
  const isKnownRole = USER_ROLE_OPTIONS.some((option) => option.value === rawRole);
  return isKnownRole ? (rawRole as UserRole) : "buyer";
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [infoMessage, setInfoMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [socialLoading, setSocialLoading] = React.useState<SocialProvider | null>(null);

  const selectedRole = React.useMemo(
    () => resolveRole(searchParams.get("role")),
    [searchParams]
  );

  const nextPath =
    selectedRole === "dealer"
      ? "/register/dealer"
      : `/register/onboarding?role=${selectedRole}`;
  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;

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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
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
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
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
    <form className="space-y-6" onSubmit={handleRegister}>
      <div className="space-y-4">
        <label className="block space-y-2 text-sm font-medium text-[#24272C]" htmlFor="register-name">
          <span>User name</span>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
            <Input
              id="register-name"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="h-12 rounded-[14px] border-[#EDEDED] pl-11"
              placeholder="Car Empire"
              data-testid="register-full-name"
            />
          </div>
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
              className="h-12 rounded-[14px] border-[#EDEDED] pl-11"
              placeholder="support@carempire.com"
              data-testid="register-email"
            />
          </div>
        </label>

        <label className="block space-y-2 text-sm font-medium text-[#24272C]" htmlFor="register-password">
          <span>Password</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 rounded-[14px] border-[#EDEDED] pl-11"
              placeholder="********"
              data-testid="register-password"
            />
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
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-12 rounded-[14px] border-[#EDEDED] pl-11"
              placeholder="********"
              data-testid="register-confirm-password"
            />
          </div>
        </label>
      </div>

      {selectedRole !== "buyer" && (
        <p className="text-xs text-[#696665]">
          Role selected: <span className="font-semibold uppercase text-[#24272C]">{selectedRole}</span>
        </p>
      )}

      {errorMessage && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {infoMessage && (
        <p className="rounded-lg border border-info/20 bg-info/10 px-3 py-2 text-sm text-info">
          {infoMessage}
        </p>
      )}

      <Button
        type="submit"
        className="h-12 w-full rounded-[14px] text-base"
        disabled={isLoading || !!socialLoading}
        data-testid="register-submit"
      >
        {isLoading ? "Creating account..." : "Sign Up"}
      </Button>

      <p className="text-center text-sm text-[#24272C]">
        Do you have an account?{" "}
        <Link href={loginHref} className="text-primary hover:underline">
          Login
        </Link>
      </p>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#EDEDED]" />
        <span className="text-xs text-[#696665]">or login with</span>
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
