"use client";

import { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils/listings";

export function DealerProfileHeader({ name, photoKeys = [] }: { name: string; photoKeys?: string[] }) {
  const [selected, setSelected] = useState(0);
  const active = photoKeys[Math.min(selected, Math.max(0, photoKeys.length - 1))];
  return (
    <section aria-label={`${name} dealership profile`} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className={`relative flex min-h-72 overflow-hidden bg-gradient-to-br from-rose-100 via-rose-50 to-orange-50 sm:min-h-80 ${active ? "items-start px-5 py-5 sm:px-7" : "items-center px-8 py-10"}`}>
        {active ? <>
          <Image src={getImageUrl(active)} alt={`${name} dealership premises, photo ${selected + 1}`} fill sizes="(max-width: 1280px) 100vw, 830px" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/25 via-55% to-transparent" />
        </> : <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full bg-rose-200/60" />}
        <div className={`relative min-w-0 ${active ? "space-y-1 text-white" : "space-y-3 text-gray-900"}`}>
          <p className={`font-medium ${active ? "text-xs text-white/90" : "text-sm text-gray-700"}`}>Authorized Dealer Profile</p>
          <h1 className={`font-bold break-words ${active ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"}`}>{name}</h1>
          {!active && <p className="max-w-xl text-sm text-gray-600">Explore the latest inventory, reviews, and contact options for {name}.</p>}
        </div>
      </div>
      {photoKeys.length > 1 ? <div className="flex gap-2 overflow-x-auto p-3" aria-label="Dealership photos">
        {photoKeys.map((key, index) => <button key={key} type="button" aria-label={`View dealership photo ${index + 1}`} aria-pressed={selected === index} onClick={() => setSelected(index)} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected === index ? "border-primary" : "border-transparent"}`}>
          <Image src={getImageUrl(key)} alt="" fill sizes="96px" className="object-cover" />
        </button>)}
      </div> : null}
    </section>
  );
}
