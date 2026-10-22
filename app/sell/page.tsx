import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Illustration3D } from "@/components/ui/icon-3d";
import {
  ShieldCheck,
  Clock,
  HandCoins,
  Check,
  Star,
  ArrowRight,
} from "lucide-react";

const sellingOptions = [
  {
    title: "Selling your own car?",
    description:
      "List your car as a private seller, set your asking price and speak directly with interested buyers.",
    image: "/images/sell-private.webp",
    imageAlt: "A private seller beside their car",
    features: [
      "Set your own asking price",
      "Manage your listing and enquiries",
      "Or request offers from approved dealers",
    ],
    cta: "List your car",
    href: "/register?role=seller&next=/dashboard/listings/new",
  },
  {
    title: "Selling as a dealership?",
    description:
      "Create a dealer account to showcase your stock, manage your team and connect with buyers across Kenya.",
    image: "/images/sell-dealer.webp",
    imageAlt: "A dealership team helping a customer with a vehicle",
    features: [
      "Publish and manage your inventory",
      "Give your sales team access",
      "Manage buyer enquiries in one place",
    ],
    cta: "Register your dealership",
    href: "/register?role=dealer",
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    asset: "shield-check",
    title: "Stay in control",
    description:
      "Choose how you sell, set your price and manage enquiries directly.",
  },
  {
    icon: Clock,
    asset: "stopwatch-fast",
    title: "Simple to list",
    description:
      "Add your vehicle details and photos, then submit your listing for review.",
  },
  {
    icon: HandCoins,
    asset: "money-value",
    title: "More ways to sell",
    description:
      "Reach marketplace buyers or request offers from approved dealers.",
  },
] as const;

const testimonials = [
  {
    name: "Jacob Mwangi",
    role: "Private Seller",
    quote:
      "I listed my car in minutes and got serious buyers the same week. The process felt straightforward and safe.",
  },
  {
    name: "Lynn Achieng",
    role: "Dealer",
    quote:
      "Autolist brings consistent leads and serious buyers. It has become a key channel for our dealership stock.",
  },
  {
    name: "Brian Mutiso",
    role: "Seller",
    quote:
      "The valuation and listing tips helped me price correctly. I sold faster than I expected and with zero hassle.",
  },
];

export default function SellPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden rounded-2xl bg-gray-900">
            <Image
              src="/images/sell-hero.webp"
              alt="A seller and buyer beside a car"
              fill
              priority
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="-z-20 object-cover object-[65%_center] md:object-center"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-950/90 via-gray-950/55 to-gray-950/10" />
            <div className="flex min-h-[380px] flex-col items-start justify-center px-6 py-10 sm:min-h-[420px] sm:px-10 md:min-h-[454px] md:py-14 lg:px-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/90">
                Sell with Autolist
              </p>
              <h1 className="mt-4 max-w-lg text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Sell your car, your way.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-white/90">
                List privately, connect with buyers or get offers from approved
                dealers. Choose the route that works for you.
              </p>
              <Button asChild className="mt-7">
                <Link href="#selling-options">
                  Choose how to sell
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Why sell with Autolist?
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Practical tools to help you take the next step with your
                vehicle.
              </p>
            </div>
            <div className="grid gap-7 sm:grid-cols-3">
              {benefits.map(({ icon, asset, title, description }) => (
                <div key={title}>
                  <Illustration3D
                    asset={asset}
                    fallbackIcon={icon}
                    size="xl"
                    className="h-16 w-16"
                  />
                  <h3 className="mt-4 text-base font-semibold text-gray-900">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="selling-options"
          className="scroll-mt-24 border-y border-gray-200 bg-gray-50 py-12 md:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Choose how to sell your car
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              An individual seller account is for your own vehicle. A dealer
              account is for a vehicle business.
            </p>
            <div className="mt-8 grid gap-7 md:grid-cols-2">
              {sellingOptions.map((option) => (
                <article
                  key={option.title}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <div className="relative h-[220px] sm:h-[260px]">
                    <Image
                      src={option.image}
                      alt={option.imageAlt}
                      fill
                      sizes="(min-width: 1280px) 592px, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 sm:p-7">
                    <h3 className="text-xl font-bold text-gray-900">
                      {option.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {option.description}
                    </p>
                    <ul className="mt-5 space-y-3">
                      {option.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="mt-6">
                      <Link href={option.href}>{option.cta}</Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-7 flex flex-col items-start justify-between gap-5 rounded-xl border border-primary/20 bg-white p-6 sm:flex-row sm:items-center sm:p-7">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Prefer to sell directly to a dealer?
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                  Private sellers can submit their car for offers from approved
                  dealers. Review offers and choose whether to accept.
                </p>
              </div>
              <Button asChild variant="outline" className="shrink-0">
                <Link href="/sell/dealer">
                  Get dealer offers
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Customer reviews
          </h2>
          <div className="mt-8 grid gap-7 sm:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="border-t border-gray-200 pt-5"
              >
                <div
                  className="flex gap-1 text-primary"
                  aria-label="5 out of 5 stars"
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      aria-hidden="true"
                      className="h-4 w-4 fill-current"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-7 text-gray-600">
                  “{testimonial.quote}”
                </blockquote>
                <p className="mt-5 text-sm font-semibold text-gray-900">
                  {testimonial.name}
                </p>
                <p className="mt-1 text-xs text-gray-500">{testimonial.role}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
