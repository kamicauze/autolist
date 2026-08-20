"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  FileText,
  Loader2,
  LockKeyhole,
  Phone,
  Send,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createSellerKycUploadTicket,
  finalizeSellerKycDocument,
  requestSellerPhoneOtp,
  submitSellerVerification,
  verifySellerPhoneOtp,
} from "@/lib/actions/seller-verification";
import { createClient } from "@/lib/supabase/client";
import type {
  SellerVerificationDocumentType,
  SellerVerificationView,
} from "@/lib/types/seller-verification";
import { cn } from "@/lib/utils";
import { SellerStatusPill, SellerSurface } from "../seller-dashboard-ui";

const DOCUMENTS: Array<{
  type: SellerVerificationDocumentType;
  title: string;
  description: string;
  required: boolean;
}> = [
  {
    type: "national_id_front",
    title: "ID document",
    description:
      "Upload the front of your national ID, passport, or a PDF containing the complete document.",
    required: true,
  },
  {
    type: "national_id_back",
    title: "Reverse side",
    description:
      "Add the reverse side when the document has important information on both sides.",
    required: false,
  },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusMeta(status: string) {
  switch (status) {
    case "approved":
      return {
        label: "Verified",
        tone: "green" as const,
        title: "Private seller verified",
        description:
          "Your identity document and verified phone have been approved by Autolist.",
      };
    case "pending":
      return {
        label: "Pending review",
        tone: "amber" as const,
        title: "Verification under review",
        description:
          "Your documents are locked while the Autolist team completes its review.",
      };
    case "rejected":
      return {
        label: "Updates needed",
        tone: "red" as const,
        title: "Update and resubmit",
        description:
          "Review the feedback below, replace the affected document, and submit again.",
      };
    default:
      return {
        label: "Not submitted",
        tone: "neutral" as const,
        title: "Complete two trust checks",
        description:
          "Upload your ID and verify that you control the phone number on your seller profile.",
      };
  }
}

export function SellerVerificationPanel({
  verification,
}: {
  verification: SellerVerificationView;
}) {
  const router = useRouter();
  const record = verification.record;
  const [phone, setPhone] = React.useState(record?.phone || "+254");
  const [otp, setOtp] = React.useState("");
  const [codeSentTo, setCodeSentTo] = React.useState<string | null>(null);
  const [uploadingType, setUploadingType] =
    React.useState<SellerVerificationDocumentType | null>(null);
  const [phonePending, setPhonePending] = React.useState(false);
  const [submitPending, setSubmitPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const meta = statusMeta(record?.status || "draft");
  const hasId = Boolean(
    record?.documents.some(
      (document) => document.document_type === "national_id_front",
    ),
  );
  const phoneVerified = Boolean(record?.phone && record.phone_verified_at);
  const locked = record?.status === "pending" || record?.status === "approved";
  const canSubmit =
    verification.setupAvailable && hasId && phoneVerified && !locked;

  function clearFeedback() {
    setMessage(null);
    setError(null);
  }

  async function uploadDocument(
    documentType: SellerVerificationDocumentType,
    file: File,
  ) {
    clearFeedback();
    setUploadingType(documentType);

    try {
      const descriptor = {
        documentType,
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      };
      const ticket = await createSellerKycUploadTicket(descriptor);
      if ("error" in ticket) {
        setError(ticket.error || "Unable to prepare the secure ID upload.");
        return;
      }

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(ticket.bucket)
        .uploadToSignedUrl(ticket.path, ticket.token, file, {
          contentType: file.type,
        });
      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const finalized = await finalizeSellerKycDocument({
        ...descriptor,
        storagePath: ticket.path,
      });
      if ("error" in finalized) {
        setError(finalized.error || "Unable to save the ID document.");
        return;
      }

      setMessage("ID document uploaded securely.");
      router.refresh();
    } finally {
      setUploadingType(null);
    }
  }

  async function sendPhoneCode() {
    clearFeedback();
    setPhonePending(true);
    const result = await requestSellerPhoneOtp(phone);
    setPhonePending(false);

    if ("error" in result) {
      setError(result.error || "Unable to send the verification code.");
      return;
    }

    setCodeSentTo(result.maskedPhone);
    setMessage(
      `A six-digit code was sent to ${result.maskedPhone} by ${result.channel}.`,
    );
  }

  async function verifyPhoneCode() {
    clearFeedback();
    setPhonePending(true);
    const result = await verifySellerPhoneOtp(otp);
    setPhonePending(false);

    if ("error" in result) {
      setError(result.error || "Unable to verify the phone number.");
      return;
    }

    setCodeSentTo(null);
    setOtp("");
    setMessage("Phone number verified.");
    router.refresh();
  }

  async function submitForReview() {
    clearFeedback();
    setSubmitPending(true);
    const result = await submitSellerVerification();
    setSubmitPending(false);

    if ("error" in result) {
      setError(result.error || "Unable to submit seller verification.");
      return;
    }

    setMessage("Private seller verification submitted for review.");
    router.refresh();
  }

  if (!verification.setupAvailable) {
    return (
      <SellerSurface className="p-6">
        <div className="flex items-start gap-4 rounded-[20px] border border-[#ffe4bf] bg-[#fff8eb] p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#b54708]" />
          <div>
            <h2 className="font-heading text-[22px] font-semibold text-[#202224]">
              Verification setup pending
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-[#6d6d6d]">
              The secure private-seller verification schema has not been applied
              to this environment yet. No ID document or phone code can be
              accepted until that controlled migration is complete.
            </p>
          </div>
        </div>
      </SellerSurface>
    );
  }

  return (
    <div className="space-y-6">
      <SellerSurface className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-tint text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-heading text-[24px] font-semibold text-[#202224]">
                  {meta.title}
                </h2>
                <SellerStatusPill label={meta.label} tone={meta.tone} />
              </div>
              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#6d6d6d]">
                {meta.description}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <SellerStatusPill
              label={hasId ? "ID uploaded" : "ID required"}
              tone={hasId ? "green" : "amber"}
            />
            <SellerStatusPill
              label={phoneVerified ? "Phone verified" : "Phone required"}
              tone={phoneVerified ? "green" : "amber"}
            />
          </div>
        </div>

        {record?.review_notes ? (
          <div className="mt-5 rounded-[16px] border border-[#ffd3d0] bg-[#fff4f3] px-4 py-3 text-[13px] leading-5 text-[#9b2c24]">
            <span className="font-semibold">Review feedback:</span>{" "}
            {record.review_notes}
          </div>
        ) : null}
      </SellerSurface>

      <div className="grid gap-6 xl:grid-cols-2">
        <SellerSurface className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-tint text-primary">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-[22px] font-semibold text-[#202224]">
                Identity document
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-[#747474]">
                Stored in a private bucket. Only you and authorized reviewers
                can access its metadata or a time-limited review link.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {DOCUMENTS.map((item) => {
              const current = record?.documents.find(
                (document) => document.document_type === item.type,
              );
              const isUploading = uploadingType === item.type;

              return (
                <div
                  key={item.type}
                  className="rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-4"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[14px] font-semibold text-[#202224]">
                          {item.title}
                        </h3>
                        <SellerStatusPill
                          label={item.required ? "Required" : "Optional"}
                          tone={item.required ? "amber" : "neutral"}
                        />
                      </div>
                      <p className="mt-1 text-[12px] leading-5 text-[#747474]">
                        {item.description}
                      </p>
                      {current ? (
                        <p className="mt-3 truncate rounded-[12px] bg-white px-3 py-2 text-[12px] text-[#5f6673]">
                          <span className="font-semibold text-[#202224]">
                            {current.display_name}
                          </span>
                          {" · "}
                          {formatFileSize(current.size_bytes)}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <label
                    className={cn(
                      "mt-4 flex min-h-20 cursor-pointer items-center justify-center gap-3 rounded-[14px] border border-dashed border-[#d8d8d8] bg-white px-4 text-center transition hover:border-primary/40",
                      (locked || Boolean(uploadingType)) &&
                        "cursor-not-allowed opacity-60",
                    )}
                  >
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <UploadCloud className="h-5 w-5 text-primary" />
                    )}
                    <span className="text-[13px] font-semibold text-[#202224]">
                      {isUploading
                        ? "Uploading securely..."
                        : current
                          ? "Replace file"
                          : "Choose file"}
                    </span>
                    <span className="text-[11px] text-[#858585]">
                      PDF/JPG/PNG/WEBP · 6MB max
                    </span>
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png,image/webp"
                      className="sr-only"
                      disabled={locked || Boolean(uploadingType)}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.currentTarget.value = "";
                        if (file) void uploadDocument(item.type, file);
                      }}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </SellerSurface>

        <SellerSurface className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-tint text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-[22px] font-semibold text-[#202224]">
                Phone ownership
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-[#747474]">
                We send a six-digit code to this phone number by WhatsApp.
                Codes expire after ten minutes and are never stored in plain
                text.
              </p>
            </div>
          </div>

          {phoneVerified ? (
            <div className="mt-5 flex items-start gap-3 rounded-[18px] border border-[#ccebd7] bg-[#eefaf2] p-4 text-[#1f7a4d]">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-[14px] font-semibold">Phone verified</p>
                <p className="mt-1 text-[13px]">{record?.phone}</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <label className="block space-y-2 text-[13px] font-medium text-[#24272c]">
                <span>Phone number</span>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={locked || phonePending}
                  placeholder="+254 712 345 678"
                  className="h-12 w-full rounded-[14px] border border-[#e2e2e2] bg-white px-4 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-[#f4f4f4]"
                />
              </label>

              <button
                type="button"
                onClick={() => void sendPhoneCode()}
                disabled={locked || phonePending || phone.trim().length < 8}
                className="inline-flex h-11 w-full items-center justify-center rounded-[12px] border border-primary bg-white px-4 text-[13px] font-semibold text-primary transition hover:bg-brand-tint disabled:cursor-not-allowed disabled:opacity-60"
              >
                {phonePending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {codeSentTo
                  ? "Resend verification code"
                  : "Send verification code"}
              </button>

              {codeSentTo ? (
                <div className="rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-4">
                  <label className="block space-y-2 text-[13px] font-medium text-[#24272c]">
                    <span>Six-digit code sent to {codeSentTo}</span>
                    <input
                      value={otp}
                      onChange={(event) =>
                        setOtp(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="000000"
                      className="h-12 w-full rounded-[14px] border border-[#e2e2e2] bg-white px-4 text-center font-mono text-[20px] tracking-[0.35em] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => void verifyPhoneCode()}
                    disabled={phonePending || otp.length !== 6}
                    className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-primary px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LockKeyhole className="mr-2 h-4 w-4" />
                    Verify phone
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </SellerSurface>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[16px] border border-[#ffd3d0] bg-[#fff4f3] px-4 py-3 text-[13px] text-[#b42318]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-[16px] border border-[#ccebd7] bg-[#eefaf2] px-4 py-3 text-[13px] text-[#1f7a4d]"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      ) : null}

      <SellerSurface className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-[#202224]">
            Ready for review?
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-[#747474]">
            Submission becomes available after the required ID and phone checks
            are complete.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void submitForReview()}
          disabled={!canSubmit || submitPending}
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-[12px] bg-primary px-6 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#c9c9c9]"
        >
          {submitPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="mr-2 h-4 w-4" />
          )}
          Submit verification
        </button>
      </SellerSurface>
    </div>
  );
}
