"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NoPackageWarning() {
  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
      </div>
      <h2 className="text-xl font-bold text-foreground">No Active Package</h2>
      <p className="text-sm text-muted-foreground">
        You need an active listing package to create new listings. Choose a plan
        to get started and reach more buyers.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard/membership">
          <Button>View Plans</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
