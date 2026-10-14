"use client";

import * as React from "react";
import { PHONE_COUNTRY_CODES, joinPhoneCountry, splitPhoneCountry } from "@/lib/utils/phone-country";

export function PhoneNumberInput({ id, value, onChange, className }: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
}) {
  const [selection, setSelection] = React.useState(() => ({ code: splitPhoneCountry(value).code, value }));
  const split = splitPhoneCountry(value);
  const country = selection.value === value ? selection.code : split.code;
  const number = split.code === country ? split.number : value;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-2">
      <select aria-label={`${id === "profile-whatsapp" ? "WhatsApp" : "Phone"} country code`}
        value={country} className={`${className} min-w-0`}
        onChange={(event) => {
          const code = event.target.value;
          const updatedValue = code ? joinPhoneCountry(code, split.number) : value;
          setSelection({ code, value: updatedValue });
          onChange(updatedValue);
        }}>
        {PHONE_COUNTRY_CODES.map(({ code, label }) => <option key={code} value={code}>{label} ({code})</option>)}
        <option value="">Other country (+code)</option>
      </select>
      <input id={id} type="tel" autoComplete="tel-national" value={number}
        className={`${className} min-w-0`} placeholder={country ? "700000111" : "+country code and number"}
        onChange={(event) => {
          const input = event.target.value;
          const combined = joinPhoneCountry(country, input);
          setSelection({ code: input.trim().startsWith("+") ? splitPhoneCountry(combined).code : country, value: combined });
          onChange(combined);
        }} />
    </div>
  );
}
