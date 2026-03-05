"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerificationBannerProps {
  show?: boolean;
}

export function VerificationBanner({ show = true }: VerificationBannerProps) {
  if (!show) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
      <p className="flex-1 text-sm text-amber-800">
        Your account is not verified yet. Verify your account to unlock all
        features and build trust with buyers.
      </p>
      <Link href="/dashboard/verification">
        <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
          Verify Now
        </Button>
      </Link>
    </div>
  );
}
