import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const sellOptions = [
  {
    title: "Create an advert",
    description:
      "Create your own advert and reach thousands of buyers directly. You set the price and stay in control of the entire process.",
    benefits: [
      "Set your own asking price",
      "Reach thousands of car buyers",
      "Manage enquiries your way",
    ],
    buttonText: "Create your advert",
    href: "/sell",
    variant: "outline" as const,
  },
  {
    title: "Sell to a dealer",
    description:
      "Get a quick, guaranteed offer from a trusted dealer. No haggling, no hassle — just a fair price and a fast deal.",
    benefits: [
      "Get an instant valuation",
      "No haggling or tyre-kickers",
      "Fast, hassle-free collection",
    ],
    buttonText: "Get your offer",
    href: "/sell/dealer",
    variant: "outline" as const,
  },
];

export function SellVehicleSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Sell your car
          </p>
          <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            Choose how you want to sell
          </h2>
          <p className="mx-auto max-w-xl text-sm text-gray-500">
            Whether you want full control or a quick, hassle-free sale &mdash; we&apos;ve got the right option for you.
          </p>
        </div>

        {/* Cards */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {sellOptions.map((option) => (
            <div
              key={option.title}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8"
            >
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {option.title}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-500">
                {option.description}
              </p>

              <ul className="mb-8 flex-1 space-y-3">
                {option.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={option.variant}
                className="w-full rounded-full border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Link href={option.href}>{option.buttonText}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
