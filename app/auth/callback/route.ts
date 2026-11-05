import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolvePostAuthPath, sanitizeNextPath } from "@/lib/supabase/auth-routing";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNextPath = sanitizeNextPath(requestUrl.searchParams.get("next"), "");
  let destination = requestedNextPath || "/";

  const redirectToLogin = (status = "failed") => {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("verification", status);
    if (requestedNextPath) loginUrl.searchParams.set("next", requestedNextPath);
    return NextResponse.redirect(loginUrl);
  };

  if (requestUrl.searchParams.has("error") || requestUrl.searchParams.has("error_code")) {
    return redirectToLogin();
  }

  // Supabase has confirmed the email before issuing this code. Password sign-in
  // works even when the email opens in a browser without the signup verifier.
  if (code && requestUrl.searchParams.get("flow") === "signup") {
    return redirectToLogin("complete");
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return redirectToLogin("signin");

    if (requestedNextPath) {
      destination = requestedNextPath;
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        destination = await resolvePostAuthPath(supabase, user.id);
      }
    }
  }

  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
