"use client";

import * as React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LISTING_ALERT_CATEGORY_CONFIG } from "@/lib/constants/listing-alerts";
import {
  LISTING_CATEGORY_OPTIONS,
  type ListingCategory,
} from "@/lib/constants/marketplace";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BellRing, Mail, Smartphone } from "lucide-react";

const alertSteps = [
  {
    icon: BellRing,
    title: "Create Alerts",
    description: "Set your preferences once and let us monitor new listings.",
  },
  {
    icon: Mail,
    title: "Get notified",
    description: "Receive instant email updates when a matching listing is posted.",
  },
  {
    icon: Smartphone,
    title: "Manage Demand",
    description: "Pause, edit, or delete alerts any time from your account.",
  },
];

export default function AlertsPage() {
  const [category, setCategory] = React.useState<ListingCategory>("car");
  const [notificationMethods, setNotificationMethods] = React.useState({
    email: true,
    push: false,
    priceDrop: true,
  });
  const categoryConfig = LISTING_ALERT_CATEGORY_CONFIG[category];
  const categoryLabel = LISTING_CATEGORY_OPTIONS.find(
    (option) => option.value === category
  )?.label;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <PageHero
          label="LISTING ALERTS"
          heading="Get notified when the right listing becomes available"
        >
          <div className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:p-7">
            <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>

            <form className="mt-4 space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="alert-first-name">First Name</Label>
                  <Input id="alert-first-name" placeholder="John" className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="alert-last-name">Last Name</Label>
                  <Input id="alert-last-name" placeholder="Doe" className="h-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="alert-email">Email Address</Label>
                  <Input id="alert-email" type="email" placeholder="you@email.com" className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="alert-phone">Phone Number</Label>
                  <Input id="alert-phone" type="tel" placeholder="07XX XXX XXX" className="h-10" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900">Listing Preferences</h4>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="alert-category">Category</Label>
                    <Select
                      value={category}
                      onValueChange={(value) => setCategory(value as ListingCategory)}
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
                    <Input id="alert-location" placeholder="Any location" className="h-10" />
                  </div>

                  <div
                    key={category}
                    className="contents"
                    aria-label={`${categoryLabel ?? "Listing"} preferences`}
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor={`alert-make-${category}`}>
                        {categoryConfig.brandLabel}
                      </Label>
                      <Input
                        id={`alert-make-${category}`}
                        placeholder={`Any ${categoryConfig.brandLabel.toLowerCase()}`}
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`alert-model-${category}`}>
                        {categoryConfig.modelLabel}
                      </Label>
                      <Input
                        id={`alert-model-${category}`}
                        placeholder={`Any ${categoryConfig.modelLabel.toLowerCase()}`}
                        className="h-10"
                      />
                    </div>

                    {categoryConfig.fields.map((field, index) => (
                      <div key={field.label} className="space-y-1.5">
                        <Label htmlFor={`alert-category-field-${index}`}>
                          {field.label}
                        </Label>
                        <Select defaultValue="any">
                          <SelectTrigger
                            id={`alert-category-field-${index}`}
                            className="h-10"
                          >
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
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="alert-year-from">Year From</Label>
                    <Input id="alert-year-from" type="number" placeholder="e.g. 2016" className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="alert-year-to">Year To</Label>
                    <Input id="alert-year-to" type="number" placeholder="e.g. 2024" className="h-10" />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Price Range</Label>
                    <Select defaultValue="any">
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Price</SelectItem>
                        <SelectItem value="under-1m">Under Ksh 1M</SelectItem>
                        <SelectItem value="1m-3m">Ksh 1M - 3M</SelectItem>
                        <SelectItem value="above-3m">Above Ksh 3M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900">Notification Settings</h4>
                <div className="mt-3 space-y-2 rounded-xl border border-gray-200 p-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={notificationMethods.email}
                      onChange={(e) =>
                        setNotificationMethods((prev) => ({ ...prev, email: e.target.checked }))
                      }
                    />
                    Email notifications
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={notificationMethods.push}
                      onChange={(e) =>
                        setNotificationMethods((prev) => ({ ...prev, push: e.target.checked }))
                      }
                    />
                    Push notifications
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={notificationMethods.priceDrop}
                      onChange={(e) =>
                        setNotificationMethods((prev) => ({ ...prev, priceDrop: e.target.checked }))
                      }
                    />
                    Price drop alerts
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline">Cancel</Button>
                <Button type="submit">Create Alert</Button>
              </div>
            </form>
          </div>
        </PageHero>

        <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">How listing alerts work</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {alertSteps.map((step) => (
              <div key={step.title} className="rounded-xl border border-gray-200 bg-white p-5 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
