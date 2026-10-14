"use client";

import * as React from "react";
import { resendSignupVerification } from "@/lib/actions/auth-verification";

export function ResendVerification({ email, nextPath = "", disabled = false }: { email: string; nextPath?: string; disabled?: boolean }) {
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(false);
  React.useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown(false), 60_000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function resend() {
    setPending(true);
    setMessage(null);
    try {
      const result = await resendSignupVerification(email, nextPath);
      setFailed("error" in result);
      setMessage(result.error || "If this email has an account awaiting verification, a new link has been sent. Check your inbox and spam folder.");
      if (!result.error) setCooldown(true);
    } catch {
      setFailed(true);
      setMessage("We could not reach the account service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2 text-sm">
      <p className="text-[#696f78]">Verification link expired or missing?</p>
      <button type="button" onClick={resend} disabled={disabled || pending || cooldown}
        className="font-semibold text-primary underline underline-offset-4 disabled:opacity-60">
        {pending ? "Sending verification email..." : cooldown ? "Email requested — wait a minute to resend" : "Resend verification email"}
      </button>
      {message && <p role={failed ? "alert" : "status"} className={failed ? "text-destructive" : "text-[#696f78]"}>{message}</p>}
    </div>
  );
}
