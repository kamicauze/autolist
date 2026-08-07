"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  buildDealerPublicProfileUpdate,
  buildSellerProfileUpdate,
  canUpdateDealerPublicProfile,
  profileUpdateSchema,
} from "@/lib/profile/profile-update";

type ProfileRoleRow = {
  role: string | null;
};

type OwnedDealerRow = {
  id: string;
  profile_id: string;
  status: string;
  social_links: Record<string, unknown> | null;
};

export async function updateMyProfile(input: unknown) {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Check the profile details and try again.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const { data: profile, error: profileReadError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<ProfileRoleRow>();

  if (profileReadError || !profile) {
    return { error: profileReadError?.message || "Profile not found." };
  }

  let ownedDealer: OwnedDealerRow | null = null;
  if (profile.role === "dealer") {
    const { data, error } = await supabase
      .from("dealers")
      .select("id, profile_id, status, social_links")
      .eq("profile_id", user.id)
      .maybeSingle<OwnedDealerRow>();

    if (error) {
      return { error: error.message };
    }

    ownedDealer = data;
  }

  const mayUpdateDealer = canUpdateDealerPublicProfile({
    viewerId: user.id,
    profileRole: profile.role,
    dealer: ownedDealer,
  });

  if (
    mayUpdateDealer &&
    (!parsed.data.publicEmail || !parsed.data.phone || !parsed.data.whatsapp)
  ) {
    return {
      error:
        "Public dealership email, phone number, and WhatsApp number are required.",
    };
  }

  const { data: updatedProfile, error: profileUpdateError } = await supabase
    .from("profiles")
    .update(buildSellerProfileUpdate(parsed.data))
    .eq("id", user.id)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (profileUpdateError || !updatedProfile) {
    return { error: profileUpdateError?.message || "Unable to update the profile." };
  }

  if (mayUpdateDealer && ownedDealer) {
    const { data: updatedDealer, error: dealerUpdateError } = await supabase
      .from("dealers")
      .update(buildDealerPublicProfileUpdate(parsed.data, ownedDealer.social_links))
      .eq("id", ownedDealer.id)
      .eq("profile_id", user.id)
      .eq("status", "APPROVED")
      .select("id")
      .maybeSingle<{ id: string }>();

    if (dealerUpdateError || !updatedDealer) {
      return {
        error:
          dealerUpdateError?.message ||
          "The approved public dealer profile could not be updated.",
      };
    }

    revalidatePath(`/dealers/${ownedDealer.id}`);
    revalidatePath("/dealers");
  }

  revalidatePath("/dashboard/profile");

  return {
    success: true as const,
    dealerId: mayUpdateDealer ? ownedDealer?.id ?? null : null,
  };
}
