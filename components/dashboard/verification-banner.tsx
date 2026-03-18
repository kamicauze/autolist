import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { getMyDealerVerification } from "@/lib/data/dealers";
import { Button } from "@/components/ui/button";

export async function VerificationBanner() {
  const dealer = await getMyDealerVerification();

  if (!dealer) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Become a verified dealer</p>
              <p className="mt-1 text-sm text-slate-600">
                Submit your dealership documents to unlock dealer visibility and review workflows.
              </p>
            </div>
          </div>
          <Button asChild size="sm">
            <Link href="/register/dealer">
              Start verification
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (dealer.status === "APPROVED") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Dealer verification approved</p>
            <p className="mt-1 text-sm text-slate-600">
              Your dealership is verified. Listings can now be published with dealer identity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (dealer.status === "REJECTED") {
    return (
      <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Dealer verification rejected</p>
              <p className="mt-1 text-sm text-slate-600">
                {dealer.rejection_reason || "Update your documents and resubmit for review."}
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/register/dealer">Resubmit application</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Clock3 className="mt-0.5 h-5 w-5 text-blue-600" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Dealer verification in review</p>
          <p className="mt-1 text-sm text-slate-600">
            Submitted on{" "}
            {new Date(dealer.submitted_at || dealer.created_at).toLocaleDateString("en-KE", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            . We&apos;ll update your dashboard once the admin team completes review.
          </p>
        </div>
      </div>
    </div>
  );
}
