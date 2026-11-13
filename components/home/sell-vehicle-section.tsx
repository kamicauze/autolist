import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon3D } from "@/components/ui/icon-3d";
import { Check } from "lucide-react";

const sellOptions = [
  {
    title: "Create an advert",
    description:
      "Review selling options and current requirements. Private seller phone verification is currently paused.",
    benefits: [
      "Set your own asking price",
      "Connect with interested buyers",
      "Manage enquiries your way",
    ],
    buttonText: "View selling options",
    href: "/sell",
    variant: "outline" as const,
  },
  {
    title: "Sell to a dealer",
    description:
      "Submit your vehicle for offers from approved dealers. Offers depend on dealer interest and your vehicle details.",
    benefits: [
      "Share your vehicle details",
      "Review any offers you receive",
      "Agree inspection and handover directly",
    ],
    buttonText: "Request dealer offers",
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
            Sell your vehicle
          </p>
          <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            Choose how you want to sell
          </h2>
          <p className="mx-auto max-w-xl text-sm text-gray-500">
            Advertise your vehicle or request dealer offers. View the requirements for each selling route.
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
                    <Icon3D icon={Check} variant="glyph" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={option.variant}
                className="w-full rounded-full border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Link href={option.href} data-track="sell_cta_click" data-track-target={option.buttonText}>{option.buttonText}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
