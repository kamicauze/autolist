"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWizard } from "./wizard-context";

export function StepVehicleDetails() {
  const { draft, updateDetailField, showValidationErrors, selectedCategoryFields } = useWizard();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Vehicle / Equipment Details</h2>
      {!draft.category && (
        <p className="text-sm text-warning">Select a category first.</p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {selectedCategoryFields.map((field) => {
          const hasError = showValidationErrors && field.required && !draft.details[field.key].trim();
          return (
            <div key={field.key}>
              <Label htmlFor={`listing-detail-${field.key}`}>
                {field.label}{field.required ? " *" : ""}
              </Label>
              {field.type === "select" ? (
                <select
                  id={`listing-detail-${field.key}`}
                  className={cn(
                    "flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base",
                    hasError && "border-destructive"
                  )}
                  value={draft.details[field.key]}
                  onChange={(e) => updateDetailField(field.key, e.target.value)}
                >
                  <option value="">Select</option>
                  {field.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <Input
                  id={`listing-detail-${field.key}`}
                  className={cn(hasError && "border-destructive")}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={draft.details[field.key]}
                  onChange={(e) => updateDetailField(field.key, e.target.value)}
                />
              )}
              {hasError && (
                <p className="mt-1 text-xs text-destructive">{field.label} is required.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
