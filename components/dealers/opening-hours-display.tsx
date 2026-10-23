"use client";

import { useSyncExternalStore } from "react";
import { formatDayHours, openingHoursState, parseOpeningHours } from "@/lib/dealer-opening-hours";

const subscribe = (onChange: () => void) => {
  const timer = window.setInterval(onChange, 1_000);
  return () => window.clearInterval(timer);
};
const currentMinute = () => Math.floor(Date.now() / 60_000);
const serverMinute = () => 0;

export function OpeningHoursDisplay({ value }: { value?: string | null }) {
  const minute = useSyncExternalStore(subscribe, currentMinute, serverMinute);
  const schedule = parseOpeningHours(value);
  if (!schedule) return value ? <p className="whitespace-pre-line text-sm text-slate-600">{value}</p> : <p className="text-sm text-slate-500">Contact dealer for opening hours.</p>;
  if (!minute) return <p className="text-sm text-slate-500">Opening hours · East Africa Time</p>;
  const state = openingHoursState(schedule, new Date(minute * 60_000));
  return (
    <details className="text-sm">
      <summary className="cursor-pointer space-y-1 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
        <span className={`mr-2 font-semibold ${state.open ? "text-emerald-700" : "text-slate-600"}`}>{state.open ? "Open now" : "Closed"}</span>
        <span>Today ({state.weekday}){state.holiday ? " · Holiday hours" : ""}: {formatDayHours(state.hours)}</span>
        <span className="block text-xs text-slate-500">East Africa Time · View weekly hours</span>
      </summary>
      <dl className="mt-3 space-y-2 border-t pt-3">
        {state.days.map(({ day, hours, holiday }, index) => <div key={day} className="flex justify-between gap-4">
          <dt className={index === 0 ? "font-semibold" : ""}>{day}{index === 0 ? " (Today)" : ""}{holiday ? " · Holiday" : ""}</dt>
          <dd className="shrink-0">{formatDayHours(hours)}</dd>
        </div>)}
        <div className="flex justify-between gap-4 border-t pt-2"><dt>Public holidays</dt><dd className="text-right">{schedule.publicHoliday ? formatDayHours(schedule.publicHoliday) : "Contact dealer to confirm"}</dd></div>
      </dl>
      <p className="mt-3 text-xs text-slate-500">Holiday hours apply on dates confirmed by the dealer. Contact the dealer to confirm hours on other public holidays.</p>
    </details>
  );
}
