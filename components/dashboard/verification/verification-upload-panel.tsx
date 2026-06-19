"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Save,
  Send,
  UploadCloud,
} from "lucide-react";
import { resubmitDealerVerificationDocuments } from "@/lib/actions/dealers";
import type {
  DealerVerificationDocument,
  DealerVerificationRecord,
} from "@/lib/types/dealer";
import { getImageUrl } from "@/lib/utils/listings";
import { cn } from "@/lib/utils";
import {
  sellerGhostButtonClass,
  sellerPrimaryButtonClass,
  sellerTextareaClass,
  SellerStatusPill,
} from "../seller-dashboard-ui";

type DocumentType = DealerVerificationDocument["document_type"];

const DOCUMENT_CARDS: Array<{
  type: DocumentType;
  inputName: string;
  title: string;
  description: string;
  required: boolean;
  accept: string;
}> = [
  {
    type: "contact_photo",
    inputName: "contactPhoto",
    title: "Primary contact photo",
    description: "Clear headshot for the person buyers and Autolist support will contact.",
    required: true,
    accept: "image/png,image/jpeg,image/webp",
  },
  {
    type: "incorporation_certificate",
    inputName: "incorporationCertificate",
    title: "Certificate of incorporation",
    description: "Business registration document as PDF, JPG, PNG, or WEBP.",
    required: true,
    accept: ".pdf,image/png,image/jpeg,image/webp",
  },
  {
    type: "company_logo",
    inputName: "companyLogo",
    title: "Company logo",
    description: "Optional brand mark used on approved dealer surfaces.",
    required: false,
    accept: "image/png,image/jpeg,image/webp",
  },
  {
    type: "contact_id",
    inputName: "contactPersonId",
    title: "Contact person ID",
    description: "Optional ID document if the review team needs extra identity checks.",
    required: false,
    accept: ".pdf,image/png,image/jpeg,image/webp",
  },
];

function formatFileSize(value: number | null) {
  if (!value) return null;
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function getCurrentDocument(
  documents: DealerVerificationDocument[],
  type: DocumentType
) {
  return documents.find((document) => document.document_type === type) || null;
}

export function VerificationUploadPanel({
  dealer,
}: {
  dealer: DealerVerificationRecord | null;
}) {
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [selectedFiles, setSelectedFiles] = React.useState<Record<string, string>>({});
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const canUpload = Boolean(dealer);
  const isApproved = dealer?.status === "APPROVED";
  const actionLabel = dealer?.status === "REJECTED" ? "Resubmit for review" : "Submit for review";

  function submit(intent: "draft" | "submit") {
    if (!formRef.current) return;

    setMessage(null);
    setError(null);

    const formData = new FormData(formRef.current);
    formData.set("intent", intent);

    startTransition(async () => {
      const result = await resubmitDealerVerificationDocuments(formData);

      if (result.error) {
        if (result.error === "Unauthorized") {
          router.replace("/login?next=/dashboard/verification");
          return;
        }

        setError(result.error);
        return;
      }

      formRef.current?.reset();
      setSelectedFiles({});
      setMessage(
        result.intent === "draft"
          ? "Draft documents saved."
          : "Verification documents submitted for review."
      );
      router.refresh();
    });
  }

  return (
    <form ref={formRef} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {DOCUMENT_CARDS.map((card) => {
          const currentDocument = dealer
            ? getCurrentDocument(dealer.documents, card.type)
            : null;
          const selectedName = selectedFiles[card.inputName];

          return (
            <div
              key={card.type}
              className={cn(
                "rounded-[20px] border bg-[#faf9f7] p-4 transition",
                selectedName
                  ? "border-primary/30 bg-brand-soft-surface"
                  : "border-[#ededed]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                    {currentDocument || selectedName ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[15px] font-semibold text-[#202224]">{card.title}</h3>
                      <SellerStatusPill
                        label={card.required ? "Required" : "Optional"}
                        tone={card.required ? "amber" : "neutral"}
                      />
                    </div>
                    <p className="mt-2 text-[13px] leading-5 text-[#717171]">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>

              {currentDocument ? (
                <a
                  href={getImageUrl(currentDocument.r2_key)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center justify-between gap-3 rounded-[14px] border border-[#e6e6e6] bg-white px-3 py-3 text-[13px] transition hover:border-primary/30"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-[#202224]">
                      {currentDocument.display_name}
                    </span>
                    <span className="mt-0.5 block text-[#858585]">
                      {formatFileSize(currentDocument.size_bytes) || "Uploaded"}
                    </span>
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
                </a>
              ) : null}

              <label
                className={cn(
                  "mt-4 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed border-[#d8d8d8] bg-white px-4 py-4 text-center transition hover:border-primary/40",
                  (!canUpload || isApproved) && "cursor-not-allowed opacity-60"
                )}
              >
                <UploadCloud className="h-5 w-5 text-primary" />
                <span className="mt-2 text-[13px] font-semibold text-[#202224]">
                  {selectedName || "Choose replacement file"}
                </span>
                <span className="mt-1 text-[12px] text-[#858585]">Max 10MB</span>
                <input
                  name={card.inputName}
                  type="file"
                  accept={card.accept}
                  disabled={!canUpload || isApproved}
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setSelectedFiles((current) => ({
                      ...current,
                      [card.inputName]: file?.name || "",
                    }));
                  }}
                />
              </label>
            </div>
          );
        })}
      </div>

      <div className="rounded-[20px] border border-[#ededed] bg-[#faf9f7] p-4">
        <label
          htmlFor="dealer-verification-notes"
          className="mb-2 block text-[13px] font-medium text-[#24272c]"
        >
          Notes for review team
        </label>
        <textarea
          id="dealer-verification-notes"
          name="verificationNotes"
          defaultValue={dealer?.verification_notes || ""}
          disabled={!canUpload || isApproved}
          placeholder="Call out updated files, expiry dates, or alternate business names."
          className={sellerTextareaClass}
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {(["email", "whatsapp", "sms"] as const).map((channel) => (
            <label
              key={channel}
              className="flex items-center gap-2 rounded-[14px] border border-[#e6e6e6] bg-white px-3 py-3 text-[13px] font-medium capitalize text-[#24272c]"
            >
              <input
                type="radio"
                name="preferredConfirmationChannel"
                value={channel}
                disabled={!canUpload || isApproved}
                defaultChecked={(dealer?.preferred_confirmation_channel || "email") === channel}
              />
              {channel}
            </label>
          ))}
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-[16px] border border-[#ffd3d0] bg-[#fff4f3] px-4 py-3 text-[13px] text-[#b42318]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {message ? (
        <div className="flex items-start gap-2 rounded-[16px] border border-[#ccebd7] bg-[#eefaf2] px-4 py-3 text-[13px] text-[#1f7a4d]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {!dealer ? (
          <Link href="/register/dealer" className={sellerPrimaryButtonClass}>
            Start verification
          </Link>
        ) : isApproved ? (
          <button type="button" disabled className={sellerPrimaryButtonClass}>
            Approved
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={() => submit("draft")}
              className={sellerGhostButtonClass}
            >
              <Save className="mr-2 h-4 w-4" />
              Save draft
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => submit("submit")}
              className={sellerPrimaryButtonClass}
            >
              <Send className="mr-2 h-4 w-4" />
              {isPending ? "Submitting..." : actionLabel}
            </button>
          </>
        )}
      </div>
    </form>
  );
}
