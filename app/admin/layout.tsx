import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/listings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold text-primary">Autolist Admin</h1>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin/listings" className="text-gray-600 hover:text-gray-900 font-medium">
                Pending Listings
              </Link>
            </nav>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            Back to Dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
