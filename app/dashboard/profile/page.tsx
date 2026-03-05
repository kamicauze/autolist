import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/dashboard/profile/profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <ProfileForm
      user={{
        email: user?.email,
        user_metadata: user?.user_metadata,
      }}
    />
  );
}
