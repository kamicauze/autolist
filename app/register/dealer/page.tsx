import Link from "next/link";
import { redirect } from "next/navigation";
import { AutolistLogo } from "@/components/brand/autolist-logo";
import { DealerRegistrationFlow } from "@/components/seller/dealer-registration-flow";
import { createClient } from "@/lib/supabase/server";
import type { DealerStatus } from "@/lib/types/dealer";

export default async function RegisterDealerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/register/dealer");

  const [{ data: profile }, { data: dealer }] = await Promise.all([
    supabase.from("profiles").select("role, deactivated_at").eq("id", user.id).maybeSingle(),
    supabase.from("dealers").select("name, status").eq("profile_id", user.id).maybeSingle<{ name: string; status: DealerStatus }>(),
  ]);
  if (profile?.deactivated_at) redirect("/account-deactivated");
  if (!profile || !["buyer", "seller", "dealer"].includes(profile.role)) redirect("/dashboard");
  if (dealer?.status === "APPROVED") redirect("/dashboard");
  if (dealer?.status === "PENDING" || dealer?.status === "REJECTED") redirect("/dashboard/verification");

  return (
    <div className="min-h-dvh bg-muted text-[#14213d]">
      <header className="flex h-[62px] items-center justify-between border-b border-border bg-white px-4 lg:h-[68px] lg:px-12">
        <Link href="/" aria-label="Autolist home"><AutolistLogo className="h-7 w-28 lg:h-[34px] lg:w-[132px]" /></Link>
        <span className="text-[13px] font-bold">Dealer setup</span>
      </header>
      <DealerRegistrationFlow existingName={dealer?.name} />
    </div>
  );
}
