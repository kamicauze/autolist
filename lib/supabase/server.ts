
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { getSupabasePublicEnv } from "@/lib/supabase/config";

export async function createClient() {
    const cookieStore = await cookies();
    const { url, anonKey } = getSupabasePublicEnv();

    return createServerClient(
        url,
        anonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(
                    cookiesToSet: Array<{
                        name: string;
                        value: string;
                        options?: Parameters<typeof cookieStore.set>[2];
                    }>
                ) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

// One Supabase Auth round trip per request, however many server components ask.
export const getAuthUser = cache(async () => {
    const supabase = await createClient();
    return supabase.auth.getUser();
});
