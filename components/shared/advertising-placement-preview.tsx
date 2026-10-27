"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { AutolistLogo } from "@/components/brand/autolist-logo";

type Placement = { name: string; location: string; rate: number };
const formats: Record<string, { page: string; description: string }> = {
  "Hero Banner": { page: "Homepage", description: "Your large banner sits at the top of the homepage, before the vehicle search. Buyers see your campaign as they arrive." },
  "Top Banner": { page: "Homepage", description: "Your wide banner sits directly below the homepage search, before the vehicle listings." },
  "Featured Dealer Banner": { page: "Vehicle listings", description: "Your wide dealer advert separates two rows of vehicles, putting your dealership in the browsing journey." },
  "Category Page Banner": { page: "Make & model page", description: "Your banner appears above the listings on a make or model page, alongside vehicles buyers are already exploring." },
  "Sidebar Rectangle": { page: "Desktop search results", description: "Your rectangular advert sits beside the vehicle results in the desktop right-hand column." },
  "In-Feed Sponsored Listing": { page: "Search results", description: "Your sponsored card occupies a position within the vehicle results, alongside the other listing cards." },
  "Sponsored Email Feature": { page: "Weekly email digest", description: "Your sponsored feature appears inside the Autolist weekly email, alongside vehicle highlights. This placement is in an email." },
  "Dealer Profile Badge": { page: "Dealer profile", description: "Your business name appears in a sponsored badge on a dealer profile, beside the dealer's identity and above their stock." },
};

function SampleVehicle() {
  return (
    <div className="min-w-0 overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="relative aspect-[3/2] bg-gray-100">
        <Image src="/images/sell-private.webp" alt="" fill sizes="240px" className="object-cover object-right" />
      </div>
      <div className="space-y-1 p-2.5"><p className="text-xs font-semibold text-gray-700">Example vehicle</p><p className="text-[10px] text-gray-500">Photos · Price · Seller details</p></div>
    </div>
  );
}

function SampleAd({ name, business, headline, compact = false }: { name: string; business: string; headline: string; compact?: boolean }) {
  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-md border-2 border-primary bg-white">
      <p className="bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white">Your ad · {name}</p>
      <div className={`relative flex flex-1 overflow-hidden bg-slate-900 text-white ${compact ? "min-h-48 flex-col" : "min-h-40 sm:min-h-48"}`}>
        <div className={`relative z-10 flex min-w-0 flex-1 flex-col justify-center p-4 ${compact ? "" : "sm:p-6"}`}>
          <p className="break-words text-xs font-semibold text-blue-200">{business}</p>
          <p className={`mt-3 break-words font-semibold leading-tight ${compact ? "text-lg" : "text-xl sm:text-2xl"}`}>{headline}</p>
          <p className="mt-2 text-[11px] leading-5 text-slate-300">Explore our latest vehicles and offers.</p>
          <span className="mt-4 self-start rounded bg-white px-3 py-2 text-[11px] font-bold text-slate-900">Explore offers →</span>
        </div>
        {!compact && <div className="relative hidden w-2/5 sm:block"><Image src="/images/sell-private.webp" alt="" fill sizes="280px" className="object-cover object-right" /></div>}
      </div>
    </div>
  );
}

function MockSearch({ category = false }: { category?: boolean }) {
  return (
    <div className="rounded-md bg-gray-100 p-3 sm:p-4">
      <p className="text-sm font-bold text-gray-800">{category ? "Toyota vehicles for sale" : "Find your next vehicle"}</p>
      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] text-gray-500"><span className="rounded border border-gray-200 bg-white px-2 py-2">Any make ▾</span><span className="rounded border border-gray-200 bg-white px-2 py-2">Any model ▾</span><span className="rounded bg-gray-700 px-2 py-2 text-center font-semibold text-white">Search</span></div>
    </div>
  );
}

export function AdvertisingPlacementPreview({ placements }: { placements: readonly Placement[] }) {
  const fieldId = useId();
  const [selectedName, setSelectedName] = useState(placements[0].name);
  const [businessName, setBusinessName] = useState("");
  const [adHeadline, setAdHeadline] = useState("");
  const selected = placements.find(({ name }) => name === selectedName)!;
  const format = formats[selected.name];
  const business = businessName.trim() || "Your business name";
  const headline = adHeadline.trim() || "Your next car starts here.";
  const email = selected.name === "Sponsored Email Feature";
  const profile = selected.name === "Dealer Profile Badge";
  const sidebar = selected.name === "Sidebar Rectangle";
  const feed = selected.name === "In-Feed Sponsored Listing";
  const betweenRows = selected.name === "Featured Dealer Banner";
  const hero = selected.name === "Hero Banner";
  const category = selected.name === "Category Page Banner";
  const ad = (compact = false) => <SampleAd name={selected.name} business={business} headline={headline} compact={compact} />;

  return (
    <section id="placement-preview" className="scroll-mt-24 border-y border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">See exactly where your ad goes</p>
        <h2 className="mt-3 text-2xl font-semibold text-gray-900">Preview your advert on Autolist</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">Choose a placement, then add your business name. The blue outline marks the advertising space you are buying; the surrounding content shows where it appears.</p>
        <div className="mt-7 grid items-start gap-7 lg:grid-cols-[0.55fr_1fr]">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <label htmlFor={`${fieldId}-placement`} className="block text-sm font-semibold text-gray-900">1. Choose an advertising placement</label>
            <select id={`${fieldId}-placement`} value={selectedName} onChange={(event) => setSelectedName(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {placements.map(({ name }) => <option key={name} value={name}>{name}</option>)}
            </select>
            <label htmlFor={`${fieldId}-business`} className="mt-5 block text-sm font-semibold text-gray-900">2. Try your business name</label>
            <input id={`${fieldId}-business`} value={businessName} onChange={(event) => setBusinessName(event.target.value)} maxLength={60} placeholder="Your business name" autoComplete="off" className="mt-2 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
            {!profile && <><label htmlFor={`${fieldId}-headline`} className="mt-4 block text-sm font-semibold text-gray-900">Ad headline (optional)</label><input id={`${fieldId}-headline`} value={adHeadline} onChange={(event) => setAdHeadline(event.target.value)} maxLength={80} placeholder="Your next car starts here." autoComplete="off" className="mt-2 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" /></>}
            <p className="mt-2 text-xs leading-5 text-gray-500">Try it here; these details are not submitted.</p>
            <div aria-live="polite" aria-atomic="true" className="mt-5 border-t border-gray-200 pt-5">
              <h3 className="text-lg font-semibold text-gray-900">{selected.name}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{format.description}</p>
              <p className="mt-4 text-xl font-semibold text-gray-900">KES {selected.rate.toLocaleString("en-KE")} <span className="text-sm font-normal text-gray-500">per month</span></p>
            </div>
            <a href="#contact-sales" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90">Ask sales about this placement</a>
          </div>
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs"><p className="font-semibold text-gray-900">3. Your ad in context: {format.page}</p><p className="font-semibold text-primary">Blue outline = your paid placement</p></div>
            <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm" role="img" aria-label={`${selected.name} preview on ${format.page}. ${format.description} Advertiser: ${business}.${profile ? "" : ` Headline: ${headline}`}`}>
              <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-100 px-3 py-2 text-[10px] text-gray-500"><span>{email ? "Inbox / Autolist weekly digest" : `autolist.co.ke / ${format.page}`}</span><span>Example layout</span></div>
              <div aria-hidden="true">
                <div className="flex items-center justify-between border-b border-gray-200 px-3 py-3 sm:px-5"><AutolistLogo className="h-auto w-24" /><span className="text-[10px] text-gray-500">{email ? "Your weekly vehicle roundup" : "Buy · Sell · News & reviews"}</span></div>
                <div className="space-y-4 p-3 sm:p-5">
                  {email ? (
                    <div className="mx-auto max-w-md space-y-4"><p className="text-[10px] text-gray-500">To: Autolist subscriber · Weekly digest</p><h4 className="text-lg font-bold text-gray-800">This week on Autolist</h4><p className="text-xs leading-5 text-gray-500">Vehicle highlights, buying advice and offers, delivered to your inbox.</p><div className="grid grid-cols-2 gap-3"><SampleVehicle /><SampleVehicle /></div><p className="text-[10px] uppercase tracking-wide text-gray-500">From our advertising partner</p>{ad()}<p className="border-t border-gray-200 pt-3 text-[10px] text-gray-500">Autolist Kenya · Manage email preferences</p></div>
                  ) : profile ? (
                    <><div className="rounded-md bg-gray-100 p-4"><p className="text-lg font-bold text-gray-800">Example dealership</p><p className="mt-1 text-xs text-gray-500">Nairobi · Dealer information</p><div className="mt-4 inline-block max-w-full rounded-md border-2 border-primary bg-white"><p className="bg-primary px-3 py-1.5 text-[10px] font-bold uppercase text-white">Your sponsored badge</p><p className="break-words px-4 py-3 text-sm font-bold text-primary">Sponsored by {business}</p></div></div><p className="text-xs font-semibold text-gray-600">Vehicles from this dealer</p><div className="grid grid-cols-2 gap-3"><SampleVehicle /><SampleVehicle /></div></>
                  ) : (
                    <>
                      {hero && ad()}
                      <MockSearch category={category} />
                      {!hero && !sidebar && !feed && !betweenRows && ad()}
                      <div className={sidebar ? "grid grid-cols-[1fr_0.8fr] items-start gap-3" : ""}>
                        <div className="space-y-4"><p className="text-xs font-semibold text-gray-600">{feed || sidebar ? "Vehicles matching your search" : "Latest vehicles for sale"}</p><div className="grid grid-cols-2 gap-3"><SampleVehicle />{feed ? ad(true) : <SampleVehicle />}</div>{betweenRows && ad()}{betweenRows && <div className="grid grid-cols-2 gap-3"><SampleVehicle /><SampleVehicle /></div>}</div>
                        {sidebar && ad(true)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-gray-500">Example artwork and page content. Final creative, dimensions and placement availability are confirmed with sales.{sidebar ? " The right-hand sidebar is a desktop placement; this mock-up is scaled to fit your screen." : ""}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
