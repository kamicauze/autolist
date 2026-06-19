"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeAuthEmail } from "@/lib/supabase/auth-email";
import { getAuthCallbackUrl } from "@/lib/supabase/auth-redirect";
import { createClient } from "@/lib/supabase/client";
import { resolvePostAuthPath, sanitizeNextPath } from "@/lib/supabase/auth-routing";
import {
  FacebookIcon,
  GoogleIcon,
  SocialAuthButton,
} from "@/components/auth/social-auth-button";

type SocialProvider = "google" | "facebook";

function inferRegisterRole(nextPath: string) {
  if (nextPath.startsWith("/register/dealer")) return "dealer";
  if (nextPath.startsWith("/dashboard/listings")) return "seller";
  return null;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [socialLoading, setSocialLoading] = React.useState<SocialProvider | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const requestedNextPath = searchParams.get("next");
  const safeNextPathForOAuth = requestedNextPath
    ? sanitizeNextPath(requestedNextPath, "")
    : "";
  const inferredRole = safeNextPathForOAuth
    ? inferRegisterRole(safeNextPathForOAuth)
    : null;
  const registerParams = new URLSearchParams();
  if (safeNextPathForOAuth) {
    registerParams.set("next", safeNextPathForOAuth);
  }
  if (inferredRole) {
    registerParams.set("role", inferredRole);
  }
  const registerHref = safeNextPathForOAuth
    ? `/register?${registerParams.toString()}`
    : "/register";

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizeAuthEmail(email),
      password,
    });

    if (error) {
      const isDeactivated =
        (error as { code?: string }).code === "user_banned" ||
        /banned|deactiv/i.test(error.message);
      setErrorMessage(
        isDeactivated
          ? "This account has been deactivated. Contact support to reactivate it."
          : error.message
      );
      setIsLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("Unable to establish your session. Please try again.");
      setIsLoading(false);
      return;
    }

    const destination = await resolvePostAuthPath(supabase, user.id, requestedNextPath);
    router.replace(destination);
    router.refresh();
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    setErrorMessage(null);
    setSocialLoading(provider);

    const supabase = createClient();
    const redirectTo = getAuthCallbackUrl(safeNextPathForOAuth);
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
    <form className="space-y-5" onSubmit={handleLogin}>
      <div className="space-y-4">
        <label className="block space-y-2 text-sm font-medium text-[#24272C]" htmlFor="login-email">
          <span>Email address</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 rounded-[14px] border-[#EDEDED] pl-11 text-[15px] focus-visible:ring-primary/30"
              placeholder="name@example.com"
              data-testid="login-email"
            />
          </div>
          <span className="block text-[12px] font-normal text-[#8a8a8a]">
            Use the email connected to your buyer, seller, or dealer account.
          </span>
        </label>

        <label className="block space-y-2 text-sm font-medium text-[#24272C]" htmlFor="login-password">
          <span>Password</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 rounded-[14px] border-[#EDEDED] px-11 text-[15px] focus-visible:ring-primary/30"
              placeholder="********"
              data-testid="login-password"
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
        </label>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-[12px] text-[#8a8a8a]">Protected by Supabase Auth.</p>
        <Link href="/forgot-password" className="text-sm font-semibold text-[#24272C] hover:text-primary">
          Forgot password
        </Link>
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

      <Button
        type="submit"
        className="h-12 w-full rounded-[14px] text-base transition active:translate-y-px"
        disabled={isLoading || !!socialLoading}
        data-testid="login-submit"
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>

      <p className="text-center text-sm text-[#24272C]">
        Don&apos;t have an account?{" "}
        <Link href={registerHref} className="text-primary hover:underline">
          Register
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
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading || !!socialLoading}
          data-testid="login-google"
        />
        <SocialAuthButton
          label="Facebook"
          icon={<FacebookIcon />}
          onClick={() => handleSocialLogin("facebook")}
          disabled={isLoading || !!socialLoading}
          data-testid="login-facebook"
        />
      </div>
    </form>
  );
}
