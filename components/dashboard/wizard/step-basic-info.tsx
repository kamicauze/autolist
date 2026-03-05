"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LISTING_CATEGORY_OPTIONS,
  LISTING_CONDITION_OPTIONS,
  LISTING_AVAILABILITY_OPTIONS,
  KENYA_CITIES,
} from "@/lib/constants/marketplace";
import { useWizard, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, formatPriceInput, unformatPrice, formatKES } from "./wizard-context";

export function StepBasicInfo() {
  const { draft, updateField, showValidationErrors } = useWizard();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Listing Basics</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="listing-title">Listing Title</Label>
          <Input
            id="listing-title"
            placeholder="2019 Toyota Prado TX-L, low mileage"
            maxLength={MAX_TITLE_LENGTH}
            className={cn(showValidationErrors && !draft.title.trim() && "border-destructive")}
            value={draft.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {draft.title.length}/{MAX_TITLE_LENGTH} characters
          </p>
        </div>
        <div>
          <Label>Category</Label>
          <div className="flex h-12 items-center rounded-lg border border-input bg-muted px-4 text-sm font-medium">
            {LISTING_CATEGORY_OPTIONS.find((o) => o.value === draft.category)?.label ?? "Not selected"}
          </div>
        </div>
        <div>
          <Label htmlFor="listing-condition">Condition</Label>
          <select
            id="listing-condition"
            className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
            value={draft.condition}
            onChange={(e) => updateField("condition", e.target.value as typeof draft.condition)}
          >
            {LISTING_CONDITION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="listing-price">Price (KES)</Label>
          <Input
            id="listing-price"
            type="text"
            inputMode="numeric"
            placeholder="2,450,000"
            className={cn(showValidationErrors && (!draft.priceKes || Number(draft.priceKes) <= 0) && "border-destructive")}
            value={formatPriceInput(draft.priceKes)}
            onChange={(e) => updateField("priceKes", unformatPrice(e.target.value))}
          />
          {draft.priceKes && Number(draft.priceKes) > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">{formatKES(draft.priceKes)}</p>
          )}
        </div>
        <label className="flex items-end gap-3 rounded-lg border border-border p-3">
          <input
            type="checkbox"
            checked={draft.negotiable}
            onChange={(e) => updateField("negotiable", e.target.checked)}
          />
          <span className="text-sm text-foreground">Negotiable</span>
        </label>
        <div>
          <Label>Currency</Label>
          <div className="flex h-12 items-center rounded-lg border border-input bg-muted px-4 text-sm font-medium">
            KES (Locked for MVP)
          </div>
        </div>
        <div>
          <Label htmlFor="listing-country">Country</Label>
          <Select value={draft.country || "Kenya"} onValueChange={(v) => updateField("country", v)}>
            <SelectTrigger id="listing-country" className={cn(showValidationErrors && !draft.country && "border-destructive")}>
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Kenya">Kenya</SelectItem>
              <SelectItem value="Uganda">Uganda</SelectItem>
              <SelectItem value="Tanzania">Tanzania</SelectItem>
              <SelectItem value="Rwanda">Rwanda</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="listing-city">City / Town</Label>
          <Select value={draft.cityTown} onValueChange={(v) => updateField("cityTown", v)}>
            <SelectTrigger id="listing-city" className={cn(showValidationErrors && !draft.cityTown && "border-destructive")}>
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {KENYA_CITIES.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="listing-location-area">Location / Area</Label>
          <Input
            id="listing-location-area"
            placeholder="Westlands"
            className={cn(showValidationErrors && !draft.locationArea.trim() && "border-destructive")}
            value={draft.locationArea}
            onChange={(e) => updateField("locationArea", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="listing-description">Description</Label>
        <Textarea
          id="listing-description"
          maxLength={MAX_DESCRIPTION_LENGTH}
          placeholder="Add relevant history, condition notes, and current state."
          className={cn(showValidationErrors && !draft.description.trim() && "border-destructive")}
          value={draft.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {draft.description.length}/{MAX_DESCRIPTION_LENGTH} characters
        </p>
      </div>
      <div>
        <Label htmlFor="listing-availability">Availability Status</Label>
        <select
          id="listing-availability"
          className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
          value={draft.availability}
          onChange={(e) => updateField("availability", e.target.value as typeof draft.availability)}
        >
          {LISTING_AVAILABILITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
