"use client";

import * as React from "react";
import {
  CircleDollarSign,
  Clock3,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { updateInsuranceRequestAdminState } from "@/lib/actions/insurance";
import type { AdminInsuranceRequestItem, AdminInsuranceRequestsData } from "@/lib/data/insurance";
import type { InsuranceCoverType, InsuranceRequestStatus } from "@/lib/types/insurance";
import { cn } from "@/lib/utils";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSelectClass,
  adminTextareaClass,
} from "./admin-ui";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(value: string) {
  return new Date(value).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCoverType(coverType: InsuranceCoverType) {
  if (coverType === "third_party_fire_theft") return "Third party fire & theft";
  if (coverType === "third_party") return "Third party only";
  return "Comprehensive";
}

function formatStatus(status: InsuranceRequestStatus) {
  if (status === "bound") return "Policy bound";
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusTone(status: InsuranceRequestStatus) {
  if (status === "bound") return "green" as const;
  if (status === "blocked") return "red" as const;
  if (status === "quoted") return "amber" as const;
  if (status === "cancelled") return "slate" as const;
  return "blue" as const;
}

function roleTone(role: AdminInsuranceRequestItem["requesterAccountRole"]) {
  if (role === "dealer") return "green" as const;
  if (role === "seller") return "blue" as const;
  if (role === "admin" || role === "support") return "amber" as const;
  return "slate" as const;
}

function calculateInsuranceRequestStats(requests: AdminInsuranceRequestItem[]) {
  const todayKey = new Date().toISOString().slice(0, 10);

  return {
    openRequests: requests.filter(
      (request) =>
        request.status === "new" || request.status === "quoted" || request.status === "blocked"
    ).length,
    quotedToday: requests.filter((request) => request.quotedAt?.slice(0, 10) === todayKey).length,
    blockedCases: requests.filter((request) => request.status === "blocked").length,
    policiesBound: requests.filter((request) => request.status === "bound").length,
  };
}

export function AdminInsuranceRequestsLive({ data }: { data: AdminInsuranceRequestsData }) {
  const [requests, setRequests] = React.useState(data.requests);
  const [selectedId, setSelectedId] = React.useState(data.requests[0]?.id || "");
  const [status, setStatus] = React.useState<InsuranceRequestStatus>("new");
  const [insurerName, setInsurerName] = React.useState("");
  const [quoteAmount, setQuoteAmount] = React.useState("");
  const [adminNotes, setAdminNotes] = React.useState("");
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [isSaving, startTransition] = React.useTransition();

  const selectedRequest = requests.find((request) => request.id === selectedId) || requests[0] || null;
  const stats = calculateInsuranceRequestStats(requests);

  React.useEffect(() => {
    if (!selectedRequest) return;
    setStatus(selectedRequest.status);
    setInsurerName(selectedRequest.insurerName || "");
    setQuoteAmount(selectedRequest.quoteAmount ? String(selectedRequest.quoteAmount) : "");
    setAdminNotes(selectedRequest.adminNotes || "");
  }, [selectedRequest]);

  const saveChanges = () => {
    if (!selectedRequest) return;

    startTransition(async () => {
      setFeedback(null);

      const result = await updateInsuranceRequestAdminState({
        requestId: selectedRequest.id,
        status,
        insurerName,
        quoteAmount,
        adminNotes,
      });

      if (!("success" in result)) {
        setFeedback(result.error);
        return;
      }

      setRequests((current) =>
        current.map((request) =>
          request.id === selectedRequest.id
            ? {
                ...request,
                status: result.status,
                insurerName: result.insurerName,
                quoteAmount: result.quoteAmount,
                quoteCurrency: result.quoteCurrency,
                adminNotes: result.adminNotes,
                quotedAt: result.quotedAt,
                boundAt: result.boundAt,
                updatedAt: result.updatedAt,
              }
            : request
        )
      );
      setFeedback("Insurance request updated.");
    });
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Insurance Requests" />

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label="Open requests"
          value={stats.openRequests.toLocaleString("en-KE")}
          icon={<ReceiptText className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Quoted today"
          value={stats.quotedToday.toLocaleString("en-KE")}
          icon={<CircleDollarSign className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Blocked cases"
          value={stats.blockedCases.toLocaleString("en-KE")}
          icon={<Clock3 className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Policies bound"
          value={stats.policiesBound.toLocaleString("en-KE")}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <AdminSectionCard
          data-tour="insurance-list"
          title="Live queue"
          description="Select a quote request to review vehicle details, contact data, and insurer handoff notes."
          bodyClassName="p-0"
        >
          <div className="divide-y divide-[#eef2f7]">
            {requests.length === 0 ? (
              <div className="px-6 py-8 text-[14px] text-[#6b7280]">
                No insurance requests have been submitted yet.
              </div>
            ) : null}

            {requests.map((request) => {
              const isActive = request.id === selectedRequest?.id;
              return (
                <button
                  key={request.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(request.id);
                    setFeedback(null);
                  }}
                  className={cn(
                    "w-full px-6 py-5 text-left transition",
                    isActive ? "bg-[#f8fbff]" : "bg-white hover:bg-[#fafcff]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#111827]">{request.reference}</p>
                      <p className="mt-1 text-[12px] text-[#6b7280]">
                        {request.requesterName} • {request.vehicleLabel}
                      </p>
                    </div>
                    <p className="text-[11px] text-[#94a3b8]">{formatDate(request.createdAt)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <AdminStatusPill
                      label={formatStatus(request.status)}
                      tone={statusTone(request.status)}
                    />
                    {request.requesterAccountRole ? (
                      <AdminStatusPill
                        label={request.requesterAccountRole}
                        tone={roleTone(request.requesterAccountRole)}
                      />
                    ) : null}
                  </div>
                  <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-[#475467]">
                    {formatCoverType(request.coverType)} cover starting {formatDay(request.preferredStartDate)}
                  </p>
                </button>
              );
            })}
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          data-tour="insurance-detail"
          title={selectedRequest?.reference || "Insurance request details"}
          description={
            selectedRequest
              ? "Review the request, record insurer details, and update the queue status."
              : "Select a request from the queue."
          }
          action={
            selectedRequest ? (
              <button
                type="button"
                className={adminPrimaryButtonClass}
                onClick={saveChanges}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            ) : null
          }
        >
          {selectedRequest ? (
            <div className="space-y-5">
              {feedback ? (
                <div
                  className={cn(
                    "rounded-[12px] border px-4 py-3 text-[13px]",
                    feedback === "Insurance request updated."
                      ? "border-[#d1fadf] bg-[#ecfdf3] text-[#067647]"
                      : "border-[#ffd9d6] bg-[#fff3f2] text-[#d92d20]"
                  )}
                >
                  {feedback}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[14px] border border-[#eef2f7] bg-[#fbfcfd] p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                    Customer
                  </p>
                  <div className="mt-3 space-y-1 text-[13px] leading-6 text-[#344054]">
                    <p className="font-semibold text-[#111827]">{selectedRequest.requesterName}</p>
                    <p>{selectedRequest.requesterEmail}</p>
                    <p>{selectedRequest.requesterPhone}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedRequest.requesterAccountRole ? (
                      <AdminStatusPill
                        label={selectedRequest.requesterAccountRole}
                        tone={roleTone(selectedRequest.requesterAccountRole)}
                      />
                    ) : (
                      <AdminStatusPill label="Guest request" tone="slate" />
                    )}
                    {selectedRequest.requesterAccountEmail ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f6] px-3 py-1 text-[12px] text-[#475467]">
                        <UserRound className="h-3.5 w-3.5" />
                        {selectedRequest.requesterAccountEmail}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[14px] border border-[#eef2f7] bg-[#fbfcfd] p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                    Vehicle & cover
                  </p>
                  <div className="mt-3 space-y-1 text-[13px] leading-6 text-[#344054]">
                    <p>
                      <span className="font-semibold text-[#111827]">Vehicle:</span>{" "}
                      {selectedRequest.vehicleLabel}
                    </p>
                    <p>
                      <span className="font-semibold text-[#111827]">Cover:</span>{" "}
                      {formatCoverType(selectedRequest.coverType)}
                    </p>
                    <p>
                      <span className="font-semibold text-[#111827]">Requested start:</span>{" "}
                      {formatDay(selectedRequest.preferredStartDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[14px] border border-[#eef2f7] bg-[#fbfcfd] p-4 text-[13px] leading-6 text-[#344054]">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                    Submitted
                  </p>
                  <p className="mt-2">{formatDate(selectedRequest.createdAt)}</p>
                </div>
                <div className="rounded-[14px] border border-[#eef2f7] bg-[#fbfcfd] p-4 text-[13px] leading-6 text-[#344054]">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                    Quoted
                  </p>
                  <p className="mt-2">
                    {selectedRequest.quotedAt ? formatDate(selectedRequest.quotedAt) : "Not quoted yet"}
                  </p>
                </div>
                <div className="rounded-[14px] border border-[#eef2f7] bg-[#fbfcfd] p-4 text-[13px] leading-6 text-[#344054]">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                    Bound
                  </p>
                  <p className="mt-2">
                    {selectedRequest.boundAt ? formatDate(selectedRequest.boundAt) : "No policy bound yet"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-[13px] font-medium text-[#344054]">
                  Status
                  <select
                    className={adminSelectClass}
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as InsuranceRequestStatus)
                    }
                  >
                    <option value="new">New</option>
                    <option value="quoted">Quoted</option>
                    <option value="blocked">Blocked</option>
                    <option value="bound">Policy bound</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>

                <label className="space-y-2 text-[13px] font-medium text-[#344054] md:col-span-2">
                  Insurer
                  <input
                    className={adminInputClass}
                    value={insurerName}
                    onChange={(event) => setInsurerName(event.target.value)}
                    placeholder="e.g. Jubilee, ICEA Lion, Britam"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-[13px] font-medium text-[#344054]">
                  Quote amount (KES)
                  <input
                    className={adminInputClass}
                    inputMode="decimal"
                    value={quoteAmount}
                    onChange={(event) => setQuoteAmount(event.target.value)}
                    placeholder="e.g. 82500"
                  />
                </label>

                <div className="rounded-[14px] border border-[#eef2f7] bg-[#fbfcfd] p-4 text-[13px] leading-6 text-[#344054]">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                    Current quote
                  </p>
                  <p className="mt-2">
                    {selectedRequest.quoteAmount
                      ? formatMoney(selectedRequest.quoteAmount, selectedRequest.quoteCurrency)
                      : "No quote recorded yet"}
                  </p>
                </div>
              </div>

              <label className="space-y-2 text-[13px] font-medium text-[#344054]">
                Internal notes
                <textarea
                  className={adminTextareaClass}
                  value={adminNotes}
                  onChange={(event) => setAdminNotes(event.target.value)}
                  placeholder="Record missing documents, insurer feedback, or next-step notes for the operations team."
                />
              </label>
            </div>
          ) : (
            <div className="rounded-[14px] border border-dashed border-[#d0d5dd] bg-[#fbfcfd] px-5 py-8 text-[14px] text-[#6b7280]">
              No insurance requests in the queue.
            </div>
          )}
        </AdminSectionCard>
      </div>
    </div>
  );
}
