import Image from "next/image";
import { Search, GitCompare, Handshake, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search & Filter",
    description:
      "Users browse cars by location, make, model, price, year, mileage, or use smart search to quickly find what fits their needs.",
    highlighted: false,
  },
  {
    icon: GitCompare,
    title: "Compare & Decide",
    description:
      "They view car details (photos, specs, price, seller info), compare listings, save favorites, or get recommendations.",
    highlighted: true,
  },
  {
    icon: Handshake,
    title: "Connect & Transact",
    description:
      "Users contact the dealer or seller directly to book a viewing, negotiate, and complete the purchase or sale.",
    highlighted: false,
  },
];

const stats = [
  { label: "Proven Expertise", position: "top-right" },
  { label: "1 Million Visits Per Day", position: "middle" },
  { label: "7,800 Sellers", position: "bottom" },
];

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-[28px] sm:text-[30px] font-medium text-[#24272c] mb-4">
              How Autolist works
            </h2>
            <p className="text-[#696665] text-sm leading-relaxed mb-10 max-w-[555px]">
              Autolist connects buyers and sellers through smart search, verified listings, transparent pricing, and direct communication for faster, confident vehicle transactions nationwide.
            </p>

            <div className="space-y-4">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className={`bg-white rounded-2xl p-6 flex gap-5 transition-shadow ${
                      step.highlighted
                        ? "shadow-[0px_30px_60px_0px_rgba(0,0,0,0.1)]"
                        : ""
                    }`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-[60px] h-[60px] rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-medium text-[#24272c] text-lg mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[#696665] text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Content - Images with floating badges */}
          <div className="relative h-[500px] lg:h-[700px]">
            {/* First Image - Person with keys */}
            <div className="absolute left-0 top-0 w-[280px] sm:w-[320px] lg:w-[410px] h-[400px] sm:h-[480px] lg:h-[593px] rounded-3xl overflow-hidden shadow-xl">
              <Image
                src="/sample-car-1.jpg"
                alt="Mercedes sedan for sale"
                fill
                className="object-cover"
              />
            </div>

            {/* Second Image - White BMW */}
            <div className="absolute right-0 sm:right-[-20px] lg:right-[-60px] top-[180px] sm:top-[200px] lg:top-[255px] w-[240px] sm:w-[300px] lg:w-[410px] h-[320px] sm:h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-[0px_30px_60px_0px_rgba(0,0,0,0.1)]">
              <Image
                src="/sample-car-2.jpg"
                alt="White Mercedes E-Class"
                fill
                className="object-cover"
              />
            </div>

            {/* Floating Badge - Proven Expertise */}
            <div className="absolute right-0 sm:right-[-40px] lg:right-[-80px] top-[60px] sm:top-[80px] lg:top-[91px] bg-white rounded-full shadow-[0px_30px_60px_0px_rgba(0,0,0,0.1)] px-5 py-4 flex items-center gap-3 z-10">
              <CheckCircle className="w-[30px] h-[30px] text-primary fill-primary/20" />
              <span className="font-semibold text-[#1c1c24] text-base sm:text-lg whitespace-nowrap">
                Proven Expertise
              </span>
            </div>

            {/* Floating Badge - 1 Million Visits */}
            <div className="absolute left-[40px] sm:left-[60px] lg:left-[62px] top-[280px] sm:top-[320px] lg:top-[356px] bg-white rounded-full shadow-[0px_30px_60px_0px_rgba(0,0,0,0.1)] px-5 py-4 flex items-center gap-3 z-10">
              <CheckCircle className="w-[30px] h-[30px] text-primary fill-primary/20" />
              <span className="font-semibold text-[#1c1c24] text-base sm:text-lg whitespace-nowrap">
                1 Million Visits Per Day
              </span>
            </div>

            {/* Floating Badge - 7,800 Sellers */}
            <div className="absolute left-[60px] sm:left-[80px] lg:left-[95px] bottom-[-20px] sm:bottom-[-30px] lg:bottom-[-40px] bg-white rounded-full shadow-[0px_30px_60px_0px_rgba(0,0,0,0.1)] px-5 py-4 flex items-center gap-3 z-10">
              <CheckCircle className="w-[30px] h-[30px] text-primary fill-primary/20" />
              <span className="font-semibold text-[#24272c] text-base sm:text-lg whitespace-nowrap">
                7,800 Sellers
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
