import Link from "next/link";
import {
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  Ship,
  type LucideIcon,
} from "lucide-react";

import { Illustration3D } from "@/components/ui/icon-3d";
import type { Icon3DAssetKey } from "@/lib/constants/icon-3d-assets";

type Feature = {
  title: string;
  description: string;
  buttonText: string;
  href: string;
  asset: Icon3DAssetKey;
  fallbackIcon: LucideIcon;
};

const features: Feature[] = [
  {
    title: "Car Insurance",
    description:
      "Protect your next vehicle with flexible cover options built for local drivers.",
    buttonText: "Get insured",
    href: "/insurance",
    asset: "car-insurance",
    fallbackIcon: ShieldCheck,
  },
  {
    title: "Security advice",
    description: "Advice on how to buy and sell vehicles safely.",
    buttonText: "Read advice",
    href: "/security-advice",
    asset: "security-advice",
    fallbackIcon: ShieldAlert,
  },
  {
    title: "Financing",
    description:
      "Fill out our credit approval form for your next used vehicle loan.",
    buttonText: "Apply now",
    href: "/calculator",
    asset: "car-financing",
    fallbackIcon: CreditCard,
  },
  {
    title: "Car Importation",
    description:
      "Let experts help you in importing a car of your choice.",
    buttonText: "Inquire now",
    href: "/import-inquiry",
    asset: "car-import",
    fallbackIcon: Ship,
  },
];

export function DiscoverMore() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Discover more from Autolist
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            return (
              <div
                key={feature.title}
                className="group flex h-full flex-col rounded-lg border border-gray-100 bg-white p-4 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative mb-5 flex h-40 items-center justify-center overflow-hidden rounded-lg text-primary">
                  <Illustration3D
                    asset={feature.asset}
                    fallbackIcon={feature.fallbackIcon}
                    size="xl"
                    className="h-24 w-24 transition-transform duration-300 group-hover:scale-105 [&>svg]:h-12 [&>svg]:w-12"
                  />
                </div>

                <div className="flex flex-1 flex-col">
                  <h3 className="mb-1.5 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mb-5 flex-grow text-sm leading-relaxed text-gray-600">
                    {feature.description}
                  </p>
                  <Link
                    href={feature.href}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
                  >
                    {feature.buttonText}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
