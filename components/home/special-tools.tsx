import Link from "next/link";
import { Wrench, Calculator, PiggyBank, TrendingUp } from "lucide-react";

const tools = [
  {
    icon: Wrench,
    title: "Autocare calculator",
    description:
      "Estimate maintenance and service costs for any vehicle to plan your budget.",
    href: "/tools/autocare",
    iconBg: "bg-brand-tint",
    iconColor: "text-primary",
  },
  {
    icon: Calculator,
    title: "Monthly payment calculator",
    description:
      "Calculate your monthly car payments based on price, down payment, and interest rate.",
    href: "/tools/loan-calculator",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    icon: PiggyBank,
    title: "Car affordability",
    description:
      "Find out how much car you can afford based on your income and expenses.",
    href: "/tools/affordability",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    icon: TrendingUp,
    title: "Value your vehicle",
    description:
      "Get an instant market valuation for your car using real-time pricing data.",
    href: "/tools/valuation",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
];

export function SpecialTools() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Special tools
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl ${tool.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {tool.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {tool.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
