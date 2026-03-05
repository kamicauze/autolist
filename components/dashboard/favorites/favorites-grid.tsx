"use client";

import { Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavoriteVehicle {
  id: string;
  title: string;
  price: number;
  year: number;
  mileage: string;
  fuel: string;
  transmission: string;
  location: string;
}

const SAMPLE_FAVORITES: FavoriteVehicle[] = [
  { id: "1", title: "2022 Toyota Land Cruiser", price: 12500000, year: 2022, mileage: "25,000 km", fuel: "Diesel", transmission: "Automatic", location: "Nairobi" },
  { id: "2", title: "2021 Mercedes-Benz GLE", price: 9800000, year: 2021, mileage: "18,000 km", fuel: "Petrol", transmission: "Automatic", location: "Mombasa" },
  { id: "3", title: "2020 BMW X5", price: 8500000, year: 2020, mileage: "32,000 km", fuel: "Diesel", transmission: "Automatic", location: "Nairobi" },
  { id: "4", title: "2019 Range Rover Sport", price: 7800000, year: 2019, mileage: "45,000 km", fuel: "Diesel", transmission: "Automatic", location: "Kisumu" },
  { id: "5", title: "2022 Audi Q7", price: 11000000, year: 2022, mileage: "12,000 km", fuel: "Petrol", transmission: "Automatic", location: "Nairobi" },
  { id: "6", title: "2021 Porsche Cayenne", price: 14500000, year: 2021, mileage: "8,000 km", fuel: "Petrol", transmission: "Automatic", location: "Nairobi" },
];

function formatKES(price: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(price);
}

export function FavoritesGrid() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Favorites</h1>
        <p className="text-sm text-muted-foreground">Vehicles you&apos;ve saved for later</p>
      </div>

      {SAMPLE_FAVORITES.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-sm text-muted-foreground">No favorites yet. Browse listings and save the ones you like.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {SAMPLE_FAVORITES.map((vehicle) => (
            <div key={vehicle.id} className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="relative aspect-[16/10] bg-gray-100">
                <button className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm">
                  <Heart className="h-4 w-4 fill-current" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-foreground line-clamp-1">{vehicle.title}</h3>
                <p className="mt-1 text-lg font-bold text-primary">{formatKES(vehicle.price)}</p>
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <span>{vehicle.mileage}</span>
                  <span>{vehicle.fuel}</span>
                  <span>{vehicle.transmission}</span>
                  <span>{vehicle.location}</span>
                </div>
                <Button size="sm" variant="outline" className="mt-3 w-full gap-2">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Chat
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
