"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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

const COLOR_OPTIONS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Red", hex: "#DC2626" },
];

const YEARS = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() - i
);

interface ImportInquiryFormProps {
  makes: string[];
}

export function ImportInquiryForm({ makes }: ImportInquiryFormProps) {
  const [make, setMake] = React.useState("");
  const [model, setModel] = React.useState("");
  const [yearFrom, setYearFrom] = React.useState("");
  const [yearTo, setYearTo] = React.useState("");
  const [engineSize, setEngineSize] = React.useState("");
  const [selectedColor, setSelectedColor] = React.useState("Black");
  const [budgetFrom, setBudgetFrom] = React.useState("");
  const [budgetTo, setBudgetTo] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const { models: availableModels, isLoading: modelsLoading } = useCarModels(
    make || null
  );

  React.useEffect(() => {
    setModel("");
  }, [make]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit form to API
    alert("Import inquiry submitted! We will get back to you shortly.");
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
      {/* How it works info bar */}
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-gray-600">
          <span className="font-semibold text-gray-900">How it works:</span>{" "}
          Submit your requirements and our import specialists will search global markets to find your
          ideal vehicle. We handle all paperwork, shipping, and compliance.
        </p>
      </div>

      {/* Vehicle Details */}
      <div className="mb-8">
        <h3 className="mb-5 text-lg font-semibold text-gray-900">Vehicle Details</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Make <span className="text-red-500">*</span>
            </label>
            <Select value={make} onValueChange={setMake}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="e.g., Toyota, BMW, Mercedes" />
              </SelectTrigger>
              <SelectContent>
                {makes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Model <span className="text-red-500">*</span>
            </label>
            <Select
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
            </Select>
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
                {YEARS.map((year) => (
                  <SelectItem key={year} value={String(year)}>
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
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => setSelectedColor(color.name)}
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
        <h3 className="mb-5 text-lg font-semibold text-gray-900">Budget Range</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Budget From <span className="text-red-500">*</span>
            </label>
            <Input
              value={budgetFrom}
              onChange={(e) => setBudgetFrom(e.target.value)}
              placeholder="Kes"
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Budget To <span className="text-red-500">*</span>
            </label>
            <Input
              value={budgetTo}
              onChange={(e) => setBudgetTo(e.target.value)}
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

      {/* Submit Buttons */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Button
          type="submit"
          className="w-full rounded-full sm:w-auto sm:px-8"
        >
          Submit Import Inquiry
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
    </form>
  );
}
