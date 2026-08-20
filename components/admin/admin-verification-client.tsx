"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Phone,
  ShieldCheck,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import {
  approveSellerVerification,
  rejectSellerVerification,
} from "@/lib/actions/seller-verification";
import type { DealerVerificationRecord } from "@/lib/types/dealer";
import type { SellerVerificationRecord } from "@/lib/types/seller-verification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminDealersClient } from "./admin-dealers-client";
import {
  AdminFeedbackBanner,
  AdminPageHeader,
  AdminPromptDialog,
  type AdminFeedbackState,
} from "./admin-ui";

type VerificationAudience = "sellers" | "dealers";

function formatDate(value: string | null | undefined) {
  if (!value) return "Not submitted";
  return new Date(value).toLocaleString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SellerReviewQueue({
  sellers,
}: {
  sellers: SellerVerificationRecord[];
}) {
  const [rows, setRows] = React.useState(sellers);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [rejectingId, setRejectingId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<AdminFeedbackState>(null);

  async function approve(profileId: string) {
    setProcessingId(profileId);
    setFeedback(null);
    const result = await approveSellerVerification(profileId);
    setProcessingId(null);
    if ("error" in result) {
      setFeedback({
        tone: "error",
        message: result.error || "Unable to approve this verification.",
      });
      return;
    }
    setRows((current) => current.filter((row) => row.profile_id !== profileId));
    setFeedback({
      tone: "success",
      message: "Private seller verification approved.",
    });
  }

  async function reject(profileId: string, reason: string) {
    setProcessingId(profileId);
    setFeedback(null);
    const result = await rejectSellerVerification(profileId, reason);
    setProcessingId(null);
    if ("error" in result) {
      setFeedback({
        tone: "error",
        message: result.error || "Unable to reject this verification.",
      });
      return;
    }
    setRows((current) => current.filter((row) => row.profile_id !== profileId));
    setRejectingId(null);
    setFeedback({
      tone: "success",
      message: "Private seller verification rejected.",
    });
  }

  const rejectingSeller =
    rows.find((row) => row.profile_id === rejectingId) || null;

  return (
    <div className="space-y-4">
      <AdminFeedbackBanner feedback={feedback} />
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No pending seller reviews
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Submitted ID and phone checks will appear here automatically.
          </p>
        </div>
      ) : (
        rows.map((seller) => {
          const isProcessing = processingId === seller.profile_id;
          return (
            <section
              key={seller.profile_id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {seller.profile?.full_name ||
                          seller.profile?.email ||
                          "Private seller"}
                      </h3>
                      <Badge variant="warning">Pending review</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      Submitted {formatDate(seller.submitted_at)}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <Phone className="mt-0.5 h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Phone ownership
                          </p>
                          <p className="mt-3 text-sm font-medium text-slate-900">
                            {seller.phone || "No phone"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Verified {formatDate(seller.phone_verified_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <UserRoundCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Account
                          </p>
                          <p className="mt-3 text-sm text-slate-700">
                            {seller.profile?.email || "Email unavailable"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-xl space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Private identity documents
                    </p>
                    <div className="mt-3 space-y-3">
                      {seller.documents.map((document) => (
                        <div
                          key={document.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <FileText className="h-5 w-5 shrink-0 text-slate-400" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {document.display_name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {document.document_type.replace(/_/g, " ")} ·{" "}
                                {formatFileSize(document.size_bytes)}
                              </p>
                            </div>
                          </div>
                          {document.signed_url ? (
                            <a
                              href={document.signed_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-9 shrink-0 items-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                            >
                              Review
                              <ExternalLink className="ml-2 h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <span className="text-xs text-red-600">
                              Link unavailable
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      Review links expire after five minutes. Do not download or
                      retain copies outside the verification workflow.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={isProcessing}
                      onClick={() => setRejectingId(seller.profile_id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      disabled={isProcessing}
                      onClick={() => void approve(seller.profile_id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {isProcessing ? "Processing..." : "Approve"}
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          );
        })
      )}

      <AdminPromptDialog
        open={Boolean(rejectingSeller)}
        onOpenChange={(open) => {
          if (!open) setRejectingId(null);
        }}
        title="Reject private seller verification"
        description="Explain what needs to be corrected before the seller resubmits."
        label="Rejection reason"
        placeholder="The ID image is cropped, unreadable, expired, or does not match the seller profile."
        confirmLabel="Reject verification"
        pending={Boolean(rejectingId && processingId === rejectingId)}
        onConfirm={(reason) => {
          if (rejectingId) void reject(rejectingId, reason);
        }}
      />
    </div>
  );
}

export function AdminVerificationClient({
  dealers,
  sellers,
}: {
  dealers: DealerVerificationRecord[];
  sellers: SellerVerificationRecord[];
}) {
  const [audience, setAudience] = React.useState<VerificationAudience>(
    sellers.length > 0 ? "sellers" : "dealers",
  );
  const total = dealers.length + sellers.length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Verification (KYC)"
        action={
          <Badge variant={total > 0 ? "warning" : "success"} className="gap-1">
            {total > 0 ? (
              <Clock className="h-3 w-3" />
            ) : (
              <ShieldCheck className="h-3 w-3" />
            )}
            {total} Pending
          </Badge>
        }
      />

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        {[
          {
            value: "sellers" as const,
            label: "Private sellers",
            count: sellers.length,
          },
          {
            value: "dealers" as const,
            label: "Dealers",
            count: dealers.length,
          },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setAudience(tab.value)}
            className={cn(
              "inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold transition",
              audience === tab.value
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "ml-2 rounded-full px-2 py-0.5 text-xs",
                audience === tab.value ? "bg-white/15" : "bg-slate-100",
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {audience === "sellers" ? (
        <SellerReviewQueue sellers={sellers} />
      ) : (
        <AdminDealersClient dealers={dealers} embedded />
      )}
    </div>
  );
}
