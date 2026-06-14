"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function AccountDeactivatedPage() {
  React.useEffect(() => {
    // Clear any lingering session so the deactivated user is fully signed out.
    const supabase = createClient();
    void supabase.auth.signOut();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <section className="w-full max-w-[520px] rounded-[24px] border border-[#e5e7eb] bg-white p-8 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#fef2f2] text-[#dc2626]">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-heading text-[26px] font-semibold text-[#111827]">
            This account is deactivated
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-[#64748b]">
            Sign-in for this account has been disabled. If you think this is a mistake or you want to
            reactivate the account, please contact support.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[#2563eb] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              Back to home
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
