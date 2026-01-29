"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconSearch } from "@/components/ui/icons";

const carMakes = [
  { value: "any", label: "Any Make" },
  { value: "toyota", label: "Toyota" },
  { value: "bmw", label: "BMW" },
  { value: "mercedes", label: "Mercedes-Benz" },
  { value: "nissan", label: "Nissan" },
  { value: "honda", label: "Honda" },
  { value: "mazda", label: "Mazda" },
  { value: "subaru", label: "Subaru" },
  { value: "volkswagen", label: "Volkswagen" },
  { value: "audi", label: "Audi" },
  { value: "land-rover", label: "Land Rover" },
  { value: "jeep", label: "Jeep" },
  { value: "ford", label: "Ford" },
  { value: "hyundai", label: "Hyundai" },
  { value: "kia", label: "Kia" },
  { value: "mitsubishi", label: "Mitsubishi" },
];

const bodyTypes = [
  { value: "any", label: "Any Body Type" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "hatchback", label: "Hatchback" },
  { value: "pickup", label: "Pickup" },
  { value: "coupe", label: "Coupe" },
  { value: "wagon", label: "Station Wagon" },
  { value: "van", label: "Van" },
  { value: "convertible", label: "Convertible" },
];

const priceRanges = [
  { value: "any", label: "Min Price" },
  { value: "500000", label: "Ksh 500,000" },
  { value: "1000000", label: "Ksh 1,000,000" },
  { value: "2000000", label: "Ksh 2,000,000" },
  { value: "3000000", label: "Ksh 3,000,000" },
  { value: "5000000", label: "Ksh 5,000,000" },
];

const maxPriceRanges = [
  { value: "any", label: "Max Price" },
  { value: "1000000", label: "Ksh 1,000,000" },
  { value: "2000000", label: "Ksh 2,000,000" },
  { value: "3000000", label: "Ksh 3,000,000" },
  { value: "5000000", label: "Ksh 5,000,000" },
  { value: "10000000", label: "Ksh 10,000,000" },
  { value: "20000000", label: "Ksh 20,000,000+" },
];

export function HeroSearch() {
  const router = useRouter();
  const [category, setCategory] = React.useState("buy");
  const [make, setMake] = React.useState("any");
  const [model, setModel] = React.useState("");
  const [bodyType, setBodyType] = React.useState("any");
  const [minPrice, setMinPrice] = React.useState("any");
  const [maxPrice, setMaxPrice] = React.useState("any");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (make && make !== "any") params.set("make", make);
    if (model) params.set("model", model);
    if (bodyType && bodyType !== "any") params.set("bodyType", bodyType);
    if (minPrice && minPrice !== "any") params.set("minPrice", minPrice);
    if (maxPrice && maxPrice !== "any") params.set("maxPrice", maxPrice);
    if (category !== "buy") params.set("category", category);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative bg-primary py-16 md:py-24">
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Find Your Perfect Vehicle
          </h1>
          <p className="text-lg text-white/80">
            Browse thousands of cars, trucks, motorcycles, and more
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-xl p-6 max-w-5xl mx-auto">
          {/* Category Tabs */}
          <Tabs value={category} onValueChange={setCategory} className="mb-6">
            <TabsList className="grid w-full grid-cols-5 max-w-md">
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="pre-order">Pre-Order</TabsTrigger>
              <TabsTrigger value="accessories">Accessories</TabsTrigger>
              <TabsTrigger value="spare">Spare</TabsTrigger>
              <TabsTrigger value="truck">Truck</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Fields */}
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
              <Select value={make} onValueChange={setMake}>
                <SelectTrigger className="md:col-span-1">
                  <SelectValue placeholder="Make" />
                </SelectTrigger>
                <SelectContent>
                  {carMakes.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <input
                type="text"
                placeholder="Model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="flex h-12 w-full rounded-lg border border-input bg-background px-4 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:col-span-1"
              />

              <Select value={bodyType} onValueChange={setBodyType}>
                <SelectTrigger className="md:col-span-1">
                  <SelectValue placeholder="Body Type" />
                </SelectTrigger>
                <SelectContent>
                  {bodyTypes.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={minPrice} onValueChange={setMinPrice}>
                <SelectTrigger className="md:col-span-1">
                  <SelectValue placeholder="Min Price" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={maxPrice} onValueChange={setMaxPrice}>
                <SelectTrigger className="md:col-span-1">
                  <SelectValue placeholder="Max Price" />
                </SelectTrigger>
                <SelectContent>
                  {maxPriceRanges.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit" className="h-12 md:col-span-1 gap-2">
                <IconSearch className="h-5 w-5" />
                Search
              </Button>
            </div>
          </form>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-border text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">10,000+</strong> Vehicles
            </span>
            <span>
              <strong className="text-foreground">500+</strong> Dealers
            </span>
            <span>
              <strong className="text-foreground">50+</strong> Cities
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
