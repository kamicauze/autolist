import Link from "next/link";

const brands = [
  { name: "Land Rover", slug: "land-rover" },
  { name: "KIA", slug: "kia" },
  { name: "Toyota", slug: "toyota" },
  { name: "Jeep", slug: "jeep" },
  { name: "Mercedes", slug: "mercedes" },
  { name: "Subaru", slug: "subaru" },
  { name: "Ford", slug: "ford" },
  { name: "BMW", slug: "bmw" },
];

export function BrandLogos() {
  return (
    <section className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="h5 text-center mb-8">What would you like to find?</h2>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/search?make=${brand.slug}`}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <span className="text-xs md:text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                  {brand.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
