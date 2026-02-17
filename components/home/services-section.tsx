import Link from "next/link";
import { ArrowUpDown, ArrowRight, Calculator } from "lucide-react";

const services = [
  {
    icon: ArrowUpDown,
    title: "Compare vehicle",
    description:
      "Save time as you no longer need to visit multiple store to find the right vehicle.",
    href: "/compare",
    buttonText: "Compare",
  },
  {
    icon: Calculator,
    title: "Autoloan calculator",
    description:
      "Estimate monthly vehicle loan repayments quickly",
    href: "/tools/affordability",
    buttonText: "Calculate loan",
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
              <div
                key={service.title}
                className="bg-gray-50 rounded-xl p-8 border border-gray-100"
              >
                <h3 className="font-semibold text-gray-900 text-xl mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {service.description}
                </p>
                <Link
                  href={service.href}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  {service.buttonText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
