"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { resolvePostAuthPath, sanitizeNextPath } from "@/lib/supabase/auth-routing";
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
  const [socialLoading, setSocialLoading] = React.useState<SocialProvider | null>(null);

  const requestedNextPath = searchParams.get("next");
  const safeNextPathForOAuth = requestedNextPath
    ? sanitizeNextPath(requestedNextPath, "")
    : "";
  const registerHref = safeNextPathForOAuth
    ? `/register?next=${encodeURIComponent(safeNextPathForOAuth)}`
    : "/register";

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(error.message);
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
    const redirectTo = safeNextPathForOAuth
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNextPathForOAuth)}`
      : `${window.location.origin}/auth/callback`;
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
    <form className="space-y-6" onSubmit={handleLogin}>
      <div className="space-y-4">
        <label className="block space-y-2 text-sm font-medium text-[#24272C]" htmlFor="login-email">
          <span>Account</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 rounded-[14px] border-[#EDEDED] pl-11"
              placeholder="support@carempire.com"
              data-testid="login-email"
            />
          </div>
        </label>

        <label className="block space-y-2 text-sm font-medium text-[#24272C]" htmlFor="login-password">
          <span>Password</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 rounded-[14px] border-[#EDEDED] pl-11"
              placeholder="********"
              data-testid="login-password"
            />
          </div>
        </label>
      </div>

      <div className="text-right">
        <Link href="/forgot-password" className="text-sm text-[#24272C] hover:text-primary">
          Forgot password
        </Link>
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        className="h-12 w-full rounded-[14px] text-base"
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
