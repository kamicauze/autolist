"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { normalizeAuthEmail } from "@/lib/supabase/auth-email";
import { getBrowserBaseUrl } from "@/lib/supabase/auth-redirect";
import { sanitizeNextPath } from "@/lib/supabase/auth-routing";

export async function resendSignupVerification(email: string, nextPath: string) {
  const normalizedEmail = normalizeAuthEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { error: "Enter your email address above first." };
  }
  // Next validates a Server Action's Origin against its host before dispatch.
  // Resend uses an implicit verification link. Return to sign-in on this origin.
  const requestHeaders = await headers();
  const callbackUrl = new URL("/login", requestHeaders.get("origin") || getBrowserBaseUrl());
  callbackUrl.searchParams.set("verification", "complete");
  const safeNext = sanitizeNextPath(nextPath, "");
  if (safeNext) callbackUrl.searchParams.set("next", safeNext);
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: normalizedEmail,
    options: { emailRedirectTo: callbackUrl.toString() },
  });
  if (error) {
    return { error: error.status === 429
      ? "Please wait a minute before requesting another verification email."
      : "We could not send the verification email. Please try again shortly." };
  }
  return { success: true };
}
