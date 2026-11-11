"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  CarFront, CheckCircle2, ChevronDown, FileText, Loader2, LockKeyhole,
  MapPin, Pencil, Phone, Search, ShieldCheck, Store, Upload, X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createDealerOnboardingUpload, createDealerRegistration, searchDealerAddresses,
} from "@/lib/actions/dealers";
import { KENYA_COUNTIES } from "@/lib/constants/filters";
import type { DealerAddress } from "@/lib/location/dealer-address";
import { createClient } from "@/lib/supabase/client";
import {
  dealerRegistrationDocumentLabels, listingPhoneSchema,
  type DealerRegistrationDocumentType,
} from "@/lib/validations/registration";
import { cn } from "@/lib/utils";
import { DealerRegistrationReminder } from "./dealer-registration-reminder";

const emptyAddress: DealerAddress = { address: "", town: "", county: "", area: "" };
const inputClass = "h-11 rounded-lg border-border bg-white text-sm";
const selectClass = "h-11 w-full rounded-lg border border-border bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary";
const documentTypes = Object.entries(dealerRegistrationDocumentLabels) as [DealerRegistrationDocumentType, string][];
const acceptedFiles = "application/pdf,image/jpeg,image/png";

function SectionHeading({ icon: Icon, title, optional }: { icon: LucideIcon; title: string; optional?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-primary">
        <Icon aria-hidden className="size-5" />
      </span>
      <h2 className="text-lg font-bold leading-tight">{title}</h2>
      {optional && <span className="ml-auto shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">Optional</span>}
    </div>
  );
}

export function DealerRegistrationFlow({ existingName }: { existingName?: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState(emptyAddress);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(false);
  const [manual, setManual] = useState(false);
  const [results, setResults] = useState<DealerAddress[] | null>(null);
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);
  const [documentType, setDocumentType] = useState<DealerRegistrationDocumentType | "">("");
  const [file, setFile] = useState<File>();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [createdName, setCreatedName] = useState(existingName);
  const upload = useRef<{ file: File; type: DealerRegistrationDocumentType; path: string }>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const confirmation = useRef<HTMLHeadingElement>(null);
  const submitError = useRef<HTMLParagraphElement>(null);
  const hasAddress = Boolean(location.address.trim() && location.town.trim() && location.county);
  const ready = Boolean(name.trim() && listingPhoneSchema.safeParse(phone).success &&
    hasAddress && !uploadError && (!file || documentType));
  const typeLabel = documentType ? dealerRegistrationDocumentLabels[documentType] : "Select document type";

  useEffect(() => {
    if (createdName) {
      window.scrollTo(0, 0);
      confirmation.current?.focus({ preventScroll: true });
    }
  }, [createdName]);

  useEffect(() => {
    if (error) submitError.current?.focus();
  }, [error]);

  async function search() {
    if (searching || query.trim().length < 3) return;
    setSearching(true);
    setSearchError("");
    setResults(null);
    try {
      const response = await searchDealerAddresses(query);
      if (response.results) setResults(response.results);
      else setSearchError(response.error);
    } catch {
      setSearchError("Address search is unavailable. You can enter the address manually.");
    } finally {
      setSearching(false);
    }
  }

  function chooseAddress(address: DealerAddress) {
    setLocation(address);
    setSelected(true);
    setManual(!address.town || !address.county);
    setResults(null);
    setError("");
  }

  function removeFile() {
    setFile(undefined);
    setUploadError("");
    upload.current = null;
    if (fileInput.current) fileInput.current.value = "";
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || saving) return;
    setSaving(true);
    setError("");
    try {
      let document;
      if (file && documentType) {
        if (upload.current?.file !== file || upload.current.type !== documentType) {
          const target = await createDealerOnboardingUpload(documentType, file);
          if (!target.path || !target.token) throw new Error(target.error);
          const { error: putError } = await createClient().storage.from(target.bucket)
            .uploadToSignedUrl(target.path, target.token, file, { contentType: file.type });
          if (putError) throw new Error("Unable to upload the document. Please retry.");
          upload.current = { file, type: documentType, path: target.path };
        }
        document = { name: file.name, type: documentType, path: upload.current.path };
      }
      const result = await createDealerRegistration({ name, phone, ...location, document });
      if (!result.success) throw new Error(result.error);
      setCreatedName(result.dealershipName);
    } catch (failure) {
      setError(failure instanceof Error && failure.message
        ? failure.message
        : "Unable to create your dealership. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  if (createdName) {
    return (
      <main className="mx-auto w-full max-w-[672px] px-4 py-6 sm:pt-[92px]">
        <section className="space-y-4 rounded-2xl border border-border bg-white p-5 sm:p-8">
          <span className="grid size-12 place-items-center rounded-xl bg-[#e8f6ee] text-[#00834c] sm:size-[54px]">
            <CheckCircle2 aria-hidden className="size-6" />
          </span>
          <div className="space-y-2">
            <h1 ref={confirmation} tabIndex={-1} className="font-heading text-[30px] font-bold leading-[1.1] tracking-tight outline-none sm:text-[40px]">Your dealer account is ready</h1>
            <p className="text-sm text-muted-foreground sm:text-base">{createdName} can now add and publish listings.</p>
          </div>
          <DealerRegistrationReminder showAction={false} />
          <div className="grid gap-2.5 sm:grid-cols-2">
            <Button asChild className="h-12 rounded-lg font-bold sm:col-span-2">
              <Link href="/dashboard/listings/new">Add a listing</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-lg border border-border text-foreground font-bold hover:border-primary">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-lg border border-border text-foreground font-bold hover:border-primary">
              <Link href="/dashboard/verification">Finish verification</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1152px] px-4 pb-28 pt-6 lg:pb-12 lg:pt-[38px]">
      <div className="mb-5 space-y-2 lg:mb-6">
        <h1 className="font-heading text-[30px] font-bold leading-[1.1] tracking-tight lg:text-[42px]">Set up your dealership</h1>
        <p className="text-sm leading-5 text-muted-foreground lg:text-base">Create your dealer account in one step. You can finish verification later.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,760px)_minmax(280px,1fr)]">
        <form onSubmit={save} className="min-w-0 rounded-2xl border border-border bg-white px-4 lg:px-6">
          <fieldset disabled={saving} className="min-w-0 divide-y divide-border">
            <section className="space-y-2 py-4 sm:space-y-3 lg:pt-6">
              <SectionHeading icon={Store} title="Dealership details" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="dealership-name">Dealership name</Label>
                  <Input id="dealership-name" autoComplete="organization" value={name} onChange={(event) => setName(event.target.value)} placeholder="Acacia Lane Motors" className={inputClass} maxLength={160} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dealership-phone">Listing phone</Label>
                  <div className="relative">
                    <Phone aria-hidden className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                    <Input id="dealership-phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+254 700 000 000" className={cn(inputClass, "pl-11")} maxLength={32} required />
                  </div>
                </div>
              </div>
            </section>
            <section className="space-y-2 py-4 sm:space-y-3">
              <SectionHeading icon={MapPin} title="Dealership location" />
              {!selected && !manual && (
                <>
                  <p className="text-sm text-muted-foreground">Search once to fill your address, town and county.</p>
                  <div className="relative flex items-center gap-2">
                    <Search aria-hidden className="pointer-events-none absolute left-3.5 size-5 text-muted-foreground" />
                    <Input
                      aria-label="Search for a building or street"
                      placeholder="Search for a building or street"
                      type="search"
                      value={query}
                      maxLength={160}
                      disabled={searching}
                      onChange={(event) => { setQuery(event.target.value); setResults(null); setSearchError(""); }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") { event.preventDefault(); void search(); }
                      }}
                      className={cn(inputClass, "pl-11")}
                    />
                    {query.trim().length >= 3 && (
                      <Button type="button" variant="outline" className="h-11 rounded-lg" disabled={searching} onClick={() => void search()}>
                        {searching ? "Searching…" : "Search"}
                      </Button>
                    )}
                  </div>
                  {searchError && <p role="status" className="text-sm text-muted-foreground">{searchError}</p>}
                  {results && (
                    <div className="space-y-2" aria-live="polite">
                      {results.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No addresses found. Try a different search or enter the address manually.</p>
                      ) : (
                        <ul className="divide-y divide-border rounded-lg border border-border">
                          {results.map((result) => (
                            <li key={JSON.stringify(result)}>
                              <button type="button" onClick={() => chooseAddress(result)} className="w-full px-3 py-2.5 text-left hover:bg-brand-tint focus-visible:bg-brand-tint">
                                <span className="block text-sm font-semibold">{result.address}</span>
                                <span className="block text-xs text-muted-foreground">{[result.town, result.county && result.county + " County"].filter(Boolean).join(" · ")}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="text-xs text-muted-foreground underline">© OpenStreetMap contributors</a>
                    </div>
                  )}
                </>
              )}
              {selected && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-brand-muted-border bg-brand-tint p-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-bold">{location.address}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{[location.area, location.town, location.county && location.county + " County"].filter(Boolean).join(" · ")}</p>
                  </div>
                  <Button type="button" variant="ghost" className="shrink-0 px-1 text-primary" onClick={() => { setLocation(emptyAddress); setManual(false); setSelected(false); }}>
                    <Search aria-hidden className="size-4" /> Change
                  </Button>
                </div>
              )}
              {manual ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="dealership-address">Address</Label>
                    <Input id="dealership-address" autoComplete="street-address" value={location.address} onChange={(event) => setLocation({ ...location, address: event.target.value })} maxLength={250} className={inputClass} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dealership-town">Town / city</Label>
                    <Input id="dealership-town" autoComplete="address-level2" value={location.town} onChange={(event) => setLocation({ ...location, town: event.target.value, area: "" })} maxLength={120} className={inputClass} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dealership-county">County</Label>
                    <select id="dealership-county" autoComplete="address-level1" value={location.county} onChange={(event) => setLocation({ ...location, county: event.target.value, area: "" })} className={selectClass} required>
                      <option value="">Select county</option>
                      {KENYA_COUNTIES.map((county) => <option key={county}>{county}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <Button type="button" variant="ghost" className="h-9 justify-start px-0 font-bold text-primary" onClick={() => setManual(true)}>
                  <Pencil aria-hidden className="size-4" /> {selected ? "Edit address details" : "Enter address manually"}
                </Button>
              )}
              {manual && !selected && (
                <Button type="button" variant="ghost" className="h-9 justify-start px-0 font-bold text-primary" onClick={() => { setManual(false); setLocation(emptyAddress); }}>
                  <Search aria-hidden className="size-4" /> Search for an address
                </Button>
              )}
            </section>
            <section className="space-y-2 py-4">
              <SectionHeading icon={ShieldCheck} title="Verification document" optional />
              <p className="text-sm text-muted-foreground">Upload one document now or add it later.</p>
              <div className="space-y-1.5">
                <Label htmlFor="dealership-document-type" className="hidden md:block">Document type</Label>
                <select id="dealership-document-type" className={cn(selectClass, "hidden md:block")} value={documentType} onChange={(event) => setDocumentType(event.target.value as DealerRegistrationDocumentType | "")}>
                  <option value="">Select document type</option>
                  {documentTypes.map(([type, label]) => <option key={type} value={type}>{label}</option>)}
                </select>
                <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
                  <div className="md:hidden">
                    <p id="dealer-document-type-label" className="mb-1.5 text-sm font-medium">Document type</p>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" aria-labelledby="dealer-document-type-label dealer-document-type-value" className="h-11 w-full justify-between rounded-lg border border-border px-3 text-sm font-normal text-[#14213d] hover:border-primary">
                        <span id="dealer-document-type-value">{typeLabel}</span>
                        <ChevronDown aria-hidden className="size-4 text-muted-foreground" />
                      </Button>
                    </DialogTrigger>
                  </div>
                  <DialogContent aria-describedby={undefined} overlayClassName="bg-[#14213d]/35" className="bottom-0 top-auto z-[70] translate-y-0 gap-1 rounded-t-2xl p-4 pt-6 text-[#14213d] [&>button:last-child]:grid [&>button:last-child]:size-11 [&>button:last-child]:place-items-center [&>button:last-child]:rounded-lg [&>button:last-child]:bg-muted">
                    <DialogTitle className="mb-3 pr-14 text-lg font-bold">Select document type</DialogTitle>
                    {documentTypes.map(([type, label]) => (
                      <Button key={type} type="button" variant="ghost" aria-pressed={documentType === type} className={cn("h-11 justify-start gap-3 rounded-lg px-2 text-sm font-semibold text-[#14213d] hover:bg-brand-tint hover:text-[#14213d] focus-visible:bg-brand-tint", documentType === type && "bg-brand-tint")} onClick={() => { setDocumentType(type); setPickerOpen(false); }}>
                        <FileText aria-hidden className="size-4 text-primary" /> {label}
                      </Button>
                    ))}
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex min-h-14 items-center gap-2.5 rounded-lg border border-border bg-muted px-3 py-2">
                <Upload aria-hidden className="size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold" title={file?.name}>{file?.name || "Verification file"}</p>
                  <p className="text-xs text-muted-foreground">{file && documentType ? typeLabel : "PDF, JPG or PNG · 10 MB max"}</p>
                </div>
                <input
                  ref={fileInput}
                  id="dealership-document"
                  aria-label="Choose verification file"
                  type="file"
                  accept={acceptedFiles}
                  className="peer sr-only"
                  onChange={(event) => {
                    const next = event.target.files?.[0];
                    upload.current = null;
                    setFile(next);
                    setUploadError(next && (!acceptedFiles.split(",").includes(next.type) || next.size === 0 || next.size > 10 * 1024 * 1024)
                      ? "Choose a PDF, JPG or PNG file up to 10 MB."
                      : "");
                  }}
                />
                <label htmlFor="dealership-document" className="cursor-pointer whitespace-nowrap rounded-lg border border-border bg-white px-2.5 py-2 text-xs font-bold text-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-primary">
                  {file ? "Replace" : "Choose file"}
                </label>
                {file && <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0" aria-label="Remove verification file" onClick={removeFile}><X className="size-4" /></Button>}
              </div>
              {uploadError && <p role="alert" className="text-xs text-destructive">{uploadError}</p>}
              {file && !documentType && <p role="status" className="text-xs text-muted-foreground">Select a document type for this file.</p>}
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <LockKeyhole aria-hidden className="size-3.5 shrink-0" /> Only you and authorised Autolist reviewers can access this file.
              </p>
            </section>
            {error && <p ref={submitError} tabIndex={-1} role="alert" className="py-3 text-sm font-medium text-destructive">{error}</p>}
            <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-end gap-4 border-t border-border bg-white px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3.5 lg:static lg:px-0 lg:pb-6 lg:pt-4">
              {!hasAddress && <p className="mr-auto hidden text-xs text-muted-foreground lg:block">Choose a location or enter your address to continue.</p>}
              <Button type="submit" disabled={!ready || saving} className="h-[46px] w-full rounded-lg px-6 font-bold disabled:bg-[#f0f1f5] disabled:text-[#626270] disabled:opacity-100 lg:w-auto">
                {saving && <Loader2 aria-hidden className="size-4 animate-spin" />}
                {saving ? "Creating dealer account…" : "Create dealer account"}
              </Button>
            </div>
          </fieldset>
        </form>
        <aside className="hidden h-fit space-y-4 rounded-2xl border border-border bg-white p-[22px] lg:block">
          <div>
            <span className="mb-2 grid size-11 place-items-center rounded-xl bg-brand-tint text-primary">
              <CarFront aria-hidden className="size-5" />
            </span>
            <h2 className="text-lg font-bold">Start listing right away</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Create your dealer account to add and publish vehicles.</p>
          </div>
          <div className="flex items-start gap-3 border-t border-border pt-4">
            <ShieldCheck aria-hidden className="size-5 shrink-0 text-primary" />
            <div>
              <h3 className="text-sm font-bold">Verified dealer badge</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">You can finish verification whenever you’re ready. The badge appears after approval.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
