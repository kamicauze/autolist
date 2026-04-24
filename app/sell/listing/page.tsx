import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SellerListingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/listings/new")}`);
  }

  redirect("/dashboard/listings/new");
}
