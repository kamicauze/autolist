import Link from "next/link";
import { Search, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTACards() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Looking to buy */}
          <div className="bg-primary rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Are you looking for a vehicle?</h3>
              <p className="text-white/80 mb-6">
                Browse through thousands of verified listings to find your perfect
                vehicle at the best price.
              </p>
              <Button
                asChild
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
              >
                <Link href="/search">Browse Listings</Link>
              </Button>
            </div>
          </div>

          {/* Looking to sell */}
          <div className="bg-secondary rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Do you want to sell a vehicle?</h3>
              <p className="text-white/80 mb-6">
                List your vehicle for free and reach thousands of potential buyers
                across Kenya.
              </p>
              <Button
                asChild
                variant="secondary"
                className="bg-white text-secondary hover:bg-white/90"
              >
                <Link href="/sell">Sell Your Vehicle</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
