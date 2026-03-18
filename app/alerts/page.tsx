"use client";

import * as React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/shared/page-hero";
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
    description: "Receive instant email updates when a matching car is posted.",
  },
  {
    icon: Smartphone,
    title: "Manage Demand",
    description: "Pause, edit, or delete alerts any time from your account.",
  },
];

export default function AlertsPage() {
  const [notificationMethods, setNotificationMethods] = React.useState({
    email: true,
    push: false,
    priceDrop: true,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <PageHero label="CAR ALERTS" heading="Get instant notification when a car is available">
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
                <h4 className="text-sm font-semibold text-gray-900">Car Preferences</h4>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Make</Label>
                    <Select defaultValue="any">
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Make</SelectItem>
                        <SelectItem value="toyota">Toyota</SelectItem>
                        <SelectItem value="nissan">Nissan</SelectItem>
                        <SelectItem value="bmw">BMW</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Model</Label>
                    <Select defaultValue="any">
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Model</SelectItem>
                        <SelectItem value="harrier">Harrier</SelectItem>
                        <SelectItem value="x5">X5</SelectItem>
                        <SelectItem value="demio">Demio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Year From</Label>
                    <Input type="number" placeholder="e.g. 2016" className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Year To</Label>
                    <Input type="number" placeholder="e.g. 2024" className="h-10" />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Fuel Type</Label>
                    <Select defaultValue="any">
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Fuel</SelectItem>
                        <SelectItem value="petrol">Petrol</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
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
          <h2 className="text-center text-2xl font-bold text-gray-900">How car alerts work</h2>
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
