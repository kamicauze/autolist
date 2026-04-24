import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/dashboard/profile/profile-form";
import { getMyDealerVerification } from "@/lib/data/dealers";
import { getGoogleMapsApiKey } from "@/lib/server/google-maps";
import type { SellerProfileRecord } from "@/lib/types/profile";

const PROFILE_SELECT = `
  full_name,
  avatar_url,
  role,
  phone,
  whatsapp,
  bio,
  city,
  address,
  website,
  facebook_url,
  twitter_url,
  instagram_url
`;

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [profileResult, verification] = user
    ? await Promise.all([
        supabase
          .from("profiles")
          .select(PROFILE_SELECT)
          .eq("id", user.id)
          .maybeSingle(),
        getMyDealerVerification(),
      ])
    : [{ data: null }, null];

  return (
    <ProfileForm
      user={{
        id: user?.id,
        email: user?.email,
      }}
      profile={(profileResult.data ?? null) as SellerProfileRecord | null}
      verification={verification}
      googleMapsApiKey={getGoogleMapsApiKey()}
    />
  );
}
