"use client";

import * as React from "react";
import Image from "next/image";
import { CheckCircle2, Clock, ExternalLink, FileText, ImageIcon, XCircle } from "lucide-react";
import { approveDealer, rejectDealer } from "@/lib/actions/dealers";
import { getImageUrl } from "@/lib/utils/listings";
import type { DealerVerificationRecord } from "@/lib/types/dealer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AdminFeedbackBanner,
  AdminPageHeader,
  AdminPromptDialog,
  type AdminFeedbackState,
} from "./admin-ui";

interface AdminDealersClientProps {
  dealers: DealerVerificationRecord[];
}

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

function isImageDocument(mimeType: string | null) {
  return mimeType?.startsWith("image/") ?? false;
}

export function AdminDealersClient({ dealers }: AdminDealersClientProps) {
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [dealerRows, setDealerRows] = React.useState(dealers);
  const [feedback, setFeedback] = React.useState<AdminFeedbackState>(null);
  const [rejectingDealerId, setRejectingDealerId] = React.useState<string | null>(null);

  const handleApprove = async (dealerId: string) => {
    setProcessingId(dealerId);
    setFeedback(null);
    const result = await approveDealer(dealerId);
    if (result.error) {
      setFeedback({ tone: "error", message: result.error });
      setProcessingId(null);
      return;
    }

    setDealerRows((current) => current.filter((dealer) => dealer.id !== dealerId));
    setFeedback({ tone: "success", message: "Dealer verification approved." });
    setProcessingId(null);
  };

  const handleReject = async (dealerId: string, reason: string) => {
    setProcessingId(dealerId);
    setFeedback(null);
    const result = await rejectDealer(dealerId, reason);
    if (result.error) {
      setFeedback({ tone: "error", message: result.error });
      setProcessingId(null);
      return;
    }

    setDealerRows((current) => current.filter((dealer) => dealer.id !== dealerId));
    setFeedback({ tone: "success", message: "Dealer verification rejected." });
    setRejectingDealerId(null);
    setProcessingId(null);
  };

  const rejectingDealer = dealerRows.find((dealer) => dealer.id === rejectingDealerId) ?? null;

  if (dealerRows.length === 0) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Verification (KYC)" />
        <AdminFeedbackBanner feedback={feedback} />
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No pending dealer reviews</h3>
          <p className="mt-1 text-sm text-slate-500">
            New verification submissions will show up here automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Verification (KYC)"
        action={
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" />
            {dealerRows.length} Pending
          </Badge>
        }
      />

      <p className="text-sm text-slate-600">
        {dealerRows.length} dealer application{dealerRows.length === 1 ? "" : "s"} waiting for
        review.
      </p>

      <AdminFeedbackBanner feedback={feedback} />

      <div data-tour="admin-page-table" className="space-y-4">
        {dealerRows.map((dealer) => {
          const isProcessing = processingId === dealer.id;

          return (
            <section
              key={dealer.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">{dealer.name}</h3>
                      <Badge variant="warning">Pending review</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      Submitted {formatDate(dealer.submitted_at || dealer.created_at)}
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Dealership
                      </p>
                      <div className="mt-3 space-y-1 text-sm text-slate-700">
                        <p>{dealer.business_name || dealer.name}</p>
                        <p>{dealer.address || "No address provided"}</p>
                        <p>
                          {[dealer.city, dealer.location].filter(Boolean).join(" • ") || "No location"}
                        </p>
                        <p>{dealer.email}</p>
                        <p>{dealer.mobile}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Primary Contact
                      </p>
                      <div className="mt-3 space-y-1 text-sm text-slate-700">
                        <p>{dealer.contact_person?.name || "No contact name"}</p>
                        <p>{dealer.contact_person?.role || "No role provided"}</p>
                        <p>{dealer.contact_person?.mobile || "No phone provided"}</p>
                        <p>{dealer.contact_person?.email || "No email provided"}</p>
                      </div>
                    </div>
                  </div>

                  {dealer.about_text ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        About
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{dealer.about_text}</p>
                    </div>
                  ) : null}

                  {dealer.verification_notes ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Applicant Notes
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {dealer.verification_notes}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="w-full max-w-xl space-y-4">
                  <div
                    data-tour="kyc-documents"
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Documents
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {dealer.documents.map((document) => {
                        const url = getImageUrl(document.r2_key);
                        return (
                          <a
                            key={document.id}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="group rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-emerald-300"
                          >
                            <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                              {isImageDocument(document.mime_type) ? (
                                <Image
                                  src={url}
                                  alt={document.display_name}
                                  width={240}
                                  height={112}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <FileText className="h-10 w-10 text-slate-400" />
                              )}
                            </div>
                            <div className="mt-3 flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {document.display_name}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {document.document_type.replace(/_/g, " ")}
                                </p>
                              </div>
                              {isImageDocument(document.mime_type) ? (
                                <ImageIcon className="h-4 w-4 text-slate-400 group-hover:text-emerald-500" />
                              ) : (
                                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-500" />
                              )}
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  <div data-tour="kyc-decision" className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={isProcessing}
                      onClick={() => setRejectingDealerId(dealer.id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      disabled={isProcessing}
                      onClick={() => handleApprove(dealer.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {isProcessing ? "Processing..." : "Approve"}
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <AdminPromptDialog
        open={Boolean(rejectingDealer)}
        onOpenChange={(open) => {
          if (!open) setRejectingDealerId(null);
        }}
        title="Reject dealer verification"
        description={
          rejectingDealer
            ? `Add the reason ${rejectingDealer.name} should see for this verification decision.`
            : "Add the reason for this verification decision."
        }
        label="Rejection reason"
        placeholder="Documents are unreadable, expired, or do not match the dealership profile."
        confirmLabel="Reject dealer"
        pending={Boolean(rejectingDealerId && processingId === rejectingDealerId)}
        onConfirm={(reason) => {
          if (!rejectingDealerId) return;
          void handleReject(rejectingDealerId, reason);
        }}
      />
    </div>
  );
}
