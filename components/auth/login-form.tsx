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
import {
  resolvePostAuthPath,
  sanitizeNextPath,
} from "@/lib/supabase/auth-routing";
import {
  FacebookIcon,
  GoogleIcon,
  SocialAuthButton,
} from "@/components/auth/social-auth-button";

type SocialProvider = "google" | "facebook";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [socialLoading, setSocialLoading] =
    React.useState<SocialProvider | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const requestedNextPath = searchParams.get("next");
  const safeNextPathForOAuth = requestedNextPath
    ? sanitizeNextPath(requestedNextPath, "")
    : "";
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
          : error.message,
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

    const destination = await resolvePostAuthPath(
      supabase,
      user.id,
      requestedNextPath,
    );
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
    <form className="space-y-3" onSubmit={handleLogin}>
      <div className="grid gap-2">
        <SocialAuthButton
          label="Continue with Google"
          icon={<GoogleIcon />}
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading || !!socialLoading}
          data-testid="login-google"
          className="h-12 rounded-[10px] border-2 border-primary/70 text-[#2f3a48] hover:border-primary hover:bg-brand-tint"
        />
        <SocialAuthButton
          label="Continue with Facebook"
          icon={<FacebookIcon />}
          onClick={() => handleSocialLogin("facebook")}
          disabled={isLoading || !!socialLoading}
          data-testid="login-facebook"
          className="h-12 rounded-[10px] border-2 border-primary/70 text-[#2f3a48] hover:border-primary hover:bg-brand-tint"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#dfe3e8]" />
        <span className="text-xs text-[#696f78]">or</span>
        <div className="h-px flex-1 bg-[#dfe3e8]" />
      </div>

      <div className="space-y-3">
        <label
          className="block space-y-2 text-sm font-medium text-[#24272C]"
          htmlFor="login-email"
        >
          <span>Email address</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa2ad]" />
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 rounded-[12px] border-[#cfd5dc] pl-11 text-[15px] focus-visible:border-primary focus-visible:ring-primary/20"
              placeholder="name@example.com"
              data-testid="login-email"
            />
          </div>
        </label>

        <label
          className="block space-y-2 text-sm font-medium text-[#24272C]"
          htmlFor="login-password"
        >
          <span>Password</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa2ad]" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 rounded-[12px] border-[#cfd5dc] px-11 text-[15px] focus-visible:border-primary focus-visible:ring-primary/20"
              placeholder="********"
              data-testid="login-password"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#8a8a8a] transition hover:bg-[#f3f4f6] hover:text-[#24272C]"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </label>
      </div>

      <div className="flex items-center justify-start">
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-[#24272C] underline decoration-[#aeb5bd] underline-offset-4 hover:text-primary"
        >
          Forgot your password?
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
        className="h-12 w-full rounded-[10px] text-base transition active:translate-y-px"
        disabled={isLoading || !!socialLoading}
        data-testid="login-submit"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
