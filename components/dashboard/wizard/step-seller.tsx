"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWizard } from "./wizard-context";

export function StepSeller() {
  const { draft, updateField, applyDealerAutofill, showValidationErrors, sellerValidationError } = useWizard();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Seller Information</h2>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.useDealerAutoFill}
          onChange={(e) => applyDealerAutofill(e.target.checked)}
        />
        Use dealer defaults (auto-fill for logged-in dealers)
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="listing-seller-type">Seller Type</Label>
          <select
            id="listing-seller-type"
            className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
            value={draft.sellerType}
            onChange={(e) => updateField("sellerType", e.target.value as "dealer" | "individual")}
          >
            <option value="dealer">Dealer</option>
            <option value="individual">Individual</option>
          </select>
        </div>
        <div>
          <Label htmlFor="listing-contact-name">Contact Name *</Label>
          <Input
            id="listing-contact-name"
            placeholder="John Doe"
            value={draft.contactName}
            onChange={(e) => updateField("contactName", e.target.value)}
            className={cn(showValidationErrors && !draft.contactName.trim() && "border-destructive")}
          />
        </div>
        <div>
          <Label htmlFor="listing-phone">Phone Number *</Label>
          <Input
            id="listing-phone"
            placeholder="+254 7XX XXX XXX"
            value={draft.phoneNumber}
            onChange={(e) => updateField("phoneNumber", e.target.value)}
            className={cn(showValidationErrors && !draft.phoneNumber.trim() && "border-destructive")}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="listing-whatsapp-number">WhatsApp Number</Label>
            {draft.whatsappEnabled && draft.phoneNumber && draft.phoneNumber !== draft.whatsappNumber && (
              <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => updateField("whatsappNumber", draft.phoneNumber)}>
                Copy from phone
              </Button>
            )}
          </div>
          <Input
            id="listing-whatsapp-number"
            value={draft.whatsappNumber}
            onChange={(e) => updateField("whatsappNumber", e.target.value)}
            disabled={!draft.whatsappEnabled}
            className={cn(showValidationErrors && draft.whatsappEnabled && !draft.whatsappNumber.trim() && "border-destructive")}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.whatsappEnabled} onChange={(e) => updateField("whatsappEnabled", e.target.checked)} />
          WhatsApp Enabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.allowPhoneCalls} onChange={(e) => updateField("allowPhoneCalls", e.target.checked)} />
          Allow Phone Calls
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.hidePhoneNumber} onChange={(e) => updateField("hidePhoneNumber", e.target.checked)} />
          Hide Phone Number
        </label>
      </div>

      {sellerValidationError && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {sellerValidationError}
        </p>
      )}
    </div>
  );
}
