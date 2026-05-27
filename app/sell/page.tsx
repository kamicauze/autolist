import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { Shield, Clock, DollarSign, CheckCircle2, Star } from "lucide-react";

const sellingOptions = [
  {
    title: "Private Seller Account",
    description:
      "List your own vehicle on Autolist, control the asking price, and manage enquiries directly as an individual seller.",
    image: "/sample-car-1.jpg",
    features: [
      "Get the best price",
      "Reach millions of buyers",
      "Full control over the sale",
    ],
    cta: "List as an individual",
    href: "/register?role=seller&next=/dashboard/listings/new",
  },
  {
    title: "Dealer Account",
    description:
      "Register a dealership account for verified inventory publishing, team workflows, and managed dealer enquiries across multiple listings.",
    image: "/sample-car-2.jpg",
    features: [
      "Fast & convenient",
      "No advertising needed",
      "Safe & secure transaction",
    ],
    cta: "Register dealership",
    href: "/register?role=dealer",
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Trusted & Secure",
    description:
      "All transactions are protected. Verified buyers and secure payment processing ensure peace of mind.",
  },
  {
    icon: Clock,
    title: "Sell Faster",
    description:
      "Your listing reaches thousands of active buyers daily. Most cars sell within the first week.",
  },
  {
    icon: DollarSign,
    title: "Best Value",
    description:
      "Our market insights help you price competitively. Get the best possible value for your vehicle.",
  },
];

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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <PageHero
          label="SELL YOUR CAR"
          heading="Sell your car your way with Autolist"
        />

        {/* Selling Options Cards */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Choose How to Sell Your Car</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Select the account path that matches your role. Individual sellers and dealer teams follow different workflows after sign-up.
            </p>
          </div>
          <div className="grid gap-6 md:gap-8 md:grid-cols-2">
            {sellingOptions.map((option) => (
              <div
                key={option.title}
                className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
              >
                {/* Card Image */}
                <div className="relative h-[200px] sm:h-[240px] overflow-hidden">
                  <Image
                    src={option.image}
                    alt={option.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6">
                  <h3 className="text-xl font-bold text-foreground">
                    {option.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>

                  {/* Features List */}
                  <ul className="mt-4 space-y-2.5">
                    {option.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2.5 text-sm text-foreground"
                      >
                        <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    asChild
                    variant="secondary"
                    className="mt-5 w-full rounded-[10px] bg-gray-100 text-foreground font-semibold hover:bg-gray-200"
                  >
                    <Link href={option.href}>{option.cta}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Sell with Autolist */}
        <section className="bg-gray-50 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
              Why Sell with Autolist?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              Join thousands of sellers who trust Autolist to get the best deals
              for their vehicles.
            </p>

            <div className="mt-10 grid gap-6 sm:gap-8 sm:grid-cols-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex flex-col items-center text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">What Our Customers Say</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="rounded-xl border border-border bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-1 text-primary">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{testimonial.quote}</p>
                <p className="mt-4 text-sm font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
