"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icon3D } from "@/components/ui/icon-3d";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCarModels } from "@/hooks/use-car-models";
import { Info } from "lucide-react";
import Link from "next/link";
import { COLORS, COLOR_SWATCHES, YEARS, OLDER_THAN_1990_YEAR_OPTION } from "@/lib/constants/filters";
import { LISTING_CATEGORY_OPTIONS, type ListingCategory } from "@/lib/constants/marketplace";
import { getNonCarVehicleReferenceOptions } from "@/lib/data/vehicle-reference-catalog";
import { submitImportInquiry } from "@/lib/actions/import-inquiry";
import { formatImportBudget, importInquirySchema } from "@/lib/import-inquiry/validation";

interface ImportInquiryFormProps {
  makes: string[];
}

export function ImportInquiryForm({ makes }: ImportInquiryFormProps) {
  const [category, setCategory] = React.useState<ListingCategory>("car");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ success: boolean; message: string } | null>(null);
  const [make, setMake] = React.useState("");
  const [model, setModel] = React.useState("");
  const [yearFrom, setYearFrom] = React.useState("");
  const [yearTo, setYearTo] = React.useState("");
  const [engineSize, setEngineSize] = React.useState("");
  const [selectedColor, setSelectedColor] = React.useState<(typeof COLORS)[number] | "">("");
  const [budgetFrom, setBudgetFrom] = React.useState("");
  const [budgetTo, setBudgetTo] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const { models: availableModels, isLoading: modelsLoading } = useCarModels(
    category === "car" ? make || null : null
  );

  const reference = getNonCarVehicleReferenceOptions(category);
  const availableMakes = category === "car" ? makes : reference.makes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFeedback(null);
    const input = { category, make, model, yearFrom, yearTo, engineSize, color: selectedColor, budgetFrom, budgetTo, firstName, email, phone, notes };
    const parsed = importInquirySchema.safeParse(input);
    if (!parsed.success) {
      setFeedback({ success: false, message: parsed.error.issues[0]?.message || "Check your requirements." });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await submitImportInquiry(input);
      if (!result.success) {
        setFeedback({ success: false, message: result.error });
        return;
      }
      setCategory("car");
      setMake("");
      setModel("");
      setYearFrom("");
      setYearTo("");
      setEngineSize("");
      setSelectedColor("");
      setBudgetFrom("");
      setBudgetTo("");
      setFirstName("");
      setEmail("");
      setPhone("");
      setNotes("");
      setFeedback({ success: true, message: result.message });
    } catch {
      setFeedback({ success: false, message: "Unable to send your inquiry. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
      <fieldset disabled={isSubmitting} className="min-w-0">
      {/* How it works info bar */}
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-brand-muted-border bg-brand-tint/50 p-4">
        <Icon3D icon={Info} size="sm" />
        <p className="text-sm leading-relaxed text-gray-600">
          <span className="font-semibold text-gray-900">How it works:</span>{" "}
          Submit your requirements and our import specialists will search global markets to find your
          ideal vehicle. We handle all paperwork, shipping, and compliance.
        </p>
      </div>

      {/* Vehicle Details */}
      <div className="mb-8">
        <h3 className="mb-5 text-lg font-semibold text-gray-900">Vehicle Details</h3>

        <div className="mb-4 space-y-1.5">
          <label htmlFor="import-category" className="text-sm font-medium text-gray-700">Vehicle Category <span className="text-red-500">*</span></label>
          <Select value={category} onValueChange={(value) => { setCategory(value as ListingCategory); setMake(""); setModel(""); }}>
            <SelectTrigger id="import-category" className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>{LISTING_CATEGORY_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Make <span className="text-red-500">*</span>
            </label>
            {category !== "car" && reference.makeInputMode === "manual" ? (
              <Input aria-label="Make" value={make} onChange={(event) => { setMake(event.target.value); setModel(""); }} className="h-11" placeholder="Enter make" />
            ) : <Select value={make} onValueChange={(value) => { setMake(value); setModel(""); }}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="e.g., Toyota, BMW, Mercedes" />
              </SelectTrigger>
              <SelectContent>
                {availableMakes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Model <span className="text-red-500">*</span>
            </label>
            {category !== "car" ? (
              <Input aria-label="Model" value={model} onChange={(event) => setModel(event.target.value)} disabled={!make} className="h-11" placeholder="Enter model" />
            ) : <Select
              value={model}
              onValueChange={setModel}
              disabled={!make || modelsLoading}
            >
              <SelectTrigger className="h-11">
                <SelectValue
                  placeholder={modelsLoading ? "Loading..." : "e.g., Supra, M3, AMG GT"}
                />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Year From <span className="text-red-500">*</span>
            </label>
            <Select value={yearFrom} onValueChange={setYearFrom}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="2021" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OLDER_THAN_1990_YEAR_OPTION.value}>{OLDER_THAN_1990_YEAR_OPTION.label}</SelectItem>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Year To <span className="text-red-500">*</span>
            </label>
            <Select value={yearTo} onValueChange={setYearTo}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="2026" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem disabled={Boolean(yearFrom && Number(yearFrom) > 1989)} value={OLDER_THAN_1990_YEAR_OPTION.value}>{OLDER_THAN_1990_YEAR_OPTION.label}</SelectItem>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={String(year)} disabled={Boolean(yearFrom && year < Number(yearFrom))}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Engine Size (CC)</label>
          <Input
            value={engineSize}
            onChange={(e) => setEngineSize(e.target.value)}
            placeholder="e.g., 2000, 3000, or 2.0L - 3.5L"
            className="h-11"
          />
          <p className="text-xs text-gray-400">
            Specify engine displacement in cubic centimeters or as a range
          </p>
        </div>
      </div>

      {/* Colour Preferences */}
      <div className="mb-8">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Colour Preferences</h3>
        <p className="mb-4 text-sm text-gray-500">
          Select colour options you&apos;d prefer (optional)
        </p>

        <div className="flex flex-wrap gap-3">
          {COLORS.map((name) => ({ name, hex: COLOR_SWATCHES[name] })).map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => setSelectedColor(selectedColor === color.name ? "" : color.name)}
              aria-pressed={selectedColor === color.name}
              className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
                selectedColor === color.name
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              <span
                className="h-4 w-4 rounded-full border border-gray-200"
                style={{ backgroundColor: color.hex }}
              />
              {color.name}
            </button>
          ))}
        </div>
      </div>

      {/* Budget Range */}
      <div className="mb-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Budget Range</h3>
          <Button type="button" variant="ghost" size="sm" onClick={() => { setBudgetFrom(""); setBudgetTo(""); }}>
            Reset all
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="import-budget-from" className="text-sm font-medium text-gray-700">
              Budget From <span className="text-red-500">*</span>
            </label>
            <Input
              id="import-budget-from"
              value={budgetFrom}
              onChange={(e) => setBudgetFrom(formatImportBudget(e.target.value))}
              inputMode="numeric"
              placeholder="Kes"
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="import-budget-to" className="text-sm font-medium text-gray-700">
              Budget To <span className="text-red-500">*</span>
            </label>
            <Input
              id="import-budget-to"
              value={budgetTo}
              onChange={(e) => setBudgetTo(formatImportBudget(e.target.value))}
              inputMode="numeric"
              placeholder="Kes"
              className="h-11"
            />
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="mb-8">
        <h3 className="mb-5 text-lg font-semibold text-gray-900">Personal Information</h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John Doe"
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.smith@example.com"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 7700 900000"
                className="h-11"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="mb-8">
        <h3 className="mb-5 text-lg font-semibold text-gray-900">Additional Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional requirements, preferences, or questions..."
          rows={4}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {feedback && (
        <p
          role={feedback.success ? "status" : "alert"}
          className={`mb-6 rounded-lg border p-4 text-sm ${feedback.success ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}
        >
          {feedback.message}
        </p>
      )}

      {/* Submit Buttons */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Button
          type="submit"
          className="w-full rounded-full sm:w-auto sm:px-8"
        >
          {isSubmitting ? "Submitting…" : "Submit Import Inquiry"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full sm:w-auto sm:px-8"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
      </div>

      {/* Legal */}
      <p className="mt-6 text-center text-xs text-gray-400">
        By submitting this form, you agree to our{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>
        . We&apos;ll never share your information without your consent.
      </p>
      </fieldset>
    </form>
  );
}
