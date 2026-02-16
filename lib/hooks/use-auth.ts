"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type AuthState = {
  user: User | null;
  loading: boolean;
};

/**
 * Hook to subscribe to Supabase auth state changes.
 * Returns the current user and loading state.
 */
export function useAuth(): AuthState {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    loading: true,
  });

  React.useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setState({ user, loading: false });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, loading: false });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
