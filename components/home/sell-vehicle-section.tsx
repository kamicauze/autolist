import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, User } from "lucide-react";

export function SellVehicleSection() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Sell your vehicle privately or to a dealer
          </h2>
          <p className="text-gray-600 mt-2">only on Autolist</p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left - Sell to Dealer */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">
              Sell vehicle to a dealer
            </h3>
            <p className="text-gray-600 text-sm mb-4 max-w-xs">
              Get competitive offers from verified dealers. Fast, secure, and hassle-free.
            </p>
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              <Link href="/sell/dealer">Get dealer offers</Link>
            </Button>
          </div>

          {/* Center - Car Image */}
          <div className="relative h-[250px] sm:h-[300px] order-first lg:order-none">
            <Image
              src="/sample-car-1.jpg"
              alt="Car for sale"
              fill
              className="object-contain"
            />
          </div>

          {/* Right - Sell Privately */}
          <div className="flex flex-col items-center text-center lg:items-end lg:text-right">
            <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
              <User className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">
              Sell vehicle privately
            </h3>
            <p className="text-gray-600 text-sm mb-4 max-w-xs">
              List your car for free and reach thousands of buyers directly.
            </p>
            <Button asChild className="bg-secondary hover:bg-secondary/90 text-white">
              <Link href="/sell">List your car</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
