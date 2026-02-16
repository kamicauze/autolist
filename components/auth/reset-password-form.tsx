"use client";

import * as React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [infoMessage, setInfoMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    setInfoMessage("Password updated successfully. You can now log in.");
    setIsLoading(false);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block space-y-2 text-sm font-medium text-[#24272C]" htmlFor="reset-password">
        <span>New password</span>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
          <Input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-[14px] border-[#EDEDED] pl-11"
            placeholder="********"
            data-testid="reset-password"
          />
        </div>
      </label>

      <label
        className="block space-y-2 text-sm font-medium text-[#24272C]"
        htmlFor="reset-confirm-password"
      >
        <span>Confirm password</span>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B6B6B6]" />
          <Input
            id="reset-confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="h-12 rounded-[14px] border-[#EDEDED] pl-11"
            placeholder="********"
            data-testid="reset-confirm-password"
          />
        </div>
      </label>

      {errorMessage && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {infoMessage && (
        <p className="rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-sm text-success">
          {infoMessage}
        </p>
      )}

      <Button
        type="submit"
        className="h-12 w-full rounded-[14px] text-base"
        disabled={isLoading}
        data-testid="reset-password-submit"
      >
        {isLoading ? "Updating..." : "Update Password"}
      </Button>

      <p className="text-center text-sm text-[#24272C]">
        Back to{" "}
        <Link href="/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
