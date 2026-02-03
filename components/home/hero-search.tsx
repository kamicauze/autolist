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
import { MapPin, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { FilterSheet } from "@/components/search/filter-sheet";

const carModels = [
  { value: "any", label: "Any models" },
  { value: "camry", label: "Camry" },
  { value: "corolla", label: "Corolla" },
  { value: "x5", label: "X5" },
  { value: "3-series", label: "3 Series" },
  { value: "c-class", label: "C-Class" },
  { value: "civic", label: "Civic" },
  { value: "accord", label: "Accord" },
];

const bodyTypes = [
  { value: "any", label: "Body" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "hatchback", label: "Hatchback" },
  { value: "pickup", label: "Pickup" },
  { value: "coupe", label: "Coupe" },
  { value: "wagon", label: "Station Wagon" },
  { value: "van", label: "Van" },
];

const priceRanges = [
  { value: "any", label: "Price" },
  { value: "500000", label: "Under Ksh 500K" },
  { value: "1000000", label: "Under Ksh 1M" },
  { value: "2000000", label: "Under Ksh 2M" },
  { value: "5000000", label: "Under Ksh 5M" },
  { value: "10000000", label: "Under Ksh 10M" },
];

export function HeroSearch() {
  const router = useRouter();
  const [location, setLocation] = React.useState("");
  const [model, setModel] = React.useState("any");
  const [bodyType, setBodyType] = React.useState("any");
  const [price, setPrice] = React.useState("any");
  const [quickSearch, setQuickSearch] = React.useState("");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (model && model !== "any") params.set("model", model);
    if (bodyType && bodyType !== "any") params.set("bodyType", bodyType);
    if (price && price !== "any") params.set("maxPrice", price);

    router.push(`/search?${params.toString()}`);
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(quickSearch)}`);
    }
  };

  return (
    <section className="relative h-[500px] md:h-[527px]">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/sample-car-4.jpg')`,
        }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-8">
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-semibold text-white text-center leading-tight mb-4">
            New mode BMW awaits you
          </h1>
          {/* Subtitle */}
          <p className="text-lg sm:text-xl font-semibold text-white/90 text-center">
            Find the perfect vehicle match for you, and drive smiling
          </p>
        </div>

        {/* Search Section */}
        <div className="px-4 sm:px-6 lg:px-8 pb-8 md:pb-0 md:-mb-[47px] relative z-10">
          <div className="max-w-[1335px] mx-auto">
            {/* Quick Search - positioned above main search on desktop */}
            <div className="flex justify-end mb-4">
              <form onSubmit={handleQuickSearch} className="relative">
                <div className="flex items-center bg-white border border-[#d1d5dc] rounded-[10px] h-[44px] w-full sm:w-[318px]">
                  <Sparkles className="w-4 h-4 text-[#364153] ml-4" />
                  <input
                    type="text"
                    placeholder="Quick search"
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm text-[#364153] placeholder:text-[#364153] bg-transparent outline-none"
                  />
                  <span className="bg-[#f3f4f6] border border-[#d1d5dc] rounded px-2 py-0.5 text-xs text-[#364153] mr-2">
                    NEW
                  </span>
                  <button type="submit" className="mr-4">
                    <Search className="w-4 h-4 text-[#364153]" />
                  </button>
                </div>
              </form>
            </div>

            {/* Main Search Bar */}
            <form onSubmit={handleSearch}>
              <div className="bg-white rounded-2xl shadow-[0px_4px_26px_0px_rgba(66,71,76,0.08)] p-5 md:p-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-3 items-stretch md:items-center">
                  {/* Location Input */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center border border-[#ededed] rounded-[14px] h-[50px] px-4">
                      <MapPin className="w-4 h-4 text-[#717182] mr-2 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="flex-1 text-sm text-[#717182] placeholder:text-[#717182] bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Models Dropdown */}
                  <div className="flex-1 min-w-0">
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="h-[50px] border-[#ededed] rounded-[14px] text-[#696665] text-sm">
                        <SelectValue placeholder="Any models" />
                      </SelectTrigger>
                      <SelectContent>
                        {carModels.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Body Dropdown */}
                  <div className="flex-1 min-w-0">
                    <Select value={bodyType} onValueChange={setBodyType}>
                      <SelectTrigger className="h-[50px] border-[#ededed] rounded-[14px] text-[#696665] text-sm">
                        <SelectValue placeholder="Body" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyTypes.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Dropdown */}
                  <div className="flex-1 min-w-0">
                    <Select value={price} onValueChange={setPrice}>
                      <SelectTrigger className="h-[50px] border-[#ededed] rounded-[14px] text-[#696665] text-sm">
                        <SelectValue placeholder="Price" />
                      </SelectTrigger>
                      <SelectContent>
                        {priceRanges.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filters Button */}
                  <button
                    type="button"
                    onClick={() => setIsFilterSheetOpen(true)}
                    className="flex items-center justify-center gap-2 h-[48px] px-4 text-primary hover:text-primary/80 transition-colors"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    <span className="text-base">Filters</span>
                  </button>

                  {/* Search Button */}
                  <Button
                    type="submit"
                    className="h-[50px] px-6 bg-primary hover:bg-primary/90 text-white rounded-[14px] text-base font-medium"
                  >
                    Search
                    <Search className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <FilterSheet
        open={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
        totalCount={0}
        initialFilters={{
          model: model !== "any" ? model : "",
          maxPrice: price !== "any" ? price : "",
        }}
      />
    </section>
  );
}
