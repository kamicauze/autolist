"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  List,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Search,
  UserRound,
} from "lucide-react";
import { updateAppointmentStatus } from "@/lib/actions/appointments";
import {
  APPOINTMENT_STATUS_PRESENTATION,
  buildAppointmentCalendarDays,
  getAppointmentDateKey,
  getAppointmentNextStatuses,
} from "@/lib/appointments/management";
import {
  APPOINTMENT_REQUEST_STATUSES,
  type AppointmentRequestStatus,
} from "@/lib/appointments/appointment-domain";
import type {
  AppointmentRequestItem,
  AppointmentsDashboardData,
} from "@/lib/types/appointments";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  SellerPageHeader,
  SellerStatCard,
  SellerStatusPill,
  SellerSurface,
  sellerSelectClass,
  sellerTextareaClass,
} from "@/components/dashboard/seller-dashboard-ui";

type ViewMode = "queue" | "calendar";
type StatusFilter = "all" | AppointmentRequestStatus;

const ACTION_LABELS: Partial<Record<AppointmentRequestStatus, string>> = {
  confirmed: "Confirm",
  declined: "Decline",
  reschedule_requested: "Request reschedule",
  completed: "Mark completed",
  cancelled: "Cancel request",
  no_show: "Mark no-show",
};

const ACTION_STYLES: Partial<Record<AppointmentRequestStatus, string>> = {
  confirmed: "bg-primary text-white hover:bg-brand-hover",
  completed: "bg-[#287a4a] text-white hover:bg-[#20653d]",
  reschedule_requested: "border-[#d79a37] text-[#a66d12] hover:bg-[#fff7e8]",
  declined: "border-[#efb4af] text-[#b42318] hover:bg-[#fff2f0]",
  cancelled: "border-[#d8d8d8] text-[#5f6368] hover:bg-[#f5f5f5]",
  no_show: "border-[#efb4af] text-[#b42318] hover:bg-[#fff2f0]",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateTimeRange(request: AppointmentRequestItem) {
  return `${formatDate(request.startAt, request.timezone)} · ${formatTime(
    request.startAt,
    request.timezone
  )}–${formatTime(request.endAt, request.timezone)}`;
}

function monthFromGeneratedAt(value: string) {
  const dateKey = getAppointmentDateKey(value, "Africa/Nairobi");
  const [year, month] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

function RequestStatus({ status }: { status: AppointmentRequestStatus }) {
  const presentation = APPOINTMENT_STATUS_PRESENTATION[status];
  return <SellerStatusPill label={presentation.label} tone={presentation.tone} />;
}

function RequestCard({
  request,
  selected,
  onSelect,
}: {
  request: AppointmentRequestItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-[18px] border bg-white p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15",
        selected
          ? "border-primary shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
          : "border-[#ececec] hover:border-[#cfcfcf]"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-[#202224]">
            {request.listing.title}
          </p>
          <p className="mt-1 truncate text-[13px] text-[#747474]">{request.contactName}</p>
        </div>
        <RequestStatus status={request.status} />
      </div>
      <div className="mt-4 flex items-center gap-2 text-[13px] text-[#555b63]">
        <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
        <span>{formatDateTimeRange(request)}</span>
      </div>
      {request.message ? (
        <p className="mt-3 line-clamp-2 text-[12px] leading-5 text-[#7b7f85]">
          {request.message}
        </p>
      ) : null}
    </button>
  );
}

function RequestDetail({
  request,
  onUpdated,
}: {
  request: AppointmentRequestItem | null;
  onUpdated: (request: AppointmentRequestItem) => void;
}) {
  const router = useRouter();
  const [sellerNotes, setSellerNotes] = React.useState(request?.sellerNotes || "");
  const [pendingStatus, setPendingStatus] = React.useState<AppointmentRequestStatus | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSellerNotes(request?.sellerNotes || "");
    setFeedback(null);
  }, [request?.id, request?.sellerNotes]);

  if (!request) {
    return (
      <SellerSurface className="flex min-h-[360px] items-center justify-center p-8 text-center">
        <div>
          <CalendarDays className="mx-auto h-8 w-8 text-[#a1a1aa]" />
          <p className="mt-4 text-[15px] font-semibold text-[#303238]">Select a request</p>
          <p className="mt-2 max-w-xs text-[13px] leading-5 text-[#7b7f85]">
            Choose an item from the queue or calendar to review the customer and appointment details.
          </p>
        </div>
      </SellerSurface>
    );
  }

  const nextStatuses = getAppointmentNextStatuses(request.status);

  const handleStatusChange = async (status: AppointmentRequestStatus) => {
    setPendingStatus(status);
    setFeedback(null);
    const result = await updateAppointmentStatus({
      appointmentId: request.id,
      status,
      sellerNotes,
    });
    setPendingStatus(null);

    if (!result.success) {
      setFeedback(result.error);
      return;
    }

    const updated = {
      ...request,
      status: result.appointment.status,
      sellerNotes: result.appointment.sellerNotes,
      sellerRespondedAt: result.appointment.sellerRespondedAt,
      statusChangedAt: result.appointment.statusChangedAt,
      updatedAt: result.appointment.updatedAt,
    };
    onUpdated(updated);
    setFeedback(`Request marked ${APPOINTMENT_STATUS_PRESENTATION[status].label.toLowerCase()}.`);
    router.refresh();
  };

  return (
    <SellerSurface className="overflow-hidden xl:sticky xl:top-[112px]">
      <div className="border-b border-[#ececec] p-5 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#90949a]">
              Appointment detail
            </p>
            <h2 className="mt-2 text-[20px] font-semibold text-[#202224]">
              {request.listing.title}
            </h2>
          </div>
          <RequestStatus status={request.status} />
        </div>
        <div className="mt-5 rounded-[18px] border border-primary/15 bg-brand-tint p-4">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-[14px] font-semibold text-[#202224]">
                {formatDate(request.startAt, request.timezone)}
              </p>
              <p className="mt-1 text-[13px] text-[#5f6368]">
                {formatTime(request.startAt, request.timezone)}–
                {formatTime(request.endAt, request.timezone)} · {request.timezone}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 lg:p-6">
        <section aria-labelledby="customer-details-heading">
          <h3 id="customer-details-heading" className="text-[13px] font-semibold text-[#303238]">
            Customer
          </h3>
          <div className="mt-3 space-y-3 text-[13px] text-[#62666d]">
            <div className="flex items-center gap-3">
              <UserRound className="h-4 w-4 shrink-0 text-[#969aa0]" />
              <span>{request.contactName}</span>
            </div>
            {request.contactEmail ? (
              <a className="flex items-center gap-3 hover:text-primary" href={`mailto:${request.contactEmail}`}>
                <Mail className="h-4 w-4 shrink-0 text-[#969aa0]" />
                <span className="break-all">{request.contactEmail}</span>
              </a>
            ) : null}
            {request.contactPhone ? (
              <a className="flex items-center gap-3 hover:text-primary" href={`tel:${request.contactPhone}`}>
                <Phone className="h-4 w-4 shrink-0 text-[#969aa0]" />
                <span>{request.contactPhone}</span>
              </a>
            ) : null}
          </div>
        </section>

        <section aria-labelledby="buyer-message-heading">
          <h3 id="buyer-message-heading" className="flex items-center gap-2 text-[13px] font-semibold text-[#303238]">
            <MessageSquareText className="h-4 w-4 text-[#969aa0]" />
            Customer message
          </h3>
          <p className="mt-3 rounded-[16px] bg-[#f7f7f7] p-4 text-[13px] leading-6 text-[#62666d]">
            {request.message || "No message was included with this request."}
          </p>
        </section>

        <section aria-labelledby="seller-note-heading">
          <label id="seller-note-heading" htmlFor={`seller-note-${request.id}`} className="text-[13px] font-semibold text-[#303238]">
            Response note
          </label>
          <textarea
            id={`seller-note-${request.id}`}
            value={sellerNotes}
            onChange={(event) => setSellerNotes(event.target.value)}
            maxLength={2000}
            placeholder="Add confirmation details or explain the requested change."
            className={cn(sellerTextareaClass, "mt-3 min-h-[112px]")}
          />
          <p className="mt-2 text-right text-[11px] text-[#989ca2]">{sellerNotes.length}/2000</p>
        </section>

        {feedback ? (
          <div role="status" className="rounded-[14px] border border-[#d9e1ea] bg-[#f7fafc] px-4 py-3 text-[13px] text-[#53606f]">
            {feedback}
          </div>
        ) : null}

        {nextStatuses.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {nextStatuses.map((status) => (
              <Button
                key={status}
                type="button"
                variant="outline"
                disabled={pendingStatus !== null}
                onClick={() => void handleStatusChange(status)}
                className={cn("h-auto min-h-11 whitespace-normal border px-3 py-2 text-[13px]", ACTION_STYLES[status])}
              >
                {pendingStatus === status ? "Updating…" : ACTION_LABELS[status]}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-[14px] bg-[#f7f7f7] px-4 py-3 text-[13px] text-[#686c72]">
            <CheckCircle2 className="h-4 w-4" />
            This request is closed and has no further actions.
          </div>
        )}

        <Link href={`/vehicle/${request.listingId}`} className="inline-flex items-center gap-2 text-[13px] font-semibold text-primary hover:underline">
          <MapPin className="h-4 w-4" />
          View listing
        </Link>
      </div>
    </SellerSurface>
  );
}

function CalendarView({
  requests,
  month,
  onMonthChange,
  selectedId,
  onSelect,
  todayKey,
}: {
  requests: AppointmentRequestItem[];
  month: Date;
  onMonthChange: (date: Date) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  todayKey: string;
}) {
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();
  const days = buildAppointmentCalendarDays(year, monthIndex);
  const requestsByDay = React.useMemo(() => {
    const grouped = new Map<string, AppointmentRequestItem[]>();
    for (const request of requests) {
      const key = getAppointmentDateKey(request.startAt, request.timezone);
      grouped.set(key, [...(grouped.get(key) || []), request]);
    }
    return grouped;
  }, [requests]);
  const monthLabel = new Intl.DateTimeFormat("en-KE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(month);

  const moveMonth = (offset: number) => {
    onMonthChange(new Date(Date.UTC(year, monthIndex + offset, 1)));
  };

  return (
    <SellerSurface className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ededed] p-4 lg:px-5">
        <h2 className="text-[17px] font-semibold text-[#202224]">{monthLabel}</h2>
        <div className="flex items-center gap-2">
          <Button type="button" size="icon" variant="ghost" onClick={() => moveMonth(-1)} aria-label="Previous month" className="rounded-full border border-[#e6e6e6] bg-white">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" variant="ghost" onClick={() => moveMonth(1)} aria-label="Next month" className="rounded-full border border-[#e6e6e6] bg-white">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-7 border-b border-[#ededed] bg-[#fafafa]">
            {WEEKDAYS.map((day) => (
              <div key={day} className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b8f95]">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dayRequests = requestsByDay.get(day.dateKey) || [];
              return (
                <div
                  key={day.dateKey}
                  className={cn(
                    "min-h-[118px] border-b border-r border-[#ededed] p-2",
                    day.inCurrentMonth ? "bg-white" : "bg-[#fafafa]"
                  )}
                >
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-full text-[12px]", day.dateKey === todayKey ? "bg-primary font-semibold text-white" : day.inCurrentMonth ? "text-[#474b51]" : "text-[#b0b3b7]")}>
                    {day.dayNumber}
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {dayRequests.slice(0, 3).map((request) => (
                      <button
                        key={request.id}
                        type="button"
                        onClick={() => onSelect(request.id)}
                        className={cn(
                          "block w-full truncate rounded-[8px] border px-2 py-1.5 text-left text-[10px] font-medium transition",
                          selectedId === request.id
                            ? "border-primary bg-primary text-white"
                            : "border-primary/15 bg-brand-tint text-primary hover:border-primary"
                        )}
                        title={`${formatTime(request.startAt, request.timezone)} ${request.contactName}`}
                      >
                        {formatTime(request.startAt, request.timezone)} · {request.contactName}
                      </button>
                    ))}
                    {dayRequests.length > 3 ? (
                      <p className="px-1 text-[10px] font-medium text-[#777b81]">+{dayRequests.length - 3} more</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SellerSurface>
  );
}

export function CustomerRequestsManager({
  initialData,
  initialRequestId,
}: {
  initialData: AppointmentsDashboardData;
  initialRequestId: string | null;
}) {
  const [requests, setRequests] = React.useState(initialData.requests);
  const [viewMode, setViewMode] = React.useState<ViewMode>("queue");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(
    initialRequestId && initialData.requests.some((request) => request.id === initialRequestId)
      ? initialRequestId
      : initialData.requests[0]?.id || null
  );
  const [calendarMonth, setCalendarMonth] = React.useState(() =>
    monthFromGeneratedAt(initialData.generatedAt)
  );

  React.useEffect(() => {
    setRequests(initialData.requests);
    setSelectedId((current) => {
      if (current && initialData.requests.some((request) => request.id === current)) {
        return current;
      }
      return initialData.requests[0]?.id || null;
    });
  }, [initialData.requests]);

  const visibleRequests = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return requests.filter((request) => {
      if (statusFilter !== "all" && request.status !== statusFilter) return false;
      if (!query) return true;
      return [
        request.contactName,
        request.contactEmail,
        request.contactPhone,
        request.listing.title,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [requests, searchQuery, statusFilter]);

  const selectedRequest = requests.find((request) => request.id === selectedId) || null;
  const pendingCount = requests.filter((request) => request.status === "pending").length;
  const confirmedCount = requests.filter((request) => request.status === "confirmed").length;
  const rescheduleCount = requests.filter(
    (request) => request.status === "reschedule_requested"
  ).length;

  const handleUpdated = (updated: AppointmentRequestItem) => {
    setRequests((current) =>
      current.map((request) => (request.id === updated.id ? updated : request))
    );
  };

  if (initialData.access !== "allowed") {
    return (
      <div className="space-y-6">
        <SellerPageHeader
          title="Customer Requests"
          description="Appointment requests are available to listing owners and permitted sales agents."
        />
        <SellerSurface className="p-6 text-[14px] text-[#656a72]">
          {initialData.access === "unauthenticated"
            ? "Sign in to manage customer requests."
            : "You do not have permission to manage customer requests."}
        </SellerSurface>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Customer Requests"
        description="Manage viewing appointments from one owner queue. These requests remain separate from Messages and platform support tickets."
      />

      {initialData.error ? (
        <div role="alert" className="rounded-[16px] border border-[#f1b8b3] bg-[#fff3f1] px-4 py-3 text-[13px] text-[#9f2d24]">
          {initialData.error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SellerStatCard icon={<CalendarDays className="h-5 w-5 text-primary" />} label="Total requests" value={String(requests.length)} accentClass="bg-brand-tint" />
        <SellerStatCard icon={<Clock3 className="h-5 w-5 text-[#d17b0f]" />} label="Pending response" value={String(pendingCount)} accentClass="bg-[#fff3e4]" />
        <SellerStatCard icon={<CheckCircle2 className="h-5 w-5 text-[#287a4a]" />} label="Confirmed" value={String(confirmedCount)} accentClass="bg-[#eaf7ef]" />
        <SellerStatCard icon={<MessageSquareText className="h-5 w-5 text-primary" />} label="Reschedule requests" value={String(rescheduleCount)} accentClass="bg-brand-tint" />
      </div>

      <SellerSurface className="p-4 lg:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-center">
          <div className="flex h-12 items-center gap-3 rounded-[14px] border border-[#ededed] bg-white px-4">
            <Search className="h-4 w-4 text-[#90949a]" />
            <label htmlFor="customer-request-search" className="sr-only">Search customer requests</label>
            <input
              id="customer-request-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search customer, contact, or listing"
              className="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#9a9a9a]"
            />
          </div>
          <div>
            <label htmlFor="customer-request-status" className="sr-only">Filter by status</label>
            <select
              id="customer-request-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className={sellerSelectClass}
            >
              <option value="all">All statuses</option>
              {APPOINTMENT_REQUEST_STATUSES.map((status) => (
                <option key={status} value={status}>{APPOINTMENT_STATUS_PRESENTATION[status].label}</option>
              ))}
            </select>
          </div>
          <div className="inline-flex rounded-full border border-[#e8e8e8] bg-[#f7f7f7] p-1" aria-label="Customer request view">
            {([
              { value: "queue" as const, label: "Queue", icon: List },
              { value: "calendar" as const, label: "Calendar", icon: CalendarDays },
            ]).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setViewMode(option.value)}
                aria-pressed={viewMode === option.value}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition",
                  viewMode === option.value ? "bg-white text-primary shadow-sm" : "text-[#72767d]"
                )}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </SellerSurface>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start">
        <div className="min-w-0">
          {viewMode === "queue" ? (
            <SellerSurface className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-[#ededed] px-5 py-4">
                <h2 className="text-[17px] font-semibold text-[#202224]">Request queue</h2>
                <span className="text-[12px] text-[#85898f]">{visibleRequests.length} shown</span>
              </div>
              {visibleRequests.length > 0 ? (
                <div className="grid gap-3 p-4 lg:grid-cols-2 lg:p-5">
                  {visibleRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      selected={request.id === selectedId}
                      onSelect={() => setSelectedId(request.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-6 py-14 text-center">
                  <CalendarDays className="mx-auto h-8 w-8 text-[#a5a8ad]" />
                  <p className="mt-4 text-[15px] font-semibold text-[#303238]">No matching requests</p>
                  <p className="mt-2 text-[13px] text-[#7b7f85]">Adjust the status filter or search terms.</p>
                </div>
              )}
            </SellerSurface>
          ) : (
            <CalendarView
              requests={visibleRequests}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              selectedId={selectedId}
              onSelect={setSelectedId}
              todayKey={getAppointmentDateKey(initialData.generatedAt, "Africa/Nairobi")}
            />
          )}
        </div>

        <RequestDetail request={selectedRequest} onUpdated={handleUpdated} />
      </div>
    </div>
  );
}
