"use client";

import * as React from "react";
import {
  BellRing,
  CheckCircle2,
  Mail,
  PauseCircle,
  Pencil,
  PlayCircle,
  Trash2,
} from "lucide-react";
import {
  createListingAlert,
  deleteListingAlert,
  setListingAlertStatus,
  updateListingAlert,
} from "@/lib/actions/listing-alerts";
import {
  LISTING_ALERT_CATEGORY_CONFIG,
  LISTING_ALERT_PRICE_OPTIONS,
} from "@/lib/constants/listing-alerts";
import {
  LISTING_CATEGORY_OPTIONS,
  type ListingCategory,
} from "@/lib/constants/marketplace";
import type {
  ListingAlertInput,
  ListingAlertRecord,
} from "@/lib/types/listing-alerts";
import { getListingAlertCriterionValue } from "@/lib/utils/listing-alerts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const EMPTY_ALERT: ListingAlertInput = {
  category: "car",
  make: "",
  model: "",
  location: "",
  minYear: "",
  maxYear: "",
  priceRange: "any",
  primaryValue: "any",
  secondaryValue: "any",
  emailEnabled: true,
  priceDropEnabled: true,
};

function categoryLabel(category: ListingCategory) {
  return LISTING_CATEGORY_OPTIONS.find(({ value }) => value === category)?.label ?? category;
}

function formatDate(value: string | null) {
  if (!value) return "No matches yet";
  return `Last match ${new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))}`;
}

function alertToInput(alert: ListingAlertRecord): ListingAlertInput {
  const [primaryField, secondaryField] = LISTING_ALERT_CATEGORY_CONFIG[alert.category].fields;
  return {
    category: alert.category,
    make: alert.make || "",
    model: alert.model || "",
    location: alert.location || "",
    minYear: alert.minYear ?? "",
    maxYear: alert.maxYear ?? "",
    priceRange: alert.priceRange,
    primaryValue: getListingAlertCriterionValue(alert.criteria, primaryField.key),
    secondaryValue: getListingAlertCriterionValue(alert.criteria, secondaryField.key),
    emailEnabled: alert.emailEnabled,
    priceDropEnabled: alert.priceDropEnabled,
  };
}

function alertSummary(alert: ListingAlertRecord) {
  const details = [
    alert.make,
    alert.model,
    alert.location,
    alert.minYear || alert.maxYear
      ? `${alert.minYear || "Any"}–${alert.maxYear || "Now"}`
      : null,
    LISTING_ALERT_PRICE_OPTIONS.find(({ value }) => value === alert.priceRange)?.label,
  ].filter(Boolean);
  return details.join(" · ");
}

export function ListingAlertsManager({
  initialAlerts,
  viewerEmail,
  initialError,
}: {
  initialAlerts: ListingAlertRecord[];
  viewerEmail: string | null;
  initialError: string | null;
}) {
  const [alerts, setAlerts] = React.useState(initialAlerts);
  const emptyAlert = React.useMemo(
    () => ({ ...EMPTY_ALERT, emailEnabled: Boolean(viewerEmail) }),
    [viewerEmail]
  );
  const [form, setForm] = React.useState<ListingAlertInput>(emptyAlert);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(initialError);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const config = LISTING_ALERT_CATEGORY_CONFIG[form.category];

  const resetForm = React.useCallback(() => {
    setForm(emptyAlert);
    setEditingId(null);
  }, [emptyAlert]);

  const updateField = <Key extends keyof ListingAlertInput>(
    key: Key,
    value: ListingAlertInput[Key]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCategoryChange = (category: ListingCategory) => {
    setForm((current) => ({
      ...current,
      category,
      make: "",
      model: "",
      primaryValue: "any",
      secondaryValue: "any",
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const result = editingId
        ? await updateListingAlert(editingId, form)
        : await createListingAlert(form);

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      if (result.alert) {
        const savedAlert = result.alert;
        setAlerts((current) =>
          editingId
            ? current.map((alert) => (alert.id === savedAlert.id ? savedAlert : alert))
            : [savedAlert, ...current]
        );
      }
      setActionSuccess(result.message);
      resetForm();
    });
  };

  const handleEdit = (alert: ListingAlertRecord) => {
    setEditingId(alert.id);
    setForm(alertToInput(alert));
    setActionError(null);
    setActionSuccess(null);
    document.getElementById("listing-alert-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleStatus = (alert: ListingAlertRecord) => {
    const status = alert.status === "active" ? "paused" : "active";
    setBusyId(alert.id);
    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const result = await setListingAlertStatus(alert.id, status);
      if (!result.success) {
        setActionError(result.error);
      } else if (result.alert) {
        const savedAlert = result.alert;
        setAlerts((current) =>
          current.map((item) => (item.id === savedAlert.id ? savedAlert : item))
        );
        setActionSuccess(result.message);
      }
      setBusyId(null);
    });
  };

  const handleDelete = (alert: ListingAlertRecord) => {
    if (!window.confirm(`Delete “${alert.label}”? This cannot be undone.`)) return;
    setBusyId(alert.id);
    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const result = await deleteListingAlert(alert.id);
      if (!result.success) {
        setActionError(result.error);
      } else {
        setAlerts((current) => current.filter((item) => item.id !== alert.id));
        if (editingId === alert.id) resetForm();
        setActionSuccess(result.message);
      }
      setBusyId(null);
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 text-left">
      <div
        id="listing-alert-form"
        className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:p-7"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {editingId ? "Edit saved alert" : "Create a saved alert"}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-950">
              {editingId ? "Update your matching preferences" : "What are you looking for?"}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <BellRing className="h-4 w-4 text-primary" />
            In-app alerts are always on
          </div>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="alert-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => handleCategoryChange(value as ListingCategory)}
              >
                <SelectTrigger id="alert-category" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="alert-location">Location</Label>
              <Input
                id="alert-location"
                value={form.location || ""}
                onChange={(event) => updateField("location", event.target.value)}
                placeholder="Any location"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="alert-price">Price range</Label>
              <Select
                value={form.priceRange}
                onValueChange={(value) =>
                  updateField("priceRange", value as ListingAlertInput["priceRange"])
                }
              >
                <SelectTrigger id="alert-price" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_ALERT_PRICE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="alert-make">{config.brandLabel}</Label>
              <Input
                id="alert-make"
                value={form.make || ""}
                onChange={(event) => updateField("make", event.target.value)}
                placeholder={`Any ${config.brandLabel.toLowerCase()}`}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="alert-model">{config.modelLabel}</Label>
              <Input
                id="alert-model"
                value={form.model || ""}
                onChange={(event) => updateField("model", event.target.value)}
                placeholder={`Any ${config.modelLabel.toLowerCase()}`}
                className="h-10"
              />
            </div>

            {config.fields.map((field, index) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={`alert-category-field-${index}`}>{field.label}</Label>
                <Select
                  value={
                    index === 0
                      ? form.primaryValue || "any"
                      : form.secondaryValue || "any"
                  }
                  onValueChange={(value) =>
                    updateField(index === 0 ? "primaryValue" : "secondaryValue", value)
                  }
                >
                  <SelectTrigger id={`alert-category-field-${index}`} className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            <div className="space-y-1.5">
              <Label htmlFor="alert-year-from">Year From</Label>
              <Input
                id="alert-year-from"
                type="number"
                min={1900}
                max={new Date().getFullYear() + 1}
                value={form.minYear ?? ""}
                onChange={(event) => updateField("minYear", event.target.value)}
                placeholder="e.g. 2016"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="alert-year-to">Year To</Label>
              <Input
                id="alert-year-to"
                type="number"
                min={1900}
                max={new Date().getFullYear() + 1}
                value={form.maxYear ?? ""}
                onChange={(event) => updateField("maxYear", event.target.value)}
                placeholder="e.g. 2026"
                className="h-10"
              />
            </div>
          </div>

          <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50/70 p-4 sm:grid-cols-2">
            <div className="flex items-start justify-between gap-4 rounded-lg bg-white p-3">
              <div>
                <Label htmlFor="alert-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" /> Email notifications
                </Label>
                <p className="mt-1 text-xs text-gray-500">
                  {viewerEmail
                    ? `Send matches to ${viewerEmail}`
                    : "Requires an email on your profile"}
                </p>
              </div>
              <Switch
                id="alert-email"
                checked={form.emailEnabled}
                disabled={!viewerEmail}
                onCheckedChange={(checked) => updateField("emailEnabled", checked)}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg bg-white p-3">
              <div>
                <Label htmlFor="alert-price-drops">Price-drop alerts</Label>
                <p className="mt-1 text-xs text-gray-500">
                  Notify me when a matching active listing gets cheaper.
                </p>
              </div>
              <Switch
                id="alert-price-drops"
                checked={form.priceDropEnabled}
                onCheckedChange={(checked) => updateField("priceDropEnabled", checked)}
              />
            </div>
          </div>

          {actionError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {actionError}
            </div>
          ) : null}
          {actionSuccess ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> {actionSuccess}
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2">
            {editingId ? (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isPending}
              >
                Cancel edit
              </Button>
            ) : null}
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : editingId ? "Save Changes" : "Create Alert"}
            </Button>
          </div>
        </form>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Saved alerts
          </p>
          <h2 className="mt-1 text-xl font-semibold text-gray-950">
            {alerts.length === 0
              ? "No alerts yet"
              : `${alerts.length} saved alert${alerts.length === 1 ? "" : "s"}`}
          </h2>
        </div>

        {alerts.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-gray-300 px-5 py-9 text-center">
            <BellRing className="mx-auto h-7 w-7 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-800">
              Your saved alerts will appear here.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Create one above to start monitoring listings.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {alerts.map((alert) => {
              const busy = isPending && busyId === alert.id;
              return (
                <article key={alert.id} className="rounded-xl border border-gray-200 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-950">{alert.label}</h3>
                        <Badge variant={alert.status === "active" ? "success" : "warning"}>
                          {alert.status === "active" ? "Active" : "Paused"}
                        </Badge>
                        <Badge variant="outline">{categoryLabel(alert.category)}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{alertSummary(alert)}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>In-app notifications</span>
                        {alert.emailEnabled ? <span>Email enabled</span> : null}
                        {alert.priceDropEnabled ? <span>Price drops enabled</span> : null}
                        <span>{formatDate(alert.lastMatchedAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(alert)}
                        disabled={isPending}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatus(alert)}
                        disabled={isPending}
                      >
                        {alert.status === "active" ? (
                          <PauseCircle className="mr-1.5 h-3.5 w-3.5" />
                        ) : (
                          <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {busy ? "Saving…" : alert.status === "active" ? "Pause" : "Resume"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(alert)}
                        disabled={isPending}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
