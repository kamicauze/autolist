import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolvePostAuthPath, sanitizeNextPath } from "@/lib/supabase/auth-routing";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNextPath = sanitizeNextPath(requestUrl.searchParams.get("next"), "");
  let destination = requestedNextPath || "/";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

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
