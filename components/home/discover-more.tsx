import Link from "next/link";
import {
  CarFront,
  CreditCard,
  Globe2,
  ShieldCheck,
  Ship,
  Tags,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  title: string;
  description: string;
  buttonText: string;
  href: string;
  Illustration: LucideIcon;
  Accent: LucideIcon;
  accentPosition: string;
};

const features: Feature[] = [
  {
    title: "Car Insurance",
    description:
      "Protect your next vehicle with flexible cover options built for local drivers.",
    buttonText: "Get insured",
    href: "/insurance",
    Illustration: CarFront,
    Accent: ShieldCheck,
    accentPosition: "right-10 top-7 h-16 w-16",
  },
  {
    title: "Value your car",
    description:
      "Join thousands who value their vehicle with Autolist.",
    buttonText: "Value your car",
    href: "/valuation",
    Illustration: CarFront,
    Accent: Tags,
    accentPosition: "left-10 top-7 h-12 w-12 -rotate-12",
  },
  {
    title: "Financing",
    description:
      "Fill out our credit approval form for your next used vehicle loan.",
    buttonText: "Apply now",
    href: "/calculator",
    Illustration: CreditCard,
    Accent: CarFront,
    accentPosition: "right-10 bottom-8 h-12 w-12",
  },
  {
    title: "Car Importation",
    description:
      "Let experts help you in importing a car of your choice.",
    buttonText: "Inquire now",
    href: "/import-inquiry",
    Illustration: Globe2,
    Accent: Ship,
    accentPosition: "right-9 top-8 h-11 w-11",
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
            const Illustration = feature.Illustration;
            const Accent = feature.Accent;

            return (
              <div
                key={feature.title}
                className="group flex h-full flex-col rounded-lg border border-gray-100 bg-white p-4 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative mb-5 flex h-40 items-center justify-center overflow-hidden rounded-lg text-primary">
                  <Illustration
                    aria-hidden="true"
                    className="h-20 w-20 stroke-[1.7] transition-transform duration-300 group-hover:scale-105"
                  />
                  <Accent
                    aria-hidden="true"
                    className={`absolute stroke-[1.7] ${feature.accentPosition}`}
                  />
                  {feature.title === "Value your car" ? (
                    <>
                      <span className="absolute right-12 top-7 flex h-8 w-8 items-center justify-center rounded-full border-2 border-current text-sm font-semibold">
                        $
                      </span>
                      <span className="absolute right-8 top-16 flex h-8 w-8 items-center justify-center rounded-full border-2 border-current text-sm font-semibold">
                        $
                      </span>
                    </>
                  ) : null}
                  {feature.title === "Financing" ? (
                    <>
                      <span className="absolute right-16 top-6 flex h-8 w-8 items-center justify-center rounded-full border-2 border-current text-sm font-semibold">
                        $
                      </span>
                      <span className="absolute left-11 bottom-8 flex h-8 w-8 items-center justify-center rounded-full border-2 border-current text-sm font-semibold">
                        $
                      </span>
                    </>
                  ) : null}
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
