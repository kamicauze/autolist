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
import { BadgeCheck, FileCheck2, Shield, Wallet } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Comprehensive Cover",
    description: "Protect your car from accidents, theft, and major losses.",
  },
  {
    icon: Wallet,
    title: "Affordable Rates",
    description: "Compare quotes from trusted insurers in minutes.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted Providers",
    description: "We partner with vetted and reliable insurance companies.",
  },
  {
    icon: FileCheck2,
    title: "Simple Claims",
    description: "Get guided support for documentation and claims process.",
  },
];

const premiumFactors = [
  "Car make and model",
  "Driver age and history",
  "Location and usage",
  "Vehicle year and value",
  "No-claim history",
  "Type of cover",
];

export default function InsurancePage() {
  const [coverType, setCoverType] = React.useState("comprehensive");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <PageHero label="CAR INSURANCE" heading="Compare quotes from top Kenyan insurers">
          <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:p-7">
            <h3 className="text-base font-semibold text-gray-900">Get your quote</h3>
            <p className="mt-1 text-xs text-gray-500">Fill in your details and we&apos;ll match you with the right cover.</p>

            <form className="mt-5 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="insurance-full-name">Full Name</Label>
                  <Input id="insurance-full-name" placeholder="John Doe" className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="insurance-email">Email</Label>
                  <Input id="insurance-email" type="email" placeholder="you@email.com" className="h-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="insurance-make-model">Car make & model</Label>
                  <Input id="insurance-make-model" placeholder="e.g. Toyota Harrier" className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="insurance-year">Year of manufacture</Label>
                  <Input id="insurance-year" type="number" placeholder="e.g. 2020" className="h-10" />
                </div>
              </div>

              <div className="grid grid-cols-[110px_1fr] gap-3">
                <div className="space-y-1.5">
                  <Label>Country</Label>
                  <Select defaultValue="+254">
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+254">+254</SelectItem>
                      <SelectItem value="+255">+255</SelectItem>
                      <SelectItem value="+256">+256</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="insurance-phone">Phone</Label>
                  <Input id="insurance-phone" type="tel" placeholder="7XX XXX XXX" className="h-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Cover type</Label>
                  <Select value={coverType} onValueChange={setCoverType}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                      <SelectItem value="third-party-fire-theft">Third party fire & theft</SelectItem>
                      <SelectItem value="third-party">Third party only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="insurance-start-date">Start date</Label>
                  <Input id="insurance-start-date" type="date" className="h-10" />
                </div>
              </div>

              <Button type="submit" className="h-10 w-full">Get Quote</Button>
            </form>
          </div>
        </PageHero>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">Why Get Insurance Through AutoDrive?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-gray-600">
            Save time by comparing providers in one place and choosing the best fit for your budget.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-gray-900">{benefit.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-14 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">What Affects Your Insurance Premium?</h2>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {premiumFactors.map((factor) => (
              <span
                key={factor}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700"
              >
                {factor}
              </span>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
