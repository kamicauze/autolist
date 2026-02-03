import Link from "next/link";
import { ArrowUpDown, Calculator } from "lucide-react";

const services = [
  {
    icon: ArrowUpDown,
    title: "Compare vehicles",
    description:
      "Compare specifications, features, and prices of different vehicles side by side to make an informed decision.",
    href: "/compare",
  },
  {
    icon: Calculator,
    title: "Vehicle Affordability Calculator",
    description:
      "Calculate how much car you can afford based on your monthly budget, down payment, and preferred loan terms.",
    href: "/tools/affordability",
  },
];

export function ServicesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.title}
                href={service.href}
                className="group flex items-start gap-4 bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors border border-gray-100"
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
