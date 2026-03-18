"use client";

import * as React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Zap,
  DollarSign,
  BarChart3,
  Users,
  Car,
  Calendar,
  Gauge,
  Wrench,
  MapPin,
  Palette,
} from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Instant Valuation",
    description: "Get an accurate estimate of your car's worth in seconds.",
  },
  {
    icon: DollarSign,
    title: "100% Free",
    description: "No hidden fees. Our valuation tool is completely free to use.",
  },
  {
    icon: BarChart3,
    title: "Market-Based Pricing",
    description: "Valuations based on real market data and recent sales.",
  },
  {
    icon: Users,
    title: "Trusted by Millions",
    description:
      "Over 1 million car owners have used our valuation service.",
  },
];

const steps = [
  {
    step: "1",
    title: "Enter Your Car Details",
    description:
      "Provide your registration number and current mileage to get started.",
  },
  {
    step: "2",
    title: "Get Your Valuation",
    description:
      "Our algorithm analyses market data to give you an accurate price range.",
  },
  {
    step: "3",
    title: "Sell or Compare",
    description:
      "Use your valuation to sell on Autolist or compare dealer offers.",
  },
];

const factors = [
  {
    icon: Car,
    title: "Make & Model",
    description: "Brand reputation and model popularity directly affect value.",
  },
  {
    icon: Calendar,
    title: "Age & Year",
    description: "Newer vehicles generally command higher market prices.",
  },
  {
    icon: Gauge,
    title: "Mileage",
    description: "Lower mileage typically means higher resale value.",
  },
  {
    icon: Wrench,
    title: "Condition",
    description: "Well-maintained vehicles with service history are worth more.",
  },
  {
    icon: MapPin,
    title: "Location",
    description: "Market demand varies by region, affecting your car's value.",
  },
  {
    icon: Palette,
    title: "Colour & Specs",
    description: "Popular colours and premium features can increase value.",
  },
];

export default function ValuationPage() {
  const [regNumber, setRegNumber] = React.useState("");
  const [mileage, setMileage] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with valuation API
    console.log("Valuation request:", { regNumber, mileage });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <PageHero
          label="CAR VALUATION"
          heading="Get instant, free valuation for your car"
        >
          {/* Valuation Form Card */}
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-xl">
            <h3 className="text-lg font-bold text-foreground">
              Get Your Free Car Valuation
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your registration and mileage to receive an instant estimate.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-number">Registration Number</Label>
                <Input
                  id="reg-number"
                  placeholder="e.g. KDA 123A"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Current Mileage (km)</Label>
                <Input
                  id="mileage"
                  type="number"
                  placeholder="e.g. 45000"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-sm font-semibold">
                Get Free Valuation
              </Button>
            </form>
          </div>
        </PageHero>

        {/* Why Value Your Car */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            Why value your car?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Understanding your car&apos;s value helps you make better decisions
            whether you&apos;re selling, trading in, or insuring.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-xl border border-border bg-white p-5 text-center shadow-sm"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              Getting your car valued is quick and easy — just three simple
              steps.
            </p>

            <div className="mt-10 grid gap-6 sm:gap-8 sm:grid-cols-3">
              {steps.map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white text-lg font-bold">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What Affects Your Car's Value */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            What affects your car&apos;s value?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Several key factors determine how much your vehicle is worth on the
            market.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {factors.map((factor) => (
              <div
                key={factor.title}
                className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm"
              >
                <div className="flex h-3 w-3 mt-1.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    {factor.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {factor.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
