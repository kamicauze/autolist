import { buildDuplicateReviewSuggestion } from "@/lib/ai/duplicate-review";
import { createOptionalAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { DuplicateReviewSuggestion } from "@/lib/types/duplicate-review";
import type { Listing } from "@/lib/types/listing";

export async function getDuplicateReviewSuggestions(
  pendingListings: Listing[]
): Promise<Record<string, DuplicateReviewSuggestion>> {
  if (pendingListings.length === 0) {
    return {};
  }

  const supabase = createOptionalAdminClient() ?? (await createClient());
  const suggestions = await Promise.all(
    pendingListings.map(async (listing) => {
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          seller:profiles!seller_id(id, full_name, avatar_url, email)
        `)
        .in("status", ["pending", "active"])
        .eq("make", listing.make)
        .eq("model", listing.model)
        .neq("id", listing.id)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) {
        console.error("Duplicate review fetch error:", error);
        return [listing.id, await buildDuplicateReviewSuggestion(listing, [])] as const;
      }

      const suggestion = await buildDuplicateReviewSuggestion(listing, (data as Listing[]) || []);
      return [listing.id, suggestion] as const;
    })
  );

  return Object.fromEntries(suggestions);
}
