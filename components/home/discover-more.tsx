import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "Car Insurance",
    description:
      "Protect your next vehicle with flexible cover options built for local drivers.",
    buttonText: "Get insured",
    href: "/insurance",
    image: "/sample-car-1.jpg",
  },
  {
    title: "Value your car",
    description:
      "Join thousands who value their vehicle with Autolist.",
    buttonText: "Value your car",
    href: "/valuation",
    image: "/sample-car-2.jpg",
  },
  {
    title: "Financing",
    description:
      "Fill out our credit approval form for your next used vehicle loan.",
    buttonText: "Apply now",
    href: "/calculator",
    image: "/sample-car-3.jpg",
  },
  {
    title: "Car Importation",
    description:
      "Let experts help you in importing a car of your choice.",
    buttonText: "Inquire now",
    href: "/import-inquiry",
    image: "/sample-car-4.jpg",
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
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col overflow-hidden rounded-2xl"
            >
              {/* Image */}
              <div className="relative h-[200px] overflow-hidden rounded-2xl">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col pt-4">
                <h3 className="mb-1.5 text-base font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mb-4 flex-grow text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
                <Link
                  href={feature.href}
                  className="inline-flex w-fit items-center rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary hover:text-primary"
                >
                  {feature.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
