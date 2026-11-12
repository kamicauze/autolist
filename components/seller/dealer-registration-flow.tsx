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
import type { ZodType } from "zod";
import {
  createDealerOnboardingUpload, createDealerRegistration, leaveDealerSetup, searchDealerAddresses,
} from "@/lib/actions/dealers";
import { KENYA_COUNTIES } from "@/lib/constants/filters";
import type { DealerAddress } from "@/lib/location/dealer-address";
import { createClient } from "@/lib/supabase/client";
import {
  dealerRegistrationDocumentLabels, dealerRegistrationSchema,
  type DealerRegistrationDocumentType,
} from "@/lib/validations/registration";
import { cn } from "@/lib/utils";
import { DealerRegistrationReminder } from "./dealer-registration-reminder";

const emptyAddress: DealerAddress = { address: "", town: "", county: "", area: "" };
const inputClass = "h-11 rounded-lg border-border bg-white text-sm";
const selectClass = "h-11 w-full rounded-lg border border-border bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary";
const invalidClass = "border-destructive";
const documentTypes = Object.entries(dealerRegistrationDocumentLabels) as [DealerRegistrationDocumentType, string][];
const acceptedFiles = "application/pdf,image/jpeg,image/png";
const maxFileBytes = 10 * 1024 * 1024;

function fieldMessage(schema: ZodType, value: string, fallback: string) {
  const result = schema.safeParse(value, { error: () => fallback });
  return result.success ? "" : result.error.issues[0]?.message || fallback;
}

function fileProblem(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (file.size === 0) return "This file is empty. Choose another file.";
  if (/^image\/hei[cf]/.test(file.type) || ["heic", "heif"].includes(extension)) {
    return "iPhone HEIC photos aren't supported. Export as JPG or take a screenshot.";
  }
  if (/msword|wordprocessingml/.test(file.type) || ["doc", "docx"].includes(extension)) {
    return "Word documents aren't supported. Save it as PDF and choose it again.";
  }
  if (!acceptedFiles.split(",").includes(file.type)) return "Choose a PDF, JPG or PNG file up to 10 MB.";
  if (file.size > maxFileBytes) return "This file is over 10 MB. Choose a smaller PDF, JPG or PNG file.";
  return "";
}

function FieldError({ id, message }: { id: string; message: string }) {
  return message ? <p id={id} className="text-xs font-medium text-destructive">{message}</p> : null;
}

export function DealerSetupAccountBar({ email, canLeave }: { email?: string; canLeave: boolean }) {
  const [pending, setPending] = useState(false);
  const [accountError, setAccountError] = useState("");

  async function signOut() {
    setPending(true);
    setAccountError("");
    const { error } = await createClient().auth.signOut();
    if (!error) return window.location.assign("/");
    setAccountError("Unable to sign out. Please retry.");
    setPending(false);
  }

  async function continueAsBuyer() {
    setPending(true);
    setAccountError("");
    try {
      const result = await leaveDealerSetup();
      if (result.success) return window.location.assign("/");
      setAccountError(result.error || "Unable to switch your account. Please retry.");
    } catch {
      setAccountError("Unable to switch your account. Please retry.");
    }
    setPending(false);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border px-4 py-1.5 text-xs lg:px-12">
      {email && <p className="min-w-0 max-w-full truncate text-muted-foreground">Signed in as <span className="font-semibold text-foreground">{email}</span></p>}
      <div className="ml-auto flex flex-wrap items-center gap-x-4">
        {canLeave && (
          <p className="text-muted-foreground">
            Not a dealer?{" "}
            <button type="button" disabled={pending} onClick={() => void continueAsBuyer()} className="min-h-8 font-bold text-primary underline-offset-2 hover:underline disabled:opacity-60">
              Continue as a buyer
            </button>
          </p>
        )}
        <button type="button" disabled={pending} onClick={() => void signOut()} className="min-h-8 font-bold text-primary underline-offset-2 hover:underline disabled:opacity-60">
          Sign out
        </button>
      </div>
      {accountError && <p role="alert" className="w-full pb-1 font-medium text-destructive">{accountError}</p>}
    </div>
  );
}

function SectionHeading({ icon: Icon, title, required }: { icon: LucideIcon; title: string; required?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-primary">
        <Icon aria-hidden className="size-5" />
      </span>
      <h2 className="text-lg font-bold leading-tight">{title}</h2>
      {required && <span className="ml-auto shrink-0 rounded-full bg-brand-tint px-2.5 py-1 text-xs font-semibold text-primary">Required</span>}
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
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [createdName, setCreatedName] = useState(existingName);
  const upload = useRef<{ file: File; type: DealerRegistrationDocumentType; path: string }>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const confirmation = useRef<HTMLHeadingElement>(null);
  const submitError = useRef<HTMLDivElement>(null);
  const fieldErrors = {
    name: fieldMessage(dealerRegistrationSchema.shape.name, name, "Enter the dealership name."),
    phone: fieldMessage(dealerRegistrationSchema.shape.phone, phone, "Enter a valid listing phone number."),
    search: !manual && !selected ? "Choose an address from the search results or enter it manually." : "",
    address: manual && !location.address.trim() ? "Enter the address." : "",
    town: manual && !location.town.trim() ? "Enter the town or city." : "",
    county: manual && !location.county ? "Select a county." : "",
    document: uploadError || (!documentType ? "Select a document type, then choose the file." : !file ? "Choose the file to upload." : ""),
  };
  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);
  const shown = showValidation
    ? fieldErrors
    : { name: "", phone: "", search: "", address: "", town: "", county: "", document: uploadError };
  const feedback = error || (showValidation && hasFieldErrors ? "Fix the highlighted fields." : "");
  const typeLabel = documentType ? dealerRegistrationDocumentLabels[documentType] : "Select document type";
  const typeMissing = Boolean(shown.document) && !documentType;

  useEffect(() => {
    if (createdName) {
      window.scrollTo(0, 0);
      confirmation.current?.focus({ preventScroll: true });
    }
  }, [createdName]);

  useEffect(() => {
    if (error || showValidation) submitError.current?.focus();
  }, [error, showValidation]);

  async function search() {
    if (searching) return;
    if (query.trim().length < 3) {
      setSearchError("Type at least 3 characters to search.");
      return;
    }
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
    setDocumentType("");
    setUploadError("");
    upload.current = null;
    if (fileInput.current) fileInput.current.value = "";
  }

  function fail(result: { error?: string; code?: string }) {
    setSessionEnded(result.code === "session_expired");
    setError(result.error || "Unable to create your dealership. Please retry.");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError("");
    setSessionEnded(false);
    if (hasFieldErrors) {
      setShowValidation(true);
      submitError.current?.focus();
      return;
    }
    setShowValidation(false);
    setSaving(true);
    try {
      if (!file || !documentType) return;
      if (upload.current?.file !== file || upload.current.type !== documentType) {
        const target = await createDealerOnboardingUpload(documentType, file);
        if (!target.path || !target.token) return fail(target);
        const { error: putError } = await createClient().storage.from(target.bucket)
          .uploadToSignedUrl(target.path, target.token, file, { contentType: file.type });
        if (putError) return fail({ error: "Unable to upload the document. Please retry." });
        upload.current = { file, type: documentType, path: target.path };
      }
      const document = { name: file.name, type: documentType, path: upload.current.path };
      const result = await createDealerRegistration({ name, phone, ...location, document });
      if (!result.success) return fail(result);
      setCreatedName(result.dealershipName);
    } catch (failure) {
      fail({ error: failure instanceof Error ? failure.message : undefined });
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
        <form noValidate onSubmit={save} className="min-w-0 rounded-2xl border border-border bg-white px-4 lg:px-6">
          <fieldset disabled={saving} className="min-w-0 divide-y divide-border">
            <section className="space-y-2 py-4 sm:space-y-3 lg:pt-6">
              <SectionHeading icon={Store} title="Dealership details" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="dealership-name">Dealership name</Label>
                  <Input id="dealership-name" autoComplete="organization" value={name} onChange={(event) => setName(event.target.value)} placeholder="Acacia Lane Motors" className={cn(inputClass, shown.name && invalidClass)} maxLength={160} required aria-invalid={Boolean(shown.name) || undefined} aria-describedby={shown.name ? "dealership-name-error" : undefined} />
                  <FieldError id="dealership-name-error" message={shown.name} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dealership-phone">Listing phone</Label>
                  <div className="relative">
                    <Phone aria-hidden className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                    <Input id="dealership-phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+254 700 000 000" className={cn(inputClass, "pl-11", shown.phone && invalidClass)} maxLength={32} required aria-invalid={Boolean(shown.phone) || undefined} aria-describedby={shown.phone ? "dealership-phone-error" : undefined} />
                  </div>
                  <FieldError id="dealership-phone-error" message={shown.phone} />
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
                      className={cn(inputClass, "pl-11", shown.search && invalidClass)}
                      aria-invalid={Boolean(shown.search) || undefined}
                      aria-describedby={shown.search ? "dealership-search-error" : undefined}
                    />
                    {query.trim().length >= 3 && (
                      <Button type="button" variant="outline" className="h-11 rounded-lg" disabled={searching} onClick={() => void search()}>
                        {searching ? "Searching…" : "Search"}
                      </Button>
                    )}
                  </div>
                  <FieldError id="dealership-search-error" message={shown.search} />
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
                    <Input id="dealership-address" autoComplete="street-address" value={location.address} onChange={(event) => setLocation({ ...location, address: event.target.value })} maxLength={250} className={cn(inputClass, shown.address && invalidClass)} required aria-invalid={Boolean(shown.address) || undefined} aria-describedby={shown.address ? "dealership-address-error" : undefined} />
                    <FieldError id="dealership-address-error" message={shown.address} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dealership-town">Town / city</Label>
                    <Input id="dealership-town" autoComplete="address-level2" value={location.town} onChange={(event) => setLocation({ ...location, town: event.target.value, area: "" })} maxLength={120} className={cn(inputClass, shown.town && invalidClass)} required aria-invalid={Boolean(shown.town) || undefined} aria-describedby={shown.town ? "dealership-town-error" : undefined} />
                    <FieldError id="dealership-town-error" message={shown.town} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dealership-county">County</Label>
                    <select id="dealership-county" autoComplete="address-level1" value={location.county} onChange={(event) => setLocation({ ...location, county: event.target.value, area: "" })} className={cn(selectClass, shown.county && invalidClass)} required aria-invalid={Boolean(shown.county) || undefined} aria-describedby={shown.county ? "dealership-county-error" : undefined}>
                      <option value="">Select county</option>
                      {KENYA_COUNTIES.map((county) => <option key={county}>{county}</option>)}
                    </select>
                    <FieldError id="dealership-county-error" message={shown.county} />
                  </div>
                </div>
              ) : (
                <Button type="button" variant="ghost" className="h-9 justify-start px-0 font-bold text-primary" onClick={() => setManual(true)}>
                  <Pencil aria-hidden className="size-4" /> {selected ? "Edit address details" : "Enter address manually"}
                </Button>
              )}
              {manual && !selected && (
                <Button type="button" variant="ghost" className="h-9 justify-start px-0 font-bold text-primary" onClick={() => setManual(false)}>
                  <Search aria-hidden className="size-4" /> Search for an address
                </Button>
              )}
            </section>
            <section className="space-y-2 py-4">
              <SectionHeading icon={ShieldCheck} title="Verification document" required />
              <p className="text-sm text-muted-foreground">Upload one document to confirm your dealership. Choose its type first: Certificate of Incorporation, CR12, National ID or Passport.</p>
              <div className="space-y-1.5">
                <Label htmlFor="dealership-document-type" className="hidden md:block">Document type</Label>
                <select id="dealership-document-type" className={cn(selectClass, "hidden md:block", typeMissing && invalidClass)} aria-invalid={typeMissing || undefined} aria-describedby={typeMissing ? "dealership-document-error" : undefined} value={documentType} onChange={(event) => setDocumentType(event.target.value as DealerRegistrationDocumentType | "")}>
                  <option value="" disabled={Boolean(file)}>Select document type</option>
                  {documentTypes.map(([type, label]) => <option key={type} value={type}>{label}</option>)}
                </select>
                <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
                  <div className="md:hidden">
                    <p id="dealer-document-type-label" className="mb-1.5 text-sm font-medium">Document type</p>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" aria-labelledby="dealer-document-type-label dealer-document-type-value" aria-invalid={typeMissing || undefined} aria-describedby={typeMissing ? "dealership-document-error" : undefined} className={cn("h-11 w-full justify-between rounded-lg border border-border px-3 text-sm font-normal text-[#14213d] hover:border-primary", typeMissing && invalidClass)}>
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
                  <p id="dealer-verification-file-help" className="text-xs text-muted-foreground">
                    {file ? typeLabel : documentType ? "PDF, JPG or PNG · 10 MB max" : "Select a document type to choose a file."}
                  </p>
                </div>
                <input
                  ref={fileInput}
                  id="dealership-document"
                  type="file"
                  accept={acceptedFiles}
                  disabled={!documentType}
                  hidden
                  onChange={(event) => {
                    if (!documentType) {
                      event.target.value = "";
                      return;
                    }
                    const next = event.target.files?.[0];
                    upload.current = null;
                    setFile(next);
                    setUploadError(next ? fileProblem(next) : "");
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!documentType}
                  aria-invalid={Boolean(shown.document) || undefined}
                  aria-describedby={shown.document ? "dealer-verification-file-help dealership-document-error" : "dealer-verification-file-help"}
                  className={cn("h-auto shrink-0 border border-border bg-white px-2.5 py-2 text-xs font-bold text-foreground hover:bg-muted hover:text-foreground", shown.document && invalidClass)}
                  onClick={() => fileInput.current?.click()}
                >
                  {file ? "Replace" : "Choose file"}
                </Button>
                {file && <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0" aria-label="Remove verification file" onClick={removeFile}><X className="size-4" /></Button>}
              </div>
              {shown.document && <p id="dealership-document-error" role="alert" className="text-xs font-medium text-destructive">{shown.document}</p>}
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <LockKeyhole aria-hidden className="size-3.5 shrink-0" /> Only you and authorised Autolist reviewers can access this file.
              </p>
            </section>
            {feedback && (
              <div ref={submitError} tabIndex={-1} role="alert" className="scroll-mb-24 space-y-1 py-3 text-sm font-medium text-destructive lg:scroll-mb-0">
                <p>{feedback}</p>
                {sessionEnded && (
                  <p className="font-normal text-foreground">
                    <Link href="/login?next=/register/dealer" target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline">Sign in</Link>
                    {" "}(opens in a new tab), then come back here and press Create dealer account again. Your details are kept.
                  </p>
                )}
              </div>
            )}
            <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-end gap-4 border-t border-border bg-white px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3.5 lg:static lg:px-0 lg:pb-6 lg:pt-4">
              <Button type="submit" disabled={saving} className="h-[46px] w-full rounded-lg px-6 font-bold disabled:bg-[#f0f1f5] disabled:text-[#626270] disabled:opacity-100 lg:w-auto">
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
