"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { submitAdReport } from "@/lib/actions/ad-reports";
import {
  AD_REPORT_REASONS,
  type AdReportReason,
  type AdReportTargetType,
} from "@/lib/types/ad-report";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReportAdDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: AdReportTargetType;
  listingId?: string | null;
  dealerId?: string | null;
  targetLabel: string;
  dealerLabel?: string | null;
  viewer?: {
    email: string | null;
    fullName: string | null;
  } | null;
};

const initialReason = AD_REPORT_REASONS[0]?.value || "sold";
const errorTextClass = "text-[12px] font-medium text-red-600";

type ReportFormErrors = Partial<
  Record<
    | "targetType"
    | "reason"
    | "reporterName"
    | "reporterPhone"
    | "reporterEmail"
    | "location"
    | "comments",
    string
  >
>;

export function ReportAdDialog({
  open,
  onOpenChange,
  targetType,
  listingId = null,
  dealerId = null,
  targetLabel,
  dealerLabel,
  viewer,
}: ReportAdDialogProps) {
  const [selectedTargetType, setSelectedTargetType] = useState<AdReportTargetType>(targetType);
  const [reason, setReason] = useState<AdReportReason>(initialReason);
  const [reporterName, setReporterName] = useState(viewer?.fullName || "");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterEmail, setReporterEmail] = useState(viewer?.email || "");
  const [location, setLocation] = useState("");
  const [comments, setComments] = useState("");
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [errors, setErrors] = useState<ReportFormErrors>({});
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canChooseTarget = Boolean(listingId && dealerId);
  const activeTargetLabel =
    selectedTargetType === "dealer" ? dealerLabel || "Dealer profile" : targetLabel;
  const targetCopy = useMemo(
    () => (selectedTargetType === "dealer" ? "dealer" : "listing"),
    [selectedTargetType]
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFeedback(null);
      setErrors({});
      setSubmittedReportId(null);
    }
    onOpenChange(nextOpen);
  };

  const setFieldErrorCleared = (field: keyof ReportFormErrors) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validateForm = () => {
    const nextErrors: ReportFormErrors = {};

    if (selectedTargetType === "listing" && !listingId) {
      nextErrors.targetType = "Choose a listing to report.";
    }

    if (selectedTargetType === "dealer" && !dealerId) {
      nextErrors.targetType = "Choose a dealer to report.";
    }

    if (!reason) nextErrors.reason = "Choose a report reason.";
    if (reporterName.trim().length < 2) nextErrors.reporterName = "Name is required.";
    if (reporterPhone.trim().length < 7) nextErrors.reporterPhone = "Mobile number is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail.trim())) {
      nextErrors.reporterEmail = "Enter a valid email address.";
    }
    if (location.trim().length < 2) nextErrors.location = "Location is required.";
    if (comments.trim().length < 8) {
      nextErrors.comments = "Add a short comment for the admin team.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    setFeedback(null);
    if (!validateForm()) return;

    startTransition(async () => {
      const result = await submitAdReport({
        targetType: selectedTargetType,
        listingId: selectedTargetType === "listing" ? listingId : null,
        dealerId: selectedTargetType === "dealer" ? dealerId : null,
        reason,
        reporterName,
        reporterPhone,
        reporterEmail,
        location,
        comments,
      });

      if ("error" in result) {
        setFeedback({ tone: "error", message: result.error });
        return;
      }

      setSubmittedReportId(result.reportId);
      setFeedback({
        tone: "success",
        message: "Thanks. Your report has been sent to the Autolist safety team.",
      });
      setComments("");
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] max-w-2xl grid-rows-none flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Report this Ad
          </DialogTitle>
          <DialogDescription>
            Tell us what looks wrong with this {targetCopy}. Reports appear in the admin Reports queue.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#f8fafc] px-6 py-5">
          <div className="rounded-[14px] border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
              Reporting
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{activeTargetLabel}</p>
          </div>

          {submittedReportId ? (
            <div className="rounded-[18px] border border-green-200 bg-white px-5 py-6">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-green-50 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading text-[20px] font-semibold text-gray-950">
                    Report submitted
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    The Autolist safety team can now review this {targetCopy}. We may contact you if
                    we need more context.
                  </p>
                  <p className="mt-3 text-xs font-medium text-gray-500">
                    Reference: {submittedReportId.slice(0, 8)}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button type="button" onClick={() => handleOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {canChooseTarget ? (
                  <div className="space-y-2">
                    <Label>What are you reporting? *</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(["listing", "dealer"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setSelectedTargetType(option);
                            setFieldErrorCleared("targetType");
                          }}
                          className={`rounded-[14px] border px-4 py-3 text-left text-sm transition active:scale-[0.98] ${
                            selectedTargetType === option
                              ? "border-primary bg-white text-gray-950 shadow-[0_10px_30px_rgb(var(--primary-rgb)/0.08)]"
                              : "border-gray-200 bg-white/70 text-gray-600 hover:border-primary/40"
                          }`}
                        >
                          <span className="block font-semibold">
                            {option === "listing" ? "This listing" : "The dealer"}
                          </span>
                          <span className="mt-1 block text-xs leading-5">
                            {option === "listing" ? targetLabel : dealerLabel || "Dealer profile"}
                          </span>
                        </button>
                      ))}
                    </div>
                    {errors.targetType ? <p className={errorTextClass}>{errors.targetType}</p> : null}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="report-reason">Report this ad as *</Label>
                  <select
                    id="report-reason"
                    value={reason}
                    onChange={(event) => {
                      setReason(event.target.value as AdReportReason);
                      setFieldErrorCleared("reason");
                    }}
                    className="h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    {AD_REPORT_REASONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.reason ? <p className={errorTextClass}>{errors.reason}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-comments">What happened? *</Label>
                  <Textarea
                    id="report-comments"
                    value={comments}
                    onChange={(event) => {
                      setComments(event.target.value);
                      setFieldErrorCleared("comments");
                    }}
                    placeholder="Describe what looks wrong, what you expected, or how the seller responded."
                    className="min-h-[128px]"
                  />
                  <p className="text-[12px] text-gray-500">
                    Include enough detail for the safety team to verify the issue.
                  </p>
                  {errors.comments ? <p className={errorTextClass}>{errors.comments}</p> : null}
                </div>

                <div className="grid gap-4 rounded-[16px] border border-gray-200 bg-white p-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-gray-950">How should we reach you?</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      These details help admins follow up if the report needs more information.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-name">Name *</Label>
                    <Input
                      id="report-name"
                      value={reporterName}
                      onChange={(event) => {
                        setReporterName(event.target.value);
                        setFieldErrorCleared("reporterName");
                      }}
                      placeholder="Enter name"
                    />
                    {errors.reporterName ? <p className={errorTextClass}>{errors.reporterName}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-mobile">Mobile number *</Label>
                    <Input
                      id="report-mobile"
                      value={reporterPhone}
                      onChange={(event) => {
                        setReporterPhone(event.target.value);
                        setFieldErrorCleared("reporterPhone");
                      }}
                      placeholder="Your mobile"
                      inputMode="tel"
                    />
                    {errors.reporterPhone ? <p className={errorTextClass}>{errors.reporterPhone}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-email">Your email *</Label>
                    <Input
                      id="report-email"
                      value={reporterEmail}
                      onChange={(event) => {
                        setReporterEmail(event.target.value);
                        setFieldErrorCleared("reporterEmail");
                      }}
                      placeholder="Your email"
                      type="email"
                    />
                    {errors.reporterEmail ? <p className={errorTextClass}>{errors.reporterEmail}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-location">Location *</Label>
                    <Input
                      id="report-location"
                      value={location}
                      onChange={(event) => {
                        setLocation(event.target.value);
                        setFieldErrorCleared("location");
                      }}
                      placeholder="Town or area"
                    />
                    {errors.location ? <p className={errorTextClass}>{errors.location}</p> : null}
                  </div>
                </div>
              </div>

              {feedback ? (
                <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {feedback.message}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    "Submit report"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
