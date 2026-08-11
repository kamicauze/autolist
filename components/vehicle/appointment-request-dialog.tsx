"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  Info,
  Loader2,
  MapPin,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildListingAppointmentDays,
  LISTING_APPOINTMENT_TIME_SLOTS,
} from "@/lib/appointments/listing-appointment";
import { isListingAppointmentSlotInFuture } from "@/lib/appointments/appointment-request";
import { useListingAppointment } from "@/lib/hooks/use-listing-appointment";
import { cn } from "@/lib/utils";

type AppointmentRequestDialogProps = {
  listingId: string;
  listingTitle: string;
  viewingLocation: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AppointmentRequestDialog({
  listingId,
  listingTitle,
  viewingLocation,
  open,
  onOpenChange,
}: AppointmentRequestDialogProps) {
  const days = useMemo(() => buildListingAppointmentDays(), []);
  const appointmentReferenceDate = new Date();
  const [selectedDateKey, setSelectedDateKey] = useState(days[0]?.dateKey ?? "");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const {
    feedback,
    isSubmitting,
    message,
    contactName,
    contactEmail,
    contactPhone,
    setMessage,
    setContactName,
    setContactEmail,
    setContactPhone,
    setFeedback,
    submitAppointment,
  } = useListingAppointment({ listingId });

  const selectedDay =
    days.find((day) => day.dateKey === selectedDateKey) ?? days[0];

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFeedback(null);
      setConfirmed(false);
      setSubmitted(false);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    if (!selectedDay || !selectedTime) {
      setFeedback("Choose a date and time for the viewing.");
      return;
    }
    if (!confirmed) {
      setFeedback("Confirm that the seller still needs to approve this appointment request.");
      return;
    }

    const success = await submitAppointment({
      date: selectedDay.dateKey,
      timeSlot: selectedTime,
    });
    if (success) {
      setSubmitted(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 [&>button]:text-white [&>button]:opacity-80 hover:[&>button]:opacity-100 sm:max-w-[920px]">
        <div className="border-b border-gray-200 bg-[#071f43] px-5 py-5 text-white sm:px-7">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#071f43]">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-xl font-bold text-white sm:text-2xl">
                  Book an appointment
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-white/75">
                  Choose from the next 14 days and request a one-hour viewing.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_270px]">
          <div className="min-w-0 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {listingTitle}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#071f43]">
                Book an appointment to view this listing
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Select a convenient date and time. This is a request only; the seller will
                confirm it with you.
              </p>
            </div>

            <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#071f43]" />
                <h3 className="font-semibold text-[#071f43]">1. Choose a date</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 min-[460px]:grid-cols-4 sm:grid-cols-7">
                {days.map((day) => {
                  const selected = day.dateKey === selectedDateKey;
                  return (
                    <button
                      key={day.dateKey}
                      type="button"
                      onClick={() => {
                        setSelectedDateKey(day.dateKey);
                        if (
                          selectedTime &&
                          !isListingAppointmentSlotInFuture(
                            day.dateKey,
                            selectedTime,
                            appointmentReferenceDate
                          )
                        ) {
                          setSelectedTime("");
                        }
                        setFeedback(null);
                        setSubmitted(false);
                      }}
                      aria-pressed={selected}
                      aria-label={`Choose ${day.fullLabel}`}
                      className={cn(
                        "min-h-[94px] rounded-xl border px-2 py-3 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        selected
                          ? "border-[#071f43] bg-[#071f43] text-white shadow-sm"
                          : "border-gray-200 bg-white text-[#071f43] hover:border-primary/50 hover:bg-primary/5"
                      )}
                    >
                      <span className={cn("block text-[11px] font-semibold uppercase", selected ? "text-white/75" : "text-gray-500")}>
                        {day.dayLabel}
                      </span>
                      <span className="mt-1 block text-2xl font-bold">{day.dayNumber}</span>
                      <span className={cn("block text-[11px]", selected ? "text-white/75" : "text-gray-500")}>
                        {day.monthLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <div className="mb-1 flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-[#071f43]" />
                <h3 className="font-semibold text-[#071f43]">2. Choose a time slot</h3>
              </div>
              <p className="mb-4 text-xs text-gray-500">
                Times are shown in East Africa Time (EAT).
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {LISTING_APPOINTMENT_TIME_SLOTS.map((timeSlot) => {
                  const selected = timeSlot === selectedTime;
                  const available = isListingAppointmentSlotInFuture(
                    selectedDateKey,
                    timeSlot,
                    appointmentReferenceDate
                  );
                  return (
                    <button
                      key={timeSlot}
                      type="button"
                      onClick={() => {
                        setSelectedTime(timeSlot);
                        setFeedback(null);
                        setSubmitted(false);
                      }}
                      disabled={!available}
                      aria-pressed={selected}
                      aria-label={available ? timeSlot : `${timeSlot}, unavailable`}
                      className={cn(
                        "flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        !available
                          ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
                          : selected
                          ? "border-secondary bg-secondary text-secondary-foreground"
                          : "border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-primary/5"
                      )}
                    >
                      {timeSlot}
                      {selected ? <Check className="h-4 w-4" /> : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-[#071f43]" />
                <h3 className="font-semibold text-[#071f43]">3. Your details</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  placeholder="Your name"
                  aria-label="Your name"
                  className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <input
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  placeholder="Phone number"
                  aria-label="Phone number"
                  inputMode="tel"
                  className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <input
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  placeholder="Email address"
                  aria-label="Email address"
                  inputMode="email"
                  className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 sm:col-span-2"
                />
              </div>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, 250))}
                placeholder="Add a message for the seller (optional)"
                aria-label="Optional message for the seller"
                className="mt-3 min-h-[96px] w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <p className="mt-1 text-right text-xs text-gray-400">{message.length}/250</p>
            </section>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span>I understand that the seller must confirm this appointment request.</span>
            </label>

            {feedback ? (
              <div
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm",
                  submitted
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-brand-muted-border bg-brand-tint text-foreground"
                )}
                role="status"
              >
                {feedback}
              </div>
            ) : null}

            <Button
              type="button"
              size="lg"
              className="w-full gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting || submitted}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending request
                </>
              ) : submitted ? (
                <>
                  <Check className="h-4 w-4" />
                  Appointment requested
                </>
              ) : (
                <>
                  <CalendarDays className="h-4 w-4" />
                  Request viewing appointment
                </>
              )}
            </Button>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <h3 className="font-semibold text-[#071f43]">Your appointment summary</h3>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <dt className="text-gray-500">Date</dt>
                    <dd className="break-words font-semibold text-gray-900">
                      {selectedDay?.fullLabel ?? "Choose a date"}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <dt className="text-gray-500">Time</dt>
                    <dd className="break-words font-semibold text-gray-900">
                      {selectedTime || "Choose a time"}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <dt className="text-gray-500">Viewing location</dt>
                    <dd className="break-words font-semibold text-gray-900">
                      {viewingLocation}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-brand-muted-border bg-brand-tint p-4 text-sm text-foreground">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">This is a request, not a reservation.</p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">
                    The seller will review your preferred time and confirm it or suggest another.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold text-[#071f43]">Your information is safe</p>
                  <p className="mt-1 leading-relaxed text-gray-600">
                    Your contact details are shared only with the seller so they can confirm the
                    appointment.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
