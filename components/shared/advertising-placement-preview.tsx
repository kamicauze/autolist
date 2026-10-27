"use client";

import { useId, useState } from "react";
import Image from "next/image";

type Placement = { name: string; location: string; rate: number };

function SampleAd({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex h-full min-h-20 flex-col justify-center rounded-lg border border-primary/30 bg-blue-50 ${compact ? "p-3" : "p-5 sm:p-7"}`}>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">Advertisement · Sample creative</span>
      <strong className={`mt-2 text-gray-900 ${compact ? "text-sm" : "text-xl sm:text-2xl"}`}>Your business, in the spotlight.</strong>
      {!compact && <p className="mt-2 text-sm text-gray-600">Your logo, campaign message and call to action.</p>}
      <span className="mt-3 text-xs font-semibold text-primary">Discover your offer →</span>
    </div>
  );
}

function SampleVehicle() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="relative aspect-[3/2] bg-gray-100">
        <Image src="/images/sell-private.webp" alt="" fill sizes="240px" className="object-cover" />
      </div>
      <p className="p-3 text-xs font-medium text-gray-600">Vehicle listing</p>
    </div>
  );
}

export function AdvertisingPlacementPreview({ placements }: { placements: readonly Placement[] }) {
  const selectId = useId();
  const [selectedName, setSelectedName] = useState(placements[0].name);
  const selected = placements.find(({ name }) => name === selectedName)!;
  const email = selected.name === "Sponsored Email Feature";
  const profile = selected.name === "Dealer Profile Badge";
  const sidebar = selected.name === "Sidebar Rectangle";
  const feed = selected.name === "In-Feed Sponsored Listing";
  const betweenRows = selected.name === "Featured Dealer Banner";
  const hero = selected.name === "Hero Banner";

  return (
    <section id="placement-preview" className="scroll-mt-24 border-y border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">See what you get</p>
            <h2 className="mt-3 text-2xl font-semibold text-gray-900">Preview your placement</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">See how your brand could appear across Autolist. Choose a placement to explore its position and format.</p>
            <label htmlFor={selectId} className="mt-6 block text-sm font-semibold text-gray-900">Advertising placement</label>
            <select id={selectId} value={selectedName} onChange={(event) => setSelectedName(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {placements.map(({ name }) => <option key={name} value={name}>{name}</option>)}
            </select>
            <div aria-live="polite" aria-atomic="true" className="mt-5">
              <h3 className="font-semibold text-gray-900">{selected.name}</h3>
              <p className="mt-1 text-sm leading-6 text-gray-600">{selected.location}</p>
              <p className="mt-3 text-xl font-semibold text-gray-900">KES {selected.rate.toLocaleString("en-KE")} <span className="text-sm font-normal text-gray-500">per month</span></p>
            </div>
            <a href="#contact-sales" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90">Discuss this placement</a>
            <p className="mt-4 text-xs leading-5 text-gray-500">Illustrative layouts with sample creative. Final artwork, dimensions and positioning are agreed with our sales team.</p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50" role="img" aria-label={`${selected.name} illustrative preview: ${selected.location}`}>
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 text-xs text-gray-500"><span className="font-semibold text-gray-900">{email ? "Autolist weekly digest" : "Autolist Kenya"}</span><span>Illustrative preview</span></div>
            <div className="space-y-4 p-4 sm:p-6" aria-hidden="true">
              {email ? (
                <div className="mx-auto max-w-sm space-y-4 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-500">Weekly digest</p><p className="text-lg font-semibold text-gray-900">This week on Autolist</p>
                  <SampleVehicle /><SampleAd /><p className="text-xs text-gray-500">More vehicles and news from Autolist</p>
                </div>
              ) : profile ? (
                <><div className="rounded-lg border border-gray-200 bg-white p-5"><p className="text-lg font-semibold text-gray-900">Dealer profile</p><span className="mt-3 inline-flex rounded-md border border-primary/30 bg-blue-50 px-3 py-2 text-xs font-semibold text-primary">Sponsored · Your brand</span><p className="mt-3 text-xs text-gray-500">Dealer information and inventory</p></div><div className="grid grid-cols-2 gap-3"><SampleVehicle /><SampleVehicle /></div></>
              ) : (
                <>
                  {hero && <SampleAd />}
                  <div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-sm font-semibold text-gray-900">{selected.name === "Category Page Banner" ? "Browse a make or model" : "Find your next vehicle"}</p><div className="mt-3 h-8 rounded border border-gray-200 bg-gray-50" /></div>
                  {!hero && !sidebar && !feed && !betweenRows && <SampleAd />}
                  <div className={sidebar ? "grid grid-cols-[1fr_0.8fr] gap-3" : ""}>
                    <div className="space-y-4"><p className="text-xs font-semibold text-gray-600">{feed ? "Search results" : "Vehicle listings"}</p><div className="grid grid-cols-2 gap-3"><SampleVehicle />{feed ? <SampleAd compact /> : <SampleVehicle />}</div>{betweenRows && <SampleAd compact />}{betweenRows && <div className="grid grid-cols-2 gap-3"><SampleVehicle /><SampleVehicle /></div>}</div>
                    {sidebar && <SampleAd compact />}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
