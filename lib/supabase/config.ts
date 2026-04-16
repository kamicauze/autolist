const PLACEHOLDER_SUPABASE_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_SUPABASE_ANON_KEY =
  "placeholder-public-anon-key-for-runtime-fallback";

type SupabasePublicEnv = {
  url: string;
  anonKey: string;
  configured: boolean;
};

export function getSupabasePublicEnv(): SupabasePublicEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const configured = Boolean(url && anonKey);

  if (configured) {
    return {
      url: url!,
      anonKey: anonKey!,
      configured: true,
    };
  }

  console.warn(
    "Supabase public environment variables are missing. Falling back to placeholder values."
  );

  return {
    url: url || PLACEHOLDER_SUPABASE_URL,
    anonKey: anonKey || PLACEHOLDER_SUPABASE_ANON_KEY,
    configured: false,
  };
}
