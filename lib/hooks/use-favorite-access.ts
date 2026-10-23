"use client";

import * as React from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

// Guests retain the sign-in prompt. Authenticated access uses the stored role.
export function useFavoriteAccess() {
  const { user, loading } = useAuth();
  const [buyerId, setBuyerId] = React.useState<string | null>(null);
  React.useEffect(() => {
    let active = true;
    if (user) {
      void createClient().from("profiles").select("role").eq("id", user.id).maybeSingle()
        .then(({ data }) => {
          if (active) setBuyerId(data?.role === "buyer" ? user.id : null);
        });
    }
    return () => { active = false; };
  }, [user]);
  return !loading && (!user || buyerId === user.id);
}
