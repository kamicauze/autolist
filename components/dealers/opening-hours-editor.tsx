"use client";

import { useId } from "react";
import { createOpeningHours, parseOpeningHours, TIME_CHOICES, WEEKDAYS, type DayHours } from "@/lib/dealer-opening-hours";

const fieldClass = "rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400";

function DayEditor({ label, value, onChange }: { label: string; value: DayHours; onChange: (value: DayHours) => void }) {
  const id = useId();
  const options = Array.from(new Set([...TIME_CHOICES, value.opens, value.closes])).sort();
  return <fieldset className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[minmax(110px,1fr)_90px_1fr_1fr]">
    <legend className="sr-only">{label}</legend>
    <span className="text-sm font-medium">{label}</span>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.closed} onChange={(event) => onChange({ ...value, closed: event.target.checked })} />Closed</label>
    <div className="grid gap-1"><label htmlFor={`${id}-opens`} className="text-xs text-slate-500">Opens</label><select id={`${id}-opens`} className={fieldClass} value={value.opens} disabled={value.closed} onChange={(event) => {
      const opens = event.target.value;
      const closes = value.closes > opens ? value.closes : options.find((time) => time > opens) ?? "23:59";
      onChange({ ...value, opens, closes });
    }}>{options.filter((time) => time < "23:59").map((time) => <option key={time}>{time}</option>)}</select></div>
    <div className="grid gap-1"><label htmlFor={`${id}-closes`} className="text-xs text-slate-500">Closes</label><select id={`${id}-closes`} className={fieldClass} value={value.closes} disabled={value.closed} onChange={(event) => onChange({ ...value, closes: event.target.value })}>{Array.from(new Set([...options, "23:59"])).sort().filter((time) => time > value.opens).map((time) => <option key={time}>{time}</option>)}</select></div>
  </fieldset>;
}

export function OpeningHoursEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const schedule = parseOpeningHours(value);
  const dateId = useId();
  if (!schedule) return <div className="space-y-3">
    {value ? <><p className="text-xs text-slate-500">Existing hours are preserved until you replace them with a weekly schedule.</p><textarea aria-label="Existing opening hours" className={`${fieldClass} min-h-20 w-full`} value={value} onChange={(event) => onChange(event.target.value)} /></> : <p className="text-sm text-slate-500">No hours configured.</p>}
    <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium" onClick={() => onChange(JSON.stringify(createOpeningHours()))}>{value ? "Replace with weekly schedule" : "Set weekly opening hours"}</button>
  </div>;
  const save = (updated: typeof schedule) => onChange(JSON.stringify(updated));
  return <div className="space-y-4" data-testid="opening-hours-editor">
    <p className="text-xs text-slate-500">All times are East Africa Time (Nairobi). Choose Closed for days you do not open.</p>
    {WEEKDAYS.map((day) => <DayEditor key={day} label={day} value={schedule.week[day]} onChange={(hours) => save({ ...schedule, week: { ...schedule.week, [day]: hours } })} />)}
    <div className="space-y-3 border-t pt-4">
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(schedule.publicHoliday)} onChange={(event) => save({ ...schedule, publicHoliday: event.target.checked ? { closed: true, opens: "09:00", closes: "13:00" } : undefined })} />Set default public holiday hours</label>
      {schedule.publicHoliday ? <DayEditor label="Public holidays" value={schedule.publicHoliday} onChange={(hours) => save({ ...schedule, publicHoliday: hours })} /> : null}
      <p className="text-xs text-slate-500">Add confirmed holiday dates below so Open now uses holiday hours on those dates. Other holidays require confirmation with the dealer.</p>
      {schedule.holidays.map((holiday) => <div key={holiday.date} className="space-y-2 rounded-lg bg-slate-50 p-3"><DayEditor label={holiday.date} value={holiday.hours} onChange={(hours) => save({ ...schedule, holidays: schedule.holidays.map((item) => item.date === holiday.date ? { ...item, hours } : item) })} /><button type="button" className="text-xs text-red-700 underline" onClick={() => save({ ...schedule, holidays: schedule.holidays.filter((item) => item.date !== holiday.date) })}>Remove {holiday.date}</button></div>)}
      {schedule.holidays.length < 30 ? <div className="grid gap-1"><label htmlFor={dateId} className="text-sm font-medium">Add holiday or special date</label><input id={dateId} type="date" className={fieldClass} value="" onChange={(event) => {
        const date = event.target.value;
        if (date && !schedule.holidays.some((item) => item.date === date)) save({ ...schedule, holidays: [...schedule.holidays, { date, hours: schedule.publicHoliday ?? { closed: true, opens: "09:00", closes: "13:00" } }].sort((a, b) => a.date.localeCompare(b.date)) });
      }} /></div> : null}
    </div>
  </div>;
}
