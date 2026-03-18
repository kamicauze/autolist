import { Search, GitCompare, Handshake } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Find your ideal car",
    description:
      "Browse thousands of listings from private sellers and trusted dealers.",
  },
  {
    icon: GitCompare,
    number: "02",
    title: "Compare and verify",
    description:
      "Review detailed vehicle histories, compare prices across multiple listings.",
  },
  {
    icon: Handshake,
    number: "03",
    title: "Connect and complete your deal",
    description:
      "Contact sellers directly for private sales or work with verified dealers.",
  },
];

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
            const Icon = step.icon;
            return (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
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
