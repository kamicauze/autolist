import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type DealerVerificationWorkflow = {
  dealer_id: string;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  verification_notes: string | null;
  preferred_confirmation_channel: "email";
};

export async function getDealerVerificationWorkflows(
  dealerIds: string[],
): Promise<Map<string, DealerVerificationWorkflow>> {
  const requestedIds = [...new Set(dealerIds)];
  if (requestedIds.length === 0) return new Map();

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return new Map();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, deactivated_at")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError || !profile || profile.deactivated_at) return new Map();

  let authorizedIds = requestedIds;
  if (profile.role !== "admin" && profile.role !== "super_admin") {
    const { data: ownedDealers, error: ownershipError } = await supabase
      .from("dealers")
      .select("id")
      .in("id", requestedIds)
      .eq("profile_id", user.id);
    if (ownershipError) throw new Error("Unable to verify dealership ownership.");
    authorizedIds = (ownedDealers ?? []).map((dealer: { id: string }) => dealer.id);
  }
  if (authorizedIds.length === 0) return new Map();

  const { data, error } = await createAdminClient()
    .from("dealer_verification_workflows")
    .select("dealer_id, submitted_at, reviewed_by, reviewed_at, review_notes, verification_notes, preferred_confirmation_channel")
    .in("dealer_id", authorizedIds);
  if (error) throw new Error("Unable to load private dealership verification details.");

  return new Map((data ?? []).map((workflow: DealerVerificationWorkflow) => [workflow.dealer_id, workflow]));
}
