import { Search, GitCompare, Handshake } from "lucide-react";

import { Illustration3D } from "@/components/ui/icon-3d";

const steps = [
  {
    icon: Search,
    asset: "search-vehicle",
    number: "01",
    title: "Find your ideal vehicle",
    description:
      "Browse thousands of listings from private sellers and trusted dealers.",
  },
  {
    icon: GitCompare,
    asset: "compare-vehicles",
    number: "02",
    title: "Compare and verify",
    description:
      "Review detailed vehicle histories, compare prices across multiple listings.",
  },
  {
    icon: Handshake,
    asset: "handshake-deal",
    number: "03",
    title: "Connect and complete your deal",
    description:
      "Contact sellers directly for private sales or work with verified dealers.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="border-t border-gray-100 bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Label */}
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">
          Find vehicles with Autolist
        </p>

        <h2 className="mb-4 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
          Reserve online with Autolist
        </h2>

        {/* Steps */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step) => {
            return (
              <div key={step.title} className="text-center">
                <Illustration3D
                  asset={step.asset}
                  fallbackIcon={step.icon}
                  size="lg"
                  className="mx-auto mb-4 flex"
                />
                <h3 className="mb-2 text-base font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-gray-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
