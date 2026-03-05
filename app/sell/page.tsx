import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { Shield, Clock, DollarSign, CheckCircle2 } from "lucide-react";

const sellingOptions = [
  {
    title: "Sell Privately",
    description:
      "List your car on Autolist and reach millions of potential buyers. You set the price and handle the sale.",
    image: "/sample-car-1.jpg",
    features: [
      "Get the best price",
      "Reach millions of buyers",
      "Full control over the sale",
    ],
    cta: "Start Advertisement",
    href: "/sell/listing",
  },
  {
    title: "Sell to a Dealer",
    description:
      "Get instant offers from verified dealers. Fast, convenient, and hassle-free selling experience.",
    image: "/sample-car-2.jpg",
    features: [
      "Fast & convenient",
      "No advertising needed",
      "Safe & secure transaction",
    ],
    cta: "Get Dealer Offers",
    href: "/sell/dealer",
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
      </main>

      <Footer />
    </div>
  );
}
