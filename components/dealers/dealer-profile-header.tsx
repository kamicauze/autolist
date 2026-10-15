"use client";

import { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils/listings";

export function DealerProfileHeader({ name, photoKeys = [] }: { name: string; photoKeys?: string[] }) {
  const [selected, setSelected] = useState(0);
  const active = photoKeys[Math.min(selected, Math.max(0, photoKeys.length - 1))];
  return (
    <section aria-label={`${name} dealership profile`} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="relative flex min-h-72 items-center overflow-hidden bg-gradient-to-br from-rose-100 via-rose-50 to-orange-50 px-8 py-10 sm:min-h-80">
        {active ? <>
          <Image src={getImageUrl(active)} alt={`${name} dealership premises, photo ${selected + 1}`} fill sizes="(max-width: 1280px) 100vw, 830px" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
        </> : <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full bg-rose-200/60" />}
        <div className={`relative space-y-3 ${active ? "text-white" : "text-gray-900"}`}>
          <p className={`text-sm font-medium ${active ? "text-white/90" : "text-gray-700"}`}>Authorized Dealer Profile</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{name}</h1>
          <p className={`max-w-xl text-sm ${active ? "text-white/90" : "text-gray-600"}`}>Explore the latest inventory, reviews, and contact options for {name}.</p>
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
