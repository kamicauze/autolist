import Link from "next/link";
import { CheckCircle2, Clock3, FileText, ShieldAlert, ShieldCheck } from "lucide-react";
import { getMyDealerVerification } from "@/lib/data/dealers";
import { getImageUrl } from "@/lib/utils/listings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatDate(value: string | null | undefined) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusSummary({
  status,
  rejectionReason,
}: {
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
}) {
  if (status === "APPROVED") {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Dealer verification approved</p>
          <p className="mt-1 text-sm text-emerald-700">
            Your dealership is verified and can publish listings with dealer visibility.
          </p>
        </div>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 text-red-600" />
        <div>
          <p className="text-sm font-semibold text-red-800">Verification needs changes</p>
          <p className="mt-1 text-sm text-red-700">
            {rejectionReason || "Your submission was rejected. Update the details and resubmit."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4">
      <Clock3 className="mt-0.5 h-5 w-5 text-blue-600" />
      <div>
        <p className="text-sm font-semibold text-blue-800">Verification under review</p>
        <p className="mt-1 text-sm text-blue-700">
          Your dealer application is pending review. Admin will inspect the submitted documents
          before activating the profile.
        </p>
      </div>
    </div>
  );
}

export async function VerificationPage() {
  const dealer = await getMyDealerVerification();

  if (!dealer) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dealer Verification</h1>
          <p className="text-sm text-muted-foreground">
            Submit your dealership details and supporting documents for manual review.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">No dealer application yet</p>
              <p className="mt-1 text-sm text-amber-700">
                Complete the dealership onboarding flow before the admin team can verify your
                profile.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Button asChild>
              <Link href="/register/dealer">Start dealer application</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dealer Verification</h1>
          <p className="text-sm text-muted-foreground">
            Track your dealer verification status and submitted documents.
          </p>
        </div>
        <Badge
          variant={
            dealer.status === "APPROVED"
              ? "success"
              : dealer.status === "REJECTED"
                ? "destructive"
                : "warning"
          }
        >
          {dealer.status}
        </Badge>
      </div>

      <StatusSummary status={dealer.status} rejectionReason={dealer.rejection_reason} />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Submission details</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Dealer
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">{dealer.name}</p>
              <p className="mt-1 text-sm text-slate-600">{dealer.email}</p>
              <p className="mt-1 text-sm text-slate-600">{dealer.mobile}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Timeline
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Submitted: {formatDate(dealer.submitted_at || dealer.created_at)}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Reviewed: {formatDate(dealer.reviewed_at)}
              </p>
            </div>
          </div>

          {dealer.review_notes ? (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Review notes
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{dealer.review_notes}</p>
            </div>
          ) : null}

          {dealer.status === "REJECTED" ? (
            <div className="mt-6">
              <Button asChild>
                <Link href="/register/dealer">Update and resubmit</Link>
              </Button>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Submitted documents</h2>
          <div className="mt-4 space-y-3">
            {dealer.documents.map((document) => {
              const url = getImageUrl(document.r2_key);
              return (
                <a
                  key={document.id}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{document.display_name}</p>
                      <p className="text-xs text-slate-500">
                        {document.document_type.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-primary">Open</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
