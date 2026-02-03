import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Car, Calculator, DollarSign } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Browse inventory",
    description:
      "Discover your perfect car from our extensive listing collection. Filter by make, model, price and more.",
    buttonText: "Explore cars",
    href: "/search",
    buttonVariant: "default" as const,
  },
  {
    icon: Car,
    title: "Sell a vehicle",
    description:
      "List your car for free and connect with thousands of potential buyers across Kenya.",
    buttonText: "Learn more",
    href: "/sell",
    buttonVariant: "outline" as const,
  },
  {
    icon: Calculator,
    title: "Financing",
    description:
      "Explore flexible financing options. Calculate your monthly payments and find the best rates.",
    buttonText: "Learn more",
    href: "/financing",
    buttonVariant: "outline" as const,
  },
  {
    icon: DollarSign,
    title: "Value your vehicle",
    description:
      "Get an instant estimate of your car's worth using our valuation tool powered by market data.",
    buttonText: "Learn more",
    href: "/value",
    buttonVariant: "outline" as const,
  },
];

export function DiscoverMore() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Discover more from Autolist
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to buy, sell, or finance your next vehicle in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                  {feature.description}
                </p>

                {/* Button */}
                <Button
                  asChild
                  variant={feature.buttonVariant}
                  className={
                    feature.buttonVariant === "default"
                      ? "w-full"
                      : "w-full border-primary text-primary hover:bg-primary hover:text-white"
                  }
                >
                  <Link href={feature.href}>{feature.buttonText}</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
